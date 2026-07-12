# TransitOps — Fleet Operations Platform

Hackathon project: React frontend + self-hosted PostgreSQL backend with RBAC, business-rule enforcement, and audit logging.

## Project layout

```
Odoo Hackathon/
├── TransitOpsB2BSaaSUIDesign-main/   # React + Vite frontend
└── backend/                          # Node.js + Express + Prisma API
```

## Prerequisites

1. **Node.js 20+**
2. **PostgreSQL** running locally, e.g.:
   ```bash
   # macOS with Homebrew
   brew services start postgresql@16

   # Or Docker
   docker run -d --name transitops-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
   ```

3. Create the database:
   ```bash
   createdb transitops
   # or: psql -c "CREATE DATABASE transitops;"
   ```

## Step 1 — Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` if needed (defaults assume `postgres:postgres@localhost:5432/transitops`).

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend API: **http://localhost:3001**  
Health check: `curl http://localhost:3001/health`

## Step 2 — Frontend

Open a **second terminal**:

```bash
cd TransitOpsB2BSaaSUIDesign-main
cp .env.example .env
npm install
npm run dev
```

Frontend: **http://localhost:5173** (Vite default)

## Step 3 — Demo login

1. Open http://localhost:5173
2. Click **Sign In**
3. Select a **role** from the dropdown
4. Password: `TransitOps2026!` (any email works — role maps to persona account)
5. Explore screens — data loads from the live API

### Role landing pages

| Role | Lands on | Can do |
|------|----------|--------|
| Fleet Manager | Dashboard | Full access everywhere |
| Dispatcher | Dashboard | Create trips, view fleet/drivers |
| Safety Officer | Drivers | Manage drivers & maintenance |
| Financial Analyst | Fuel & Expenses | Fuel, expenses, analytics |

## What works end-to-end

- JWT login + refresh token (httpOnly cookie)
- RBAC nav guards (403 on forbidden API routes)
- Live fleet data: vehicles, drivers, trips, maintenance, fuel, analytics
- Trip creation with server-side capacity validation
- Maintenance close → vehicle back to Available (atomic)
- Audit log on dispatch / complete / cancel / maintenance open-close
- Account lockout after 5 bad passwords

## Architecture (demo narration)

> TransitOps is a modular transport-ops stack: React talks REST to an Express API where controllers stay thin and **all business rules live in services**. PostgreSQL holds the fleet schema with Prisma migrations; every state transition—dispatch, complete, cancel, maintenance open/close—runs in a **single transaction** and writes an audit row. JWT + RBAC middleware guard every route; rate limiting and account lockout protect the login surface.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Can't reach database` | Ensure Postgres is running and `DATABASE_URL` in `backend/.env` is correct |
| CORS errors | Set `FRONTEND_ORIGIN=http://localhost:5173` in `backend/.env` |
| Empty screens | Confirm backend is running and seeded (`npm run db:seed`) |
| 401 after login | Clear `localStorage` key `transitops_session` and re-login |

## Skipped / simplified for hackathon speed

- Trip dispatch/complete/cancel buttons not wired in UI (API exists; create trip + maintenance close are wired)
- Settings RBAC matrix is UI-only (real RBAC is server middleware)
- No WebSocket live board refresh (manual navigation reloads data)
