import uuid
from datetime import datetime, UTC
from database import SessionLocal, engine, Base
from models.user import User
from models.ai_system import AISystem
from models.legal_document import LegalDocument
from services.auth_service import get_password_hash
from services.audit_service import append_audit_entry

# Reset DB
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed Users
admin = User(
    id=uuid.uuid4().hex,
    username="admin",
    email="admin@gov.ml",
    password_hash=get_password_hash("password123"),
    role="ministry",
    organization="Ministry of Health",
    is_approved=True
)
vendor = User(
    id=uuid.uuid4().hex,
    username="vendor",
    email="vendor@healthtech.com",
    password_hash=get_password_hash("password123"),
    role="vendor",
    organization="HealthTech Solutions",
    is_approved=True
)
db.add_all([admin, vendor])
db.commit()

# Seed System 1: Draft
sys1 = AISystem(
    id=uuid.uuid4().hex,
    submission_id="SUB-001",
    vendor_id=vendor.id,
    system_name="MalariaDetect Pro",
    system_version="1.0",
    intended_use_case="Malaria screening in rural clinics",
    risk_classification="HIGH",
    target_population="Adults",
    developer_organization="HealthTech Solutions",
    lifecycle_status="DRAFT"
)
db.add(sys1)
db.commit()
append_audit_entry(db, "DRAFT_CREATED", {"submission_id": "SUB-001"}, "VENDOR", sys1.id, vendor.id)

# Seed System 2: Approved
sys2 = AISystem(
    id=uuid.uuid4().hex,
    submission_id="SUB-002",
    vendor_id=vendor.id,
    system_name="TB-Scan AI",
    system_version="2.1",
    intended_use_case="Tuberculosis chest X-ray screening",
    risk_classification="HIGH",
    target_population="All ages",
    developer_organization="HealthTech Solutions",
    lifecycle_status="APPROVED",
    training_data_documentation="Included",
    local_validation_evidence="Valid",
    override_mechanism_documented=True
)
db.add(sys2)
db.commit()
append_audit_entry(db, "DRAFT_CREATED", {"submission_id": "SUB-002"}, "VENDOR", sys2.id, vendor.id)
append_audit_entry(db, "LIFECYCLE_PROMOTED", {"new_status": "APPROVED"}, "MINISTRY", sys2.id, admin.id)

# Seed System 3: Suspended
sys3 = AISystem(
    id=uuid.uuid4().hex,
    submission_id="SUB-003",
    vendor_id=vendor.id,
    system_name="PediVitals",
    system_version="1.0",
    intended_use_case="Pediatric vital signs monitoring",
    risk_classification="MEDIUM",
    target_population="Pediatrics",
    developer_organization="HealthTech Solutions",
    lifecycle_status="SUSPENDED",
    suspended_at=datetime.now(UTC),
    suspension_reason="Failed independent validation test for age < 5 demographic."
)
db.add(sys3)
db.commit()
append_audit_entry(db, "DRAFT_CREATED", {"submission_id": "SUB-003"}, "VENDOR", sys3.id, vendor.id)
append_audit_entry(db, "SYSTEM_SUSPENDED", {"reason": "Failed independent validation"}, "MINISTRY", sys3.id, admin.id)

# Seed System 4: Pending Review
sys4 = AISystem(
    id=uuid.uuid4().hex,
    submission_id="SUB-004",
    vendor_id=vendor.id,
    system_name="MaternalRisk Predictor",
    system_version="1.5",
    intended_use_case="Predict maternal health risks during pregnancy",
    risk_classification="HIGH",
    target_population="Pregnant women",
    developer_organization="HealthTech Solutions",
    lifecycle_status="PENDING_REVIEW"
)
db.add(sys4)
db.commit()
append_audit_entry(db, "DRAFT_CREATED", {"submission_id": "SUB-004"}, "VENDOR", sys4.id, vendor.id)
append_audit_entry(db, "SUBMITTED_FOR_REVIEW", {"lifecycle_status": "PENDING_REVIEW"}, "VENDOR", sys4.id, vendor.id)

db.close()
print("Database seeded successfully with Ministry admin, Vendor user, and 4 mock AI systems.")
