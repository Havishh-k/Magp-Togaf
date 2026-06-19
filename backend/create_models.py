import os

models_dir = "models"
os.makedirs(models_dir, exist_ok=True)
os.makedirs("data", exist_ok=True)

with open("database.py", "w") as f:
    f.write("""from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from main import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""")

with open(f"{models_dir}/__init__.py", "w") as f:
    f.write("""from database import Base
from .user import User
from .ai_system import AISystem
from .legal_document import LegalDocument
from .explainability_artifact import ExplainabilityArtifact
from .bias_check_result import BiasCheckResult
from .policy_evaluation_result import PolicyEvaluationResult
from .audit_log import AuditLog
from .notification import Notification
""")

with open(f"{models_dir}/user.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    organization = Column(String)
    created_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
""")

with open(f"{models_dir}/ai_system.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
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
""")

with open(f"{models_dir}/legal_document.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
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
""")

with open(f"{models_dir}/explainability_artifact.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey
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
""")

with open(f"{models_dir}/bias_check_result.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON
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
""")

with open(f"{models_dir}/policy_evaluation_result.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
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
""")

with open(f"{models_dir}/audit_log.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True)
    sequence_number = Column(Integer, unique=True, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    system_id = Column(String, ForeignKey("ai_systems.id"), index=True)
    actor_id = Column(String, ForeignKey("users.id"))
    actor_type = Column(String, nullable=False)
    event_data = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=func.now(), index=True)
    entry_hash = Column(String, nullable=False)
    previous_hash = Column(String, nullable=False)
""")

with open(f"{models_dir}/notification.py", "w") as f:
    f.write("""from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    recipient_id = Column(String, ForeignKey("users.id"))
    recipient_role = Column(String)
    notification_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    system_id = Column(String, ForeignKey("ai_systems.id"))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime)

    __table_args__ = (
        Index('idx_notifications_recipient', 'recipient_id', 'is_read'),
    )
""")

print("Database models created successfully.")
