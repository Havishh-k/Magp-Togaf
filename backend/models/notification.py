from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index
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
