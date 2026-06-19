import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, Base, get_db
from sqlalchemy.orm import sessionmaker
from schemas.auth import UserCreate
from services.auth_service import create_user

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    user = UserCreate(username="vendor1", email="v1@test.com", password="password123", role="vendor", organization="VOrg")
    create_user(db, user)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def get_token():
    return client.post("/auth/login", data={"username": "vendor1", "password": "password123"}).json()["access_token"]

def test_create_draft():
    token = get_token()
    payload = {
        "system_name": "TestAI",
        "system_version": "1.0",
        "intended_use_case": "dx",
        "target_population": "all",
        "risk_classification": "HIGH",
        "developer_organization": "VOrg",
        "override_mechanism_documented": True
    }
    resp = client.post("/submission/draft", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["system_name"] == "TestAI"
    assert data["lifecycle_status"] == "DRAFT"
    return data["id"]

def test_submit():
    token = get_token()
    sys_id = test_create_draft()
    resp = client.post(f"/submission/{sys_id}/submit", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["lifecycle_status"] == "PENDING_REVIEW"
