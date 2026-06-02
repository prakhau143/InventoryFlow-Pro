import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.inventory_history import InventoryHistory
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/inventory-history", tags=["Inventory History"])


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
