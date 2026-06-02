# ⚡ InventoryFlow Pro

**Production-grade Inventory & Order Management Platform**

> A full-stack SaaS-quality application built with React, FastAPI, PostgreSQL, and Docker — featuring a premium glassmorphism UI, real-time analytics, JWT authentication, and complete CRUD operations with all required business logic.

---

## 🖥️ Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://inventoryflow-pro.vercel.app |
| Backend API | https://inventoryflow-pro.onrender.com |
| API Docs | https://inventoryflow-pro.onrender.com/docs |
| Docker Hub | `docker pull yourusername/inventoryflow-pro-backend:latest` |

---

## ✨ Features

### Core Requirements (100% Implemented)
- **Product Management** — Create, Read, Update, Delete with SKU uniqueness validation
- **Customer Management** — CRUD with unique email validation
- **Order Management** — Create orders with inventory validation, auto total calculation, auto stock deduction
- **Business Logic** — Negative quantity prevention, insufficient stock errors (400), duplicate SKU/email (409)
- **Cancel/Delete Order** — Restores inventory stock automatically

### Premium Extras
- 🔐 **JWT Authentication** — Register, login, protected routes, role-based (Admin/Manager)
- 📊 **Analytics Dashboard** — 6 KPI cards + 3 interactive Recharts charts
- 📉 **Low Stock Alerts** — Real-time warnings with configurable thresholds
- 📋 **Audit Logs** — Every create/update/delete logged with user, timestamp, details
- 📤 **CSV Export** — Products, Orders, and Audit Logs exportable
- 🌓 **Dark / Light Mode** — Glassmorphism UI adapts, persists in localStorage
- 🔍 **Search & Pagination** — All list views with server-side search and pagination
- 🎬 **Framer Motion** — Smooth page transitions, card hover effects, modal animations
- 🔔 **Toast Notifications** — Success/error feedback on every action
- 💀 **Loading Skeletons** — Table and card skeletons while fetching data
- 📦 **Order Status** — Pending → Processing → Completed / Cancelled
- 🏥 **Health Check** — `GET /health` endpoint

---

## 🏗️ Architecture

```
inventoryflow-pro/
├── backend/                    # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   │   ├── auth.py        # JWT register/login/me
│   │   │   ├── products.py    # Full product CRUD
│   │   │   ├── customers.py   # Customer CRUD
│   │   │   ├── orders.py      # Order management + status
│   │   │   ├── dashboard.py   # Analytics endpoints
│   │   │   ├── export.py      # CSV export
│   │   │   └── audit.py       # Audit log listing
│   │   ├── core/
│   │   │   ├── config.py      # Pydantic settings
│   │   │   └── security.py    # JWT + bcrypt
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── utils/
│   │   │   ├── audit.py       # Audit log helper
│   │   │   └── csv_exporter.py
│   │   └── main.py            # App bootstrap + CORS
│   ├── alembic/               # Database migrations
│   ├── Dockerfile
│   └── entrypoint.sh          # Runs migrations then uvicorn
├── frontend/                   # React 18 + Vite + Glassmorphism
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/        # Recharts: Pie, Area, Bar
│   │   │   ├── dashboard/     # StatsCard
│   │   │   ├── layout/        # Sidebar, Header, Layout
│   │   │   └── ui/            # Modal, Pagination, Skeleton
│   │   ├── context/           # ThemeContext, AuthContext
│   │   ├── pages/             # 8 full pages
│   │   ├── services/          # Axios API clients
│   │   └── App.jsx            # Router + auth guards
│   ├── Dockerfile             # Multi-stage: build → nginx
│   └── nginx.conf
├── docker-compose.yml
└── .github/workflows/ci.yml   # CI: lint → build → Docker push
```

---

## 🚀 Quick Start (Local with Docker Compose)

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

```bash
# 1. Clone
git clone https://github.com/yourusername/inventoryflow-pro.git
cd inventoryflow-pro

# 2. Create env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Launch everything (DB + Backend + Frontend)
docker compose up --build

# 4. Open
# Frontend:    http://localhost:3000
# Backend API: http://localhost:8000
# Swagger UI:  http://localhost:8000/docs
```

**First-time setup:** Go to http://localhost:3000/register, create an account, then sign in.

---

## 🔧 Running Without Docker (Development)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set env variables
cp .env.example .env
# Edit .env: set DATABASE_URL to your local PostgreSQL

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

npm install

# Set API URL
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev
# Opens at http://localhost:3000
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login → returns JWT |
| `GET`  | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/products` | Create product (SKU unique → 409) |
| `GET`    | `/api/products` | List with `?search=&page=&category=&low_stock=` |
| `GET`    | `/api/products/{id}` | Get single product |
| `PUT`    | `/api/products/{id}` | Update product |
| `DELETE` | `/api/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/customers` | Create (email unique → 409) |
| `GET`    | `/api/customers` | List with `?search=&page=` |
| `GET`    | `/api/customers/{id}` | Get customer |
| `DELETE` | `/api/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/orders` | Create order (validates stock, auto total, deducts stock) |
| `GET`    | `/api/orders` | List with `?status=&page=` |
| `GET`    | `/api/orders/{id}` | Full order with items |
| `PATCH`  | `/api/orders/{id}/status` | Change status (cancel restores stock) |
| `DELETE` | `/api/orders/{id}` | Delete + restore stock |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | KPI summary |
| `GET` | `/api/dashboard/low-stock` | Low stock products |
| `GET` | `/api/dashboard/orders-trend` | Last 7 days trend |
| `GET` | `/api/dashboard/inventory-distribution` | Stock breakdown |
| `GET` | `/api/dashboard/top-products` | Best sellers |
| `GET` | `/api/dashboard/recent-activity` | Last 10 audit entries |

### Export
| `GET` | `/api/export/products/csv` | Download products CSV |
| `GET` | `/api/export/orders/csv` | Download orders CSV |
| `GET` | `/api/export/audit-logs/csv` | Download audit logs CSV |

---

## 🐳 Docker Hub

```bash
# Pull backend image
docker pull yourusername/inventoryflow-pro-backend:latest

# Run with external DB
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e SECRET_KEY="your-secret-key" \
  yourusername/inventoryflow-pro-backend:latest
```

---

## ☁️ Deployment Guide

### Backend → Render

1. Push repo to GitHub
2. Render → New → Web Service → Connect repo
3. **Root directory:** `backend`
4. **Dockerfile path:** `./Dockerfile`
5. Add **Environment Variables:**
   - `DATABASE_URL` → your Neon/Render PostgreSQL URL
   - `SECRET_KEY` → long random string
6. Deploy → get URL like `https://inventoryflow-pro.onrender.com`

> **Free PostgreSQL:** Create at [neon.tech](https://neon.tech) — free tier, no credit card.

### Frontend → Vercel

1. Vercel → Import Project → select repo
2. **Root directory:** `frontend`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variable:** `VITE_API_URL=https://your-backend.onrender.com`
6. Deploy → get URL like `https://inventoryflow-pro.vercel.app`

---

## 🔒 Business Logic Summary

| Rule | Implementation |
|------|----------------|
| SKU must be unique | `409 Conflict` if duplicate |
| Email must be unique | `409 Conflict` if duplicate |
| Quantity ≥ 0 | Pydantic validator |
| Sufficient stock on order | `400 Bad Request` with product name and available qty |
| Auto total calculation | Backend computes: `Σ (price × quantity)` |
| Auto stock deduction | `product.quantity -= item.quantity` on order create |
| Cancel/delete order restores stock | Inventory restored if status ≠ "Cancelled" |
| Audit every mutation | `log_action()` called after every create/update/delete |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Framer Motion |
| Charts | Recharts (Area, Pie, Bar) |
| Forms | React Hook Form |
| HTTP | Axios with JWT interceptor |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 15, Alembic migrations |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions → Docker Hub |
| Deploy | Backend: Render / Frontend: Vercel |

---

## 📸 Screenshots

> Dashboard with glassmorphism cards, analytics charts, and dark mode.

---

*Built with ❤️ as a production-quality portfolio project.*
