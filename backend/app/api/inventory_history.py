import math
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.inventory_history import InventoryHistory
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/inventory-history", tags=["Inventory History"])


@router.get("/analytics")
def get_inventory_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)

    # 30-day movement (stock added vs removed per day)
    movement = []
    for i in range(29, -1, -1):
        day   = now - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end   = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        added   = db.query(func.coalesce(func.sum(InventoryHistory.change), 0)).filter(
            InventoryHistory.created_at.between(start, end), InventoryHistory.change > 0
        ).scalar() or 0
        removed = db.query(func.coalesce(func.sum(func.abs(InventoryHistory.change)), 0)).filter(
            InventoryHistory.created_at.between(start, end), InventoryHistory.change < 0
        ).scalar() or 0
        movement.append({"date": day.strftime("%b %d"), "added": int(added), "removed": int(removed)})

    # Low stock risk — products sorted by quantity ascending (show most at-risk first)
    low_risk = (
        db.query(Product)
        .filter(Product.quantity >= 0)
        .order_by(Product.quantity.asc())
        .limit(10)
        .all()
    )

    total_added   = db.query(func.coalesce(func.sum(InventoryHistory.change), 0)).filter(InventoryHistory.change > 0).scalar() or 0
    total_removed = db.query(func.coalesce(func.sum(func.abs(InventoryHistory.change)), 0)).filter(InventoryHistory.change < 0).scalar() or 0
    low_count     = db.query(func.count(Product.id)).filter(Product.quantity < Product.low_stock_threshold).scalar() or 0

    return {
        "kpis": {
            "total_movements": db.query(func.count(InventoryHistory.id)).scalar() or 0,
            "total_added":     int(total_added),
            "total_removed":   int(total_removed),
            "low_stock_count": int(low_count),
        },
        "movement": movement,
        "low_stock_risk": [
            {"name": p.name[:20], "quantity": p.quantity, "threshold": p.low_stock_threshold}
            for p in low_risk
        ],
    }


@router.get("")
def list_inventory_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    product_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(InventoryHistory)
    if product_id:
        query = query.filter(InventoryHistory.product_id == product_id)
    total = query.count()
    records = query.order_by(InventoryHistory.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for r in records:
        product = db.query(Product).filter(Product.id == r.product_id).first()
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": product.name if product else f"Product #{r.product_id}",
            "product_sku": product.sku if product else "—",
            "change": r.change,
            "previous_quantity": r.previous_quantity,
            "new_quantity": r.new_quantity,
            "reason": r.reason,
            "username": r.username,
            "created_at": r.created_at,
        })
    return {
        "items": result,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total > 0 else 1,
    }
