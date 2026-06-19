from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from schemas.notification import NotificationResponse
from services.notification_service import get_notifications, mark_read, mark_all_read
from models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationResponse])
def api_get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_notifications(db, current_user.id)

@router.patch("/{notif_id}/read", response_model=NotificationResponse)
def api_mark_read(notif_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = mark_read(db, notif_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.post("/read-all")
def api_mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = mark_all_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}
