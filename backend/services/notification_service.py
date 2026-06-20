import uuid
from sqlalchemy.orm import Session
from models.notification import Notification
from models.user import User
from datetime import datetime, UTC

def create_notification(db: Session, recipient_id: str, notification_type: str, title: str, message: str, system_id: str = None, recipient_role: str = None) -> Notification:
    notif = Notification(
        id=uuid.uuid4().hex,
        recipient_id=recipient_id,
        recipient_role=recipient_role,
        notification_type=notification_type,
        title=title,
        message=message,
        system_id=system_id
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_notifications(db: Session, user_id: str):
    return db.query(Notification).filter(Notification.recipient_id == user_id).order_by(Notification.created_at.desc()).all()

def get_unread_count(db: Session, user_id: str) -> int:
    return db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read == False).count()

def mark_read(db: Session, notif_id: str, user_id: str) -> Notification:
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.recipient_id == user_id).first()
    if not notif:
        return None
    notif.is_read = True
    notif.read_at = datetime.now(UTC)
    db.commit()
    db.refresh(notif)
    return notif

def mark_all_read(db: Session, user_id: str):
    notifs = db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read == False).all()
    for notif in notifs:
        notif.is_read = True
        notif.read_at = datetime.now(UTC)
    db.commit()
    return len(notifs)
