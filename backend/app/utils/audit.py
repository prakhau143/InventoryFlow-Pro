from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.inventory_history import InventoryHistory


def log_inventory_change(
    db: Session,
    product_id: int,
    previous_quantity: int,
    new_quantity: int,
    reason: str = None,
    username: str = "system",
    user_id: int = None,
):
    entry = InventoryHistory(
        product_id=product_id,
        change=new_quantity - previous_quantity,
        previous_quantity=previous_quantity,
        new_quantity=new_quantity,
        reason=reason,
        username=username,
        user_id=user_id,
    )
    db.add(entry)
    # Don't commit here — caller commits


def log_action(
    db: Session,
    action: str,
    resource: str,
    resource_id: int = None,
    details: str = None,
    username: str = "system",
    user_id: int = None,
    ip_address: str = None,
):
    entry = AuditLog(
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        username=username,
        user_id=user_id,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
