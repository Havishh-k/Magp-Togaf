from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    recipient_role: str | None
    notification_type: str
    title: str
    message: str
    system_id: str | None
    is_read: bool
    created_at: datetime
    read_at: datetime | None

    class Config:
        from_attributes = True
