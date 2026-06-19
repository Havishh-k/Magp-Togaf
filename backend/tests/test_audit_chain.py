import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.audit_log import AuditLog
from database import Base
from services.audit_service import append_audit_entry, verify_chain_integrity

@pytest.fixture
def db_session():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_hash_chain_intact_after_100_entries(db_session):
    for i in range(100):
        append_audit_entry(
            db=db_session,
            event_type="TEST_EVENT",
            event_data={"iteration": i},
            actor_type="SYSTEM"
        )
    
    result = verify_chain_integrity(db_session)
    assert result.status == 'INTACT'
    assert result.total_entries == 100

def test_tampered_entry_detected(db_session):
    append_audit_entry(db_session, "EVENT_1", {"data": 1}, "SYSTEM")
    append_audit_entry(db_session, "EVENT_2", {"data": 2}, "SYSTEM")
    append_audit_entry(db_session, "EVENT_3", {"data": 3}, "SYSTEM")
    
    # Tamper with event 2 using raw SQL to bypass ORM
    db_session.execute(text("UPDATE audit_log SET event_data = '{\"data\": \"tampered\"}' WHERE sequence_number = 2"))
    db_session.commit()
    
    result = verify_chain_integrity(db_session)
    assert result.status == 'TAMPERED'
    assert result.first_tampered_sequence == 2

def test_audit_log_rejects_update(db_session):
    entry = append_audit_entry(db_session, "EVENT_1", {"data": 1}, "SYSTEM")
    
    with pytest.raises(Exception, match="AUDIT LOG IS IMMUTABLE"):
        entry.event_type = "TAMPERED_EVENT"
        db_session.commit()
