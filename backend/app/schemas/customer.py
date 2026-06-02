from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
