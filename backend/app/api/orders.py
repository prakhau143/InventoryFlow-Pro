import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api.auth import get_current_user
from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.utils.audit import log_action, log_inventory_change

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Validate stock first (all-or-nothing)
    products_map = {}
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}",
            )
        products_map[item.product_id] = product

    # Calculate total and create order
    total = sum(products_map[i.product_id].price * i.quantity for i in data.items)
    order = Order(customer_id=data.customer_id, total_amount=round(total, 2), status="Pending", notes=data.notes)
    db.add(order)
    db.flush()

    for item in data.items:
        product = products_map[item.product_id]
        unit_price = product.price
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=unit_price,
            subtotal=round(unit_price * item.quantity, 2),
        )
        db.add(order_item)
        old_qty = product.quantity
        product.quantity -= item.quantity
        log_inventory_change(db, product.id, old_qty, product.quantity, f"Order #{order.id} created", current_user.username, current_user.id)

    db.commit()
    db.refresh(order)
    log_action(db, "CREATE", "order", order.id, f"Order #{order.id} for {customer.full_name}, total: ${order.total_amount}", current_user.username, current_user.id)
    return db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.id == order.id).first()


@router.get("")
def list_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).options(joinedload(Order.customer))
    if status:
        query = query.filter(Order.status == status)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "customer_id": o.customer_id,
            "customer_name": o.customer.full_name if o.customer else None,
            "total_amount": o.total_amount,
            "status": o.status,
            "notes": o.notes,
            "created_at": o.created_at,
        })
    return {
        "items": result,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total > 0 else 1,
    }


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    if old_status == "Cancelled":
        raise HTTPException(status_code=400, detail="Cannot change status of a cancelled order")

    # Restore stock when cancelling
    if data.status == "Cancelled" and old_status != "Cancelled":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                old_qty = product.quantity
                product.quantity += item.quantity
                log_inventory_change(db, product.id, old_qty, product.quantity, f"Order #{order_id} cancelled — stock restored", current_user.username, current_user.id)

    order.status = data.status
    db.commit()
    db.refresh(order)
    log_action(db, "UPDATE", "order", order.id, f"Order #{order.id} status changed: {old_status} → {data.status}", current_user.username, current_user.id)
    return db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.id == order_id).first()


@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore inventory if order was not already cancelled
    if order.status != "Cancelled":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                old_qty = product.quantity
                product.quantity += item.quantity
                log_inventory_change(db, product.id, old_qty, product.quantity, f"Order #{order_id} deleted — stock restored", current_user.username, current_user.id)

    db.delete(order)
    db.commit()
    log_action(db, "DELETE", "order", order_id, f"Deleted order #{order_id}", current_user.username, current_user.id)
