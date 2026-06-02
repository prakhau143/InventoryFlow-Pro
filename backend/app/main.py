from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, audit, customers, dashboard, export, orders, products
from app.database import Base, engine

# Create tables
Base.metadata.create_all(bind=engine)

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

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(audit.router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "InventoryFlow Pro API"}


@app.get("/", tags=["Root"])
def root():
    return {"message": "InventoryFlow Pro API", "docs": "/docs"}
