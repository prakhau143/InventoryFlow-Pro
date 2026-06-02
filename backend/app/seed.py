"""Seed default users on startup if no users exist."""
from app.core.security import get_password_hash
from app.models.user import User


def seed_default_users(db):
    if db.query(User).count() > 0:
        return  # Already seeded

    defaults = [
        {"username": "admin",   "email": "admin@inventoryflow.com",   "password": "admin123",   "role": "admin"},
        {"username": "manager", "email": "manager@inventoryflow.com", "password": "manager123", "role": "manager"},
    ]
    for u in defaults:
        user = User(
            username=u["username"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            role=u["role"],
        )
        db.add(user)
    db.commit()
    print("✅ Default users seeded: admin / manager")
