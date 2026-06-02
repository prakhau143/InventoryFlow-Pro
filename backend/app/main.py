import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth, audit, customers, dashboard, export, orders, products
from app.api import inventory_history, uploads
from app.database import Base, SessionLocal, engine

# Create all tables
Base.metadata.create_all(bind=engine)

# Seed default users
from app.seed import seed_default_users
with SessionLocal() as db:
    seed_default_users(db)

app = FastAPI(
    title="InventoryFlow Pro API",
    description="Production-grade Inventory & Order Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media files
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(inventory_history.router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "InventoryFlow Pro API"}


@app.get("/", tags=["Root"])
def root():
    return {"message": "InventoryFlow Pro API", "docs": "/docs"}
