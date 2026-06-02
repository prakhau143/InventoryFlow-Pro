from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class CustomerOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
