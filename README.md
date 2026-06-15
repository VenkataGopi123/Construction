# BuildMaster ERP — Construction Management & Material Supply Platform

Enterprise-grade construction management system for residential, commercial, road, bridge, and industrial projects with integrated material supply, CRM, payroll, and AI-assisted cost estimation.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion, Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16 |
| Auth | JWT, Google OAuth 2.0, RBAC |
| Cloud | AWS / Azure ready (Docker, env-based config) |

## Project Structure

```
construction-erp/
├── backend/          # Express REST API
├── frontend/         # Next.js web application
├── database/         # PostgreSQL schema, migrations, seeds
├── docs/             # Deployment & testing guides
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm 10+

### 1. Database Setup

```bash
createdb buildmaster_erp
psql -d buildmaster_erp -f database/schema.sql
psql -d buildmaster_erp -f database/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`

### 4. Docker (Production-like)

```bash
docker-compose up -d
```

## User Roles

| Role | Access |
|------|--------|
| Super Admin | Full system access |
| Project Manager | Projects, workers, budgets, documents |
| Material Manager | Inventory, stock, warehouses |
| Supplier | Purchase orders, deliveries |
| Customer | Portal, quotations, invoices, payments |

## Default Credentials (Development)

| Email | Password | Role |
|-------|----------|------|
| admin@buildmaster.com | Admin@123 | super_admin |
| pm@buildmaster.com | Pm@123456 | project_manager |
| material@buildmaster.com | Mat@123456 | material_manager |
| supplier@buildmaster.com | Sup@123456 | supplier |
| customer@buildmaster.com | Cus@123456 | customer |

## API Documentation

Base URL: `/api/v1`

See [docs/API.md](docs/API.md) for full endpoint reference.

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Strategy](docs/TESTING.md)
- [Database Schema](database/schema.sql)

## License

Proprietary — BuildMaster Construction Pvt. Ltd.
