import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, Base, get_db
from sqlalchemy.orm import sessionmaker
from schemas.auth import UserCreate
from services.auth_service import create_user
from schemas.submission import SubmissionDraftCreate
from services.submission_service import create_draft

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

sys_id_vendor = None

@pytest.fixture(autouse=True)
def setup_db():
    global sys_id_vendor
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create ministry user
    user_min = UserCreate(username="admin", email="admin@gov.ml", password="pwd", role="ministry", organization="MOH")
    create_user(db, user_min)
    
    # Create vendor user
    user_ven = UserCreate(username="vendor2", email="v2@test.com", password="pwd", role="vendor", organization="VOrg")
    v = create_user(db, user_ven)
    
    # Create draft system
    draft = SubmissionDraftCreate(
        system_name="TestSys", system_version="1", intended_use_case="dx", target_population="all",
        risk_classification="HIGH", developer_organization="VOrg"
    )
    sys = create_draft(db, v.id, draft)
    sys_id_vendor = sys.id
    
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def get_token(username="admin"):
    return client.post("/auth/login", data={"username": username, "password": "pwd"}).json()["access_token"]

def test_registry_list():
    token = get_token("vendor2")
    resp = client.get("/registry/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1

def test_registry_promote_requires_ministry():
    token = get_token("vendor2") # vendor cannot promote
    resp = client.post(f"/registry/{sys_id_vendor}/promote?new_status=SHADOW_MODE", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403

def test_registry_promote_success():
    token = get_token("admin")
    resp = client.post(f"/registry/{sys_id_vendor}/promote?new_status=SHADOW_MODE", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["lifecycle_status"] == "SHADOW_MODE"

def test_registry_suspend_reactivate():
    token = get_token("admin")
    resp = client.post(f"/registry/{sys_id_vendor}/suspend", json={"reason": "Test fail"}, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["lifecycle_status"] == "SUSPENDED"
    
    resp2 = client.post(f"/registry/{sys_id_vendor}/reactivate", headers={"Authorization": f"Bearer {token}"})
    assert resp2.status_code == 200
    assert resp2.json()["lifecycle_status"] == "PENDING_REVIEW"
