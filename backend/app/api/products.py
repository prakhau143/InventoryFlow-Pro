import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.utils.audit import log_action, log_inventory_change

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/analytics")
def get_products_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products = db.query(Product).all()
    in_stock    = sum(1 for p in products if p.quantity > 50)
    medium      = sum(1 for p in products if 10 <= p.quantity <= 50)
    low         = sum(1 for p in products if 0 < p.quantity < 10)
    out_of_stock= sum(1 for p in products if p.quantity == 0)
    total_value = sum(float(p.price * p.quantity) for p in products)

    valuable = sorted(
        [{"name": p.name[:22], "value": round(float(p.price * p.quantity), 2)} for p in products if p.quantity > 0],
        key=lambda x: x["value"], reverse=True
    )[:10]

    # Profit = (selling_price - cost_price) × quantity (only where cost_price is set)
    total_profit = sum(
        float((p.price - (p.cost_price or 0)) * p.quantity)
        for p in products if p.cost_price and p.cost_price > 0
    )

    return {
        "kpis": {
            "total_products": len(products),
            "total_stock_value": round(total_value, 2),
            "total_potential_profit": round(total_profit, 2),
            "low_stock_count": low,
            "out_of_stock_count": out_of_stock,
        },
        "inventory_status": [
            {"name": "In Stock (>50)",  "value": in_stock,     "color": "#10b981"},
            {"name": "Medium (10-50)",  "value": medium,       "color": "#f59e0b"},
            {"name": "Low (<10)",       "value": low,          "color": "#ef4444"},
            {"name": "Out of Stock",    "value": out_of_stock, "color": "#6b7280"},
        ],
        "top_valuable": valuable,
    }


@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")
    product = Product(**data.model_dump())
    db.add(product)
    db.flush()
    if product.quantity > 0:
        log_inventory_change(db, product.id, 0, product.quantity, "Initial stock on creation", current_user.username, current_user.id)
    db.commit()
    db.refresh(product)
    log_action(db, "CREATE", "product", product.id, f"Created product: {product.name}", current_user.username, current_user.id)
    return product


@router.get("")
def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Product)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | (Product.sku.ilike(f"%{search}%"))
        )
    if category:
        query = query.filter(Product.category == category)
    if low_stock:
        query = query.filter(Product.quantity <= Product.low_stock_threshold)
    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [ProductOut.model_validate(p) for p in products],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total > 0 else 1,
    }


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = data.model_dump(exclude_unset=True)
    old_qty = product.quantity
    for key, val in update_data.items():
        setattr(product, key, val)
    if "quantity" in update_data and update_data["quantity"] != old_qty:
        log_inventory_change(db, product.id, old_qty, update_data["quantity"], "Manual stock update", current_user.username, current_user.id)
    db.commit()
    db.refresh(product)
    log_action(db, "UPDATE", "product", product.id, f"Updated product: {product.name}", current_user.username, current_user.id)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    name = product.name
    db.delete(product)
    db.commit()
    log_action(db, "DELETE", "product", product_id, f"Deleted product: {name}", current_user.username, current_user.id)
