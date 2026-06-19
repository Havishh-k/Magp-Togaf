import hashlib
import json
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from models.audit_log import AuditLog
from pydantic import BaseModel
from typing import Optional

class ChainVerificationResult(BaseModel):
    status: str
    message: str
    total_entries: Optional[int] = None
    first_tampered_sequence: Optional[int] = None

def compute_entry_hash(
    sequence_number: int,
    event_type: str,
    system_id: str,
    event_data: dict,
    timestamp: str,
    previous_hash: str
) -> str:
    canonical = json.dumps({
        "sequence_number": sequence_number,
        "event_type": event_type,
        "system_id": system_id,
        "event_data": event_data,
        "timestamp": timestamp,
        "previous_hash": previous_hash
    }, sort_keys=True, separators=(',', ':'))
    
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()

def append_audit_entry(
    db: Session,
    event_type: str,
    event_data: dict,
    actor_type: str,
    system_id: str = None,
    actor_id: str = None,
) -> AuditLog:
    # Get last entry
    last_entry = db.query(AuditLog).order_by(AuditLog.sequence_number.desc()).first()
    
    if last_entry:
        sequence_number = last_entry.sequence_number + 1
        previous_hash = last_entry.entry_hash
    else:
        sequence_number = 1
        previous_hash = '0' * 64
        
    # Generate timestamp
    timestamp_dt = datetime.utcnow()
    timestamp_str = str(timestamp_dt)
    
    entry_hash = compute_entry_hash(
        sequence_number=sequence_number,
        event_type=event_type,
        system_id=system_id,
        event_data=event_data,
        timestamp=timestamp_str,
        previous_hash=previous_hash
    )
    
    new_entry = AuditLog(
        id=uuid.uuid4().hex,
        sequence_number=sequence_number,
        event_type=event_type,
        system_id=system_id,
        actor_id=actor_id,
        actor_type=actor_type,
        event_data=event_data,
        timestamp=timestamp_dt,
        entry_hash=entry_hash,
        previous_hash=previous_hash
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

def verify_chain_integrity(db: Session) -> ChainVerificationResult:
    entries = db.query(AuditLog).order_by(AuditLog.sequence_number).all()
    
    if not entries:
        return ChainVerificationResult(status='EMPTY', message='No audit entries exist')
    
    prev_hash = '0' * 64
    
    for entry in entries:
        expected_hash = compute_entry_hash(
            sequence_number=entry.sequence_number,
            event_type=entry.event_type,
            system_id=entry.system_id,
            event_data=entry.event_data,
            timestamp=str(entry.timestamp),
            previous_hash=prev_hash
        )
        
        if expected_hash != entry.entry_hash:
            return ChainVerificationResult(
                status='TAMPERED',
                message=f'Hash mismatch at sequence #{entry.sequence_number}',
                first_tampered_sequence=entry.sequence_number
            )
        
        prev_hash = entry.entry_hash
    
    return ChainVerificationResult(
        status='INTACT',
        message=f'Chain verified: {len(entries)} entries, all hashes valid',
        total_entries=len(entries)
    )
