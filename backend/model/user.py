from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
import re

class User(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    # Avoid including the password field here if not needed in public data

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator("email")
    def validate_email(cls, v):
        if not v:
            raise ValueError("Email cannot be empty")
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

class UserLogin(BaseModel):
    username: str
    password: str
