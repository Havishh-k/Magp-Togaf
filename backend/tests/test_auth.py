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
    # Create test user
    user = UserCreate(username="testuser", email="test@test.com", password="password123", role="vendor", organization="TestOrg")
    create_user(db, user)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def test_login_success():
    response = client.post("/auth/login", data={"username": "testuser", "password": "password123"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_fail():
    response = client.post("/auth/login", data={"username": "testuser", "password": "wrongpassword"})
    assert response.status_code == 401

def test_read_me():
    login_response = client.post("/auth/login", data={"username": "testuser", "password": "password123"})
    token = login_response.json()["access_token"]
    
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
