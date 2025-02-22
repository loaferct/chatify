from datetime import datetime
from pydantic import BaseModel

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime
    is_read: bool
    sender_name: str
    receiver_name: str