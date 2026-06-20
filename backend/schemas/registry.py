from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RegistryItem(BaseModel):
    id: str
    submission_id: str
    system_name: str
    system_version: str
    vendor_id: str
    lifecycle_status: str
    risk_classification: str
    intended_use_case: str
    target_population: str
    developer_organization: str
    deployment_timeline: Optional[str] = None
    training_data_documentation: Optional[str] = None
    local_validation_evidence: Optional[str] = None
    override_mechanism_documented: bool
    shadow_mode_approved_at: Optional[datetime] = None
    canary_mode_approved_at: Optional[datetime] = None
    production_approved_at: Optional[datetime] = None
    registration_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    suspended_at: Optional[datetime] = None
    suspension_reason: Optional[str] = None

    class Config:
        from_attributes = True

class SuspendRequest(BaseModel):
    reason: str
