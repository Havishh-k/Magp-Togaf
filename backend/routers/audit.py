from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from models.user import User
from models.audit_log import AuditLog
from services.audit_service import verify_chain_integrity

router = APIRouter(prefix="/audit", tags=["audit"])

def require_ministry(current_user: User = Depends(get_current_user)):
    if current_user.role != "ministry":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/")
def get_global_audit(db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

@router.get("/{system_id}")
def get_system_audit(system_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AuditLog).filter(AuditLog.system_id == system_id).order_by(AuditLog.timestamp.desc()).all()

@router.post("/verify")
def api_verify_chain(db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    res = verify_chain_integrity(db)
    return {
        "valid": res.status == 'INTACT', 
        "message": res.message, 
        "first_tampered_sequence": res.first_tampered_sequence
    }

@router.post("/sabotage")
def api_sabotage_chain(db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    """
    Intentionally corrupts the most recent audit log to demonstrate the tamper-evident cryptographic chain.
    Bypasses SQLAlchemy ORM listeners by using raw SQL.
    """
    from sqlalchemy import text
    
    # Update the details of the most recent log, thereby changing its content
    # Since we bypass ORM, the hash won't be recomputed, and subsequent previous_hash links will break.
    db.execute(text("""
        UPDATE audit_logs 
        SET details = '{"action": "SABOTAGED_RECORD"}' 
        WHERE id = (
            SELECT id FROM audit_logs ORDER BY timestamp DESC LIMIT 1
        )
    """))
    db.commit()
    
    return {"status": "success", "message": "Audit chain sabotaged successfully."}
