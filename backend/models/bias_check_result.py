from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from database import Base

class BiasCheckResult(Base):
    __tablename__ = "bias_check_results"

    id = Column(String, primary_key=True)
    system_id = Column(String, ForeignKey("ai_systems.id"), nullable=False, index=True)
    check_run_at = Column(DateTime, default=func.now())
    overall_status = Column(String, nullable=False)
    subgroup_results = Column(JSON, nullable=False)
    min_disparate_impact_ratio = Column(Float)
    max_equalized_odds_difference = Column(Float)
    max_demographic_parity_difference = Column(Float)
    failed_subgroups = Column(JSON)
    human_readable_summary = Column(String, nullable=False)
    full_report_json = Column(JSON, nullable=False)
