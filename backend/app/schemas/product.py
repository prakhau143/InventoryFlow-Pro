from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class ProductCreate(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    cost_price: Optional[float] = 0.0
    quantity: int
    category: Optional[str] = None
    low_stock_threshold: int = 10

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    low_stock_threshold: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    description: Optional[str]
    price: float
    cost_price: Optional[float] = 0.0
    quantity: int
    category: Optional[str]
    low_stock_threshold: int
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
