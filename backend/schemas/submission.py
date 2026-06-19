from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ExplainabilityFeature(BaseModel):
    feature_name: str
    importance_score: float

class ExplainabilityPayload(BaseModel):
    features: List[ExplainabilityFeature]

class SubmissionDraftCreate(BaseModel):
    system_name: str
    system_version: str
    intended_use_case: str
    target_population: str
    risk_classification: str
    developer_organization: str
    deployment_timeline: Optional[str] = None
    training_data_documentation: Optional[str] = None
    local_validation_evidence: Optional[str] = None
    override_mechanism_documented: bool = False

class SubmissionResponse(SubmissionDraftCreate):
    id: str
    submission_id: str
    vendor_id: str
    lifecycle_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
