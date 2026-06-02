import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.utils.audit import log_action

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Customer).filter(Customer.email == data.email).first():
        raise HTTPException(status_code=409, detail=f"Email '{data.email}' already registered")
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    log_action(db, "CREATE", "customer", customer.id, f"Created customer: {customer.full_name}", current_user.username, current_user.id)
    return customer


@router.get("")
def list_customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Customer)
    if search:
        query = query.filter(
            (Customer.full_name.ilike(f"%{search}%")) | (Customer.email.ilike(f"%{search}%"))
        )
    if status == "active":
        query = query.filter(Customer.is_active == True)
    elif status == "inactive":
        query = query.filter(Customer.is_active == False)
    total = query.count()
    customers = query.order_by(Customer.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [CustomerOut.model_validate(c) for c in customers],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total > 0 else 1,
    }


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Include order stats
    orders = db.query(Order).filter(Order.customer_id == customer_id).all()
    total_orders = len(orders)
    total_spent = sum(o.total_amount for o in orders if o.status != "Cancelled")
    out = CustomerOut.model_validate(customer).model_dump()
    out["total_orders"] = total_orders
    out["total_spent"] = float(total_spent)
    out["recent_orders"] = [
        {"id": o.id, "status": o.status, "total_amount": float(o.total_amount), "created_at": o.created_at}
        for o in sorted(orders, key=lambda x: x.created_at, reverse=True)[:5]
    ]
    return out


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Check email uniqueness if changing
    if data.email and data.email != customer.email:
        if db.query(Customer).filter(Customer.email == data.email).first():
            raise HTTPException(status_code=409, detail=f"Email '{data.email}' already registered")
    updates = data.model_dump(exclude_none=True)
    for key, val in updates.items():
        setattr(customer, key, val)
    db.commit()
    db.refresh(customer)
    log_action(db, "UPDATE", "customer", customer.id, f"Updated customer: {customer.full_name}", current_user.username, current_user.id)
    return customer


@router.patch("/{customer_id}/toggle-status", response_model=CustomerOut)
def toggle_customer_status(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.is_active = not customer.is_active
    db.commit()
    db.refresh(customer)
    status_str = "activated" if customer.is_active else "deactivated"
    log_action(db, "UPDATE", "customer", customer.id, f"Customer {status_str}: {customer.full_name}", current_user.username, current_user.id)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    name = customer.full_name
    db.delete(customer)
    db.commit()
    log_action(db, "DELETE", "customer", customer_id, f"Deleted customer: {name}", current_user.username, current_user.id)
