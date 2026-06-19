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
    created_at: datetime
    updated_at: datetime
    suspended_at: Optional[datetime] = None
    suspension_reason: Optional[str] = None

    class Config:
        from_attributes = True

class SuspendRequest(BaseModel):
    reason: str
