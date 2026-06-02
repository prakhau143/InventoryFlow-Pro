from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


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
