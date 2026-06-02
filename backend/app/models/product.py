from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)           # Selling price (shown to customers)
    cost_price = Column(Float, nullable=True, default=0.0)  # Purchase / cost price (for profit calc)
    quantity = Column(Integer, nullable=False, default=0)
    category = Column(String(100), nullable=True)
    low_stock_threshold = Column(Integer, default=10)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    order_items = relationship("OrderItem", back_populates="product")
