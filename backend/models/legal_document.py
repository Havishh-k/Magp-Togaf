from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from database import Base

class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(String, primary_key=True)
    system_id = Column(String, ForeignKey("ai_systems.id"), nullable=False)
    document_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    file_path = Column(String)
    file_name = Column(String)
    uploaded_at = Column(DateTime)
    technology_transfer_obligation_present = Column(Boolean, default=False)
    notes = Column(String)
