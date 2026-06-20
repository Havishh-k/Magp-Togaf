from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from database import get_db
from models.ai_system import AISystem
from schemas.registry import PublicSystemResponse

router = APIRouter(prefix="/public-registry", tags=["public"])

@router.get("/systems", response_model=List[PublicSystemResponse])
def get_public_systems(db: Session = Depends(get_db)):
    # Only return PRODUCTION systems for the public registry
    systems = db.query(AISystem).filter(AISystem.lifecycle_status == "PRODUCTION").all()
    return systems
