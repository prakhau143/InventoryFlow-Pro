from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.utils.csv_exporter import generate_csv

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/products/csv")
def export_products_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products = db.query(Product).all()
    headers = ["ID", "Name", "SKU", "Category", "Price", "Quantity", "Low Stock Threshold", "Created At"]
    rows = [
        [p.id, p.name, p.sku, p.category or "", p.price, p.quantity, p.low_stock_threshold, p.created_at.isoformat()]
        for p in products
    ]
    csv_data = generate_csv(headers, rows)
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.get("/orders/csv")
def export_orders_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = db.query(Order).join(Customer, Order.customer_id == Customer.id).all()
    headers = ["Order ID", "Customer", "Total Amount", "Status", "Items Count", "Created At"]
    rows = []
    for o in orders:
        customer = db.query(Customer).filter(Customer.id == o.customer_id).first()
        items_count = db.query(OrderItem).filter(OrderItem.order_id == o.id).count()
        rows.append([
            o.id,
            customer.full_name if customer else "",
            o.total_amount,
            o.status,
            items_count,
            o.created_at.isoformat(),
        ])
    csv_data = generate_csv(headers, rows)
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"},
    )


@router.get("/audit-logs/csv")
def export_audit_logs_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.audit_log import AuditLog
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    headers = ["ID", "Action", "Resource", "Resource ID", "Details", "Username", "Created At"]
    rows = [
        [l.id, l.action, l.resource, l.resource_id or "", l.details or "", l.username, l.created_at.isoformat()]
        for l in logs
    ]
    csv_data = generate_csv(headers, rows)
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs.csv"},
    )
