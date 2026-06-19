from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from schemas.submission import SubmissionDraftCreate, SubmissionResponse
import schemas.submission
from services.submission_service import create_draft, submit_for_review
from models.user import User

router = APIRouter(prefix="/submission", tags=["submission"])

def run_bias_check_task(system_id: str):
    # Dummy async task execution for bias check
    # Normally this would load predictions, call run_bias_check, then evaluate policy
    print(f"Running background bias check for {system_id}")

@router.post("/draft", response_model=SubmissionResponse)
def api_create_draft(draft: SubmissionDraftCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_draft(db, current_user.id, draft)

@router.post("/{system_id}/submit", response_model=SubmissionResponse)
def api_submit(system_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sys = submit_for_review(db, system_id, current_user.id)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found or access denied")
        
    background_tasks.add_task(run_bias_check_task, sys.id)
    return sys

@router.post("/{system_id}/documents/explainability")
def api_upload_explainability(system_id: str, payload: schemas.submission.ExplainabilityPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from services.registry_service import get_system
    import json
    sys = get_system(db, system_id, current_user)
    if not sys:
        raise HTTPException(status_code=404, detail="System not found")
    
    # Store it in the local_validation_evidence field as JSON for now (or a new field if we want)
    # The prompt just says validate JSON payloads of features and importances. 
    # Let's save it to a local file or just update the DB record if it has a generic JSON column, 
    # but since local_validation_evidence is string we can dump json there.
    sys.local_validation_evidence = json.dumps([f.dict() for f in payload.features])
    db.commit()
    
    return {"status": "success", "message": "Explainability artifact uploaded successfully"}
