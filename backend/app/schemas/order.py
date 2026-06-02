from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.schemas.product import ProductOut


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: Optional[ProductOut] = None

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v):
        valid = ["Pending", "Processing", "Completed", "Cancelled"]
        if v not in valid:
            raise ValueError(f"Status must be one of: {', '.join(valid)}")
        return v


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderListOut(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    notes: Optional[str]
    created_at: datetime
    customer_name: Optional[str] = None

    model_config = {"from_attributes": True}
