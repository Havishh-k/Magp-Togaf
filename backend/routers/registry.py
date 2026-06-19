from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from schemas.registry import RegistryItem, SuspendRequest
from services.registry_service import get_systems, get_system, promote_system, suspend_system, reactivate_system, fast_forward_system

@router.post("/{system_id}/fast-forward", response_model=RegistryItem)
def api_fast_forward(system_id: str, db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    sys = fast_forward_system(db, system_id, admin.id)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    return sys
from models.user import User

router = APIRouter(prefix="/registry", tags=["registry"])

def require_ministry(current_user: User = Depends(get_current_user)):
    if current_user.role != "ministry":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/", response_model=List[RegistryItem])
def api_list_systems(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_systems(db, current_user)

@router.get("/{system_id}", response_model=RegistryItem)
def api_get_system(system_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sys = get_system(db, system_id, current_user)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    return sys

@router.get("/{system_id}/bias")
def api_get_system_bias(system_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Need to verify access via get_system
    sys = get_system(db, system_id, current_user)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    
    from models.bias_check_result import BiasCheckResult
    bias = db.query(BiasCheckResult).filter(BiasCheckResult.system_id == system_id).order_by(BiasCheckResult.check_run_at.desc()).first()
    return bias

@router.post("/{system_id}/promote", response_model=RegistryItem)
def api_promote(system_id: str, new_status: str, db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    sys = promote_system(db, system_id, new_status, admin.id)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    return sys

@router.post("/{system_id}/suspend", response_model=RegistryItem)
def api_suspend(system_id: str, req: SuspendRequest, db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    sys = suspend_system(db, system_id, req.reason, admin.id)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    return sys

@router.post("/{system_id}/reactivate", response_model=RegistryItem)
def api_reactivate(system_id: str, db: Session = Depends(get_db), admin: User = Depends(require_ministry)):
    sys = reactivate_system(db, system_id, admin.id)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    return sys
