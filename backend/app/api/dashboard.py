from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from sqlalchemy import case

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_products  = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders    = db.query(Order).count()

    # Revenue = sum of order totals (selling price × qty), excl. cancelled
    total_revenue = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.status != "Cancelled")
        .scalar() or 0.0
    )

    # Total Earnings (Profit) = Σ (unit_price − cost_price) × qty
    # for every item in non-cancelled orders where cost_price was set.
    # Items with no cost_price (NULL or 0) contribute their full subtotal
    # as earnings (we can't subtract unknown cost).
    total_earnings = (
        db.query(
            func.sum(
                (OrderItem.unit_price - func.coalesce(Product.cost_price, 0))
                * OrderItem.quantity
            )
        )
        .join(Order,   Order.id   == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(Order.status != "Cancelled")
        .scalar() or 0.0
    )

    low_stock_count  = db.query(Product).filter(Product.quantity <= Product.low_stock_threshold).count()
    pending_orders   = db.query(Order).filter(Order.status == "Pending").count()
    completed_orders = db.query(Order).filter(Order.status == "Completed").count()
    cancelled_orders = db.query(Order).filter(Order.status == "Cancelled").count()

    return {
        "total_products":   total_products,
        "total_customers":  total_customers,
        "total_orders":     total_orders,
        "total_revenue":    round(float(total_revenue),  2),
        "total_earnings":   round(float(total_earnings), 2),
        "low_stock_count":  low_stock_count,
        "pending_orders":   pending_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
    }


@router.get("/low-stock")
def get_low_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products = (
        db.query(Product)
        .filter(Product.quantity <= Product.low_stock_threshold)
        .order_by(Product.quantity.asc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "quantity": p.quantity,
            "low_stock_threshold": p.low_stock_threshold,
            "category": p.category,
        }
        for p in products
    ]


@router.get("/orders-trend")
def get_orders_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    trend = []
    # range(13, -1, -1) → 14 days ending TODAY (day 0 = today, previously excluded)
    for i in range(13, -1, -1):
        day = now - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        count = db.query(Order).filter(Order.created_at >= start, Order.created_at < end).count()
        revenue = (
            db.query(func.sum(Order.total_amount))
            .filter(Order.created_at >= start, Order.created_at < end, Order.status != "Cancelled")
            .scalar()
            or 0.0
        )
        trend.append({
            "date": start.strftime("%b %d"),
            "orders": count,
            "revenue": round(revenue, 2),
        })
    return trend


@router.get("/inventory-distribution")
def get_inventory_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products = db.query(Product).all()
    out_of_stock = sum(1 for p in products if p.quantity == 0)
    low_stock = sum(1 for p in products if 0 < p.quantity <= p.low_stock_threshold)
    in_stock = sum(1 for p in products if p.quantity > p.low_stock_threshold)
    return [
        {"name": "In Stock", "value": in_stock, "color": "#10b981"},
        {"name": "Low Stock", "value": low_stock, "color": "#f59e0b"},
        {"name": "Out of Stock", "value": out_of_stock, "color": "#ef4444"},
    ]


@router.get("/top-products")
def get_top_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = (
        db.query(
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("total_revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != "Cancelled")
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    return [{"name": r.name, "total_sold": r.total_sold, "total_revenue": round(r.total_revenue, 2)} for r in results]


@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource": l.resource,
            "resource_id": l.resource_id,
            "details": l.details,
            "username": l.username,
            "created_at": l.created_at,
        }
        for l in logs
    ]
