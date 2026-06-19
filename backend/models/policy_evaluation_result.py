from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base

class PolicyEvaluationResult(Base):
    __tablename__ = "policy_evaluation_results"

    id = Column(String, primary_key=True)
    system_id = Column(String, ForeignKey("ai_systems.id"), nullable=False, index=True)
    bias_check_id = Column(String, ForeignKey("bias_check_results.id"))
    evaluated_at = Column(DateTime, default=func.now())
    overall_verdict = Column(String, nullable=False)
    policy_version = Column(String, default='1.0', nullable=False)
    rule_results = Column(JSON, nullable=False)
    failed_critical_rules = Column(JSON)
    failed_non_critical_rules = Column(JSON)
    remediation_guidance = Column(String)
    reviewed_by = Column(String, ForeignKey("users.id"))
    review_notes = Column(String)
