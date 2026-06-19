import uuid
from sqlalchemy.orm import Session
from models.ai_system import AISystem
from schemas.submission import SubmissionDraftCreate
from datetime import datetime, UTC
from services.audit_service import append_audit_entry

def create_draft(db: Session, vendor_id: str, data: SubmissionDraftCreate) -> AISystem:
    sub_id = f"SUB-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}"
    
    new_sys = AISystem(
        id=uuid.uuid4().hex,
        submission_id=sub_id,
        vendor_id=vendor_id,
        system_name=data.system_name,
        system_version=data.system_version,
        intended_use_case=data.intended_use_case,
        risk_classification=data.risk_classification,
        target_population=data.target_population,
        developer_organization=data.developer_organization,
        deployment_timeline=data.deployment_timeline,
        training_data_documentation=data.training_data_documentation,
        local_validation_evidence=data.local_validation_evidence,
        override_mechanism_documented=data.override_mechanism_documented,
        lifecycle_status="DRAFT"
    )
    
    db.add(new_sys)
    db.commit()
    db.refresh(new_sys)
    
    append_audit_entry(
        db=db,
        event_type="DRAFT_CREATED",
        event_data={"submission_id": sub_id},
        actor_type="VENDOR",
        system_id=new_sys.id,
        actor_id=vendor_id
    )
    
    return new_sys

def submit_for_review(db: Session, system_id: str, vendor_id: str) -> AISystem:
    sys = db.query(AISystem).filter(AISystem.id == system_id, AISystem.vendor_id == vendor_id).first()
    if not sys:
        return None
        
    sys.lifecycle_status = "PENDING_REVIEW"
    db.commit()
    db.refresh(sys)
    
    append_audit_entry(
        db=db,
        event_type="SUBMITTED_FOR_REVIEW",
        event_data={"lifecycle_status": "PENDING_REVIEW"},
        actor_type="VENDOR",
        system_id=sys.id,
        actor_id=vendor_id
    )
    
    return sys
