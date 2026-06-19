from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from database import Base

class ExplainabilityArtifact(Base):
    __tablename__ = "explainability_artifacts"

    id = Column(String, primary_key=True)
    system_id = Column(String, ForeignKey("ai_systems.id"), nullable=False)
    artifact_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=func.now())
    artifact_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=True)
