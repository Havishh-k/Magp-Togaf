from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class AISystem(Base):
    __tablename__ = "ai_systems"

    id = Column(String, primary_key=True)
    submission_id = Column(String, unique=True, nullable=False)
    system_name = Column(String, nullable=False)
    system_version = Column(String, nullable=False)
    vendor_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    intended_use_case = Column(String, nullable=False)
    risk_classification = Column(String, nullable=False)
    target_population = Column(String, nullable=False)
    developer_organization = Column(String, nullable=False)
    deployment_timeline = Column(String)
    training_data_documentation = Column(String)
    local_validation_evidence = Column(String)
    override_mechanism_documented = Column(Boolean, default=False)
    lifecycle_status = Column(String, default='PENDING_REVIEW', index=True)
    shadow_mode_approved_at = Column(DateTime)
    canary_mode_approved_at = Column(DateTime)
    production_approved_at = Column(DateTime)
    suspended_at = Column(DateTime)
    suspension_reason = Column(String)
    registration_expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
