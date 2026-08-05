from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EntryCreate(BaseModel):
    user_id: int
    entry_text: str
    entry_type: str
    created_at: Optional[datetime] = None
    # self_reported_mood: Optional[str] = None

# class EntryCreate(BaseModel):
#     user_id: int
#     entry_text: str
#     entry_type: str  # text or voice

    
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
