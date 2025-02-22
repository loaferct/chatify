from pydantic import BaseModel
from datetime import datetime

class FriendRequest(BaseModel):
    username: str
    friend_username: str

class FriendResponse(BaseModel):
    friend_username: str
    status: str
    created_at: datetime
