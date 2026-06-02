"""Seed default users on startup — checks each user individually so
re-running never skips a missing default even if other users exist."""
from app.core.security import get_password_hash
from app.models.user import User


DEFAULTS = [
    {"username": "admin",   "email": "admin@inventoryflow.com",   "password": "admin123",   "role": "admin"},
    {"username": "manager", "email": "manager@inventoryflow.com", "password": "manager123", "role": "manager"},
]


def seed_default_users(db):
    seeded = []
    for u in DEFAULTS:
        # Check by username AND email — skip only if this exact user already exists
        exists = (
            db.query(User)
            .filter((User.username == u["username"]) | (User.email == u["email"]))
            .first()
        )
        if exists:
            continue
        user = User(
            username=u["username"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            role=u["role"],
        )
        db.add(user)
        seeded.append(u["username"])

    if seeded:
        db.commit()
        print(f"✅ Default users seeded: {', '.join(seeded)}")
    else:
        print("✅ Default users already present")
