from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from routers.auth import get_current_user
from models.user import User
from services.bias_service import run_stress_test

router = APIRouter(prefix="/bias", tags=["bias"])

def require_ministry(current_user: User = Depends(get_current_user)):
    if current_user.role != "ministry":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

class StressTestPayload(BaseModel):
    # e.g. {"location_type": {"Rural": 5.0, "Urban": 1.0}}
    weights: Dict[str, Dict[str, float]]

@router.post("/stress-test")
def api_stress_test(payload: StressTestPayload, admin: User = Depends(require_ministry)):
    try:
        results = run_stress_test(payload.weights)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
