from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
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

    @staticmethod
    def before_update(mapper, connection, target):
        raise Exception("AUDIT LOG IS IMMUTABLE: update operations are not permitted")

    @staticmethod
    def before_delete(mapper, connection, target):
        raise Exception("AUDIT LOG IS IMMUTABLE: delete operations are not permitted")

from sqlalchemy import event
event.listen(AuditLog, 'before_update', AuditLog.before_update)
event.listen(AuditLog, 'before_delete', AuditLog.before_delete)

