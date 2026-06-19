import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, Base, get_db
from sqlalchemy.orm import sessionmaker
from schemas.auth import UserCreate
from services.auth_service import create_user
from services.notification_service import create_notification

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

user_id = None
notif_id = None

@pytest.fixture(autouse=True)
def setup_db():
    global user_id, notif_id
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create user
    user = UserCreate(username="user1", email="u1@test.com", password="pwd", role="vendor")
    db_user = create_user(db, user)
    user_id = db_user.id
    
    # Create notification
    notif = create_notification(db, recipient_id=user_id, notification_type="ALERT", title="Test", message="Test Msg")
    notif_id = notif.id
    
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def get_token():
    return client.post("/auth/login", data={"username": "user1", "password": "pwd"}).json()["access_token"]

def test_get_notifications():
    token = get_token()
    resp = client.get("/notifications/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1

def test_mark_read():
    token = get_token()
    resp = client.patch(f"/notifications/{notif_id}/read", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["is_read"] == True

def test_mark_all_read():
    token = get_token()
    resp = client.post("/notifications/read-all", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert "1" in resp.json()["message"]
