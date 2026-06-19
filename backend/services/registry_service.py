from sqlalchemy.orm import Session
from models.ai_system import AISystem
from models.user import User
from datetime import datetime, UTC
from services.audit_service import append_audit_entry

def get_systems(db: Session, user: User):
    if user.role == "ministry":
        return db.query(AISystem).all()
    else:
        return db.query(AISystem).filter(AISystem.vendor_id == user.id).all()

def get_system(db: Session, system_id: str, user: User):
    sys = db.query(AISystem).filter(AISystem.id == system_id).first()
    if sys and user.role != "ministry" and sys.vendor_id != user.id:
        return None
    return sys

def promote_system(db: Session, system_id: str, new_status: str, admin_id: str) -> AISystem:
    sys = db.query(AISystem).filter(AISystem.id == system_id).first()
    if not sys:
        return None
        
    sys.lifecycle_status = new_status
    if new_status == "SHADOW_MODE":
        sys.shadow_mode_approved_at = datetime.now(UTC)
    elif new_status == "CANARY_MODE":
        sys.canary_mode_approved_at = datetime.now(UTC)
    elif new_status == "PRODUCTION":
        sys.production_approved_at = datetime.now(UTC)
        
    db.commit()
    db.refresh(sys)
    
    append_audit_entry(
        db=db,
        event_type="LIFECYCLE_PROMOTED",
        event_data={"new_status": new_status},
        actor_type="MINISTRY",
        system_id=system_id,
        actor_id=admin_id
    )
    return sys

def suspend_system(db: Session, system_id: str, reason: str, admin_id: str) -> AISystem:
    sys = db.query(AISystem).filter(AISystem.id == system_id).first()
    if not sys:
        return None
        
    sys.lifecycle_status = "SUSPENDED"
    sys.suspended_at = datetime.now(UTC)
    sys.suspension_reason = reason
    db.commit()
    db.refresh(sys)
    
    append_audit_entry(
        db=db,
        event_type="SYSTEM_SUSPENDED",
        event_data={"reason": reason},
        actor_type="MINISTRY",
        system_id=system_id,
        actor_id=admin_id
    )
    return sys

def reactivate_system(db: Session, system_id: str, admin_id: str) -> AISystem:
    sys = db.query(AISystem).filter(AISystem.id == system_id).first()
    if not sys:
        return None
        
    sys.lifecycle_status = "PENDING_REVIEW" # Reverts to review state or previous state
    sys.suspended_at = None
    sys.suspension_reason = None
    db.commit()
    db.refresh(sys)
    
    append_audit_entry(
        db=db,
        event_type="SYSTEM_REACTIVATED",
        event_data={"new_status": "PENDING_REVIEW"},
        actor_type="MINISTRY",
        system_id=system_id,
        actor_id=admin_id
    )
    return sys

def fast_forward_system(db: Session, system_id: str, admin_id: str) -> AISystem:
    sys = db.query(AISystem).filter(AISystem.id == system_id).first()
    if not sys:
        return None
        
    from datetime import timedelta
    # Move expiration 1 day into the past to trigger "expired" state
    sys.registration_expires_at = datetime.now(UTC) - timedelta(days=1)
    
    db.commit()
    db.refresh(sys)
    
    # We MUST use append_audit_entry to maintain the cryptographic hash chain
    append_audit_entry(
        db=db,
        event_type="TIME_TRAVEL_SIMULATED",
        event_data={"action": "fast_forward_12_months", "new_expiry": str(sys.registration_expires_at)},
        actor_type="MINISTRY",
        system_id=system_id,
        actor_id=admin_id
    )
    return sys
