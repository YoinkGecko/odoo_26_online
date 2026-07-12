# TransitOps Backend

Node.js + TypeScript + Express + PostgreSQL + Prisma API for the TransitOps fleet platform.

## Architecture

```
Frontend (React) ──REST/JWT──▶ Express routes
                                  ▼
                            Controllers (thin)
                                  ▼
                            Services (business rules + state machines)
                                  ▼
                            Repositories + Prisma ──▶ PostgreSQL
```

Business rules (capacity checks, license expiry, atomic dispatch/complete/cancel, maintenance → In Shop) live in **service layer only**. Every state-changing action writes to the **audit_logs** table.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (self-hosted)

## Quick start

```bash
cd backend
cp .env.example .env
# Edit .env if your Postgres credentials differ

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API runs at **http://localhost:3001**

## Demo credentials

| Role | Email (auto-mapped from role dropdown) | Password |
|------|----------------------------------------|----------|
| Fleet Manager | fleet@transitops.co | TransitOps2026! |
| Dispatcher | dispatcher@transitops.co | TransitOps2026! |
| Safety Officer | safety@transitops.co | TransitOps2026! |
| Financial Analyst | finance@transitops.co | TransitOps2026! |

On login, the frontend sends a **role** from the dropdown; the backend maps it to the persona account above.

## Environment variables

See `.env.example`. Required:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — min 32 chars
- `FRONTEND_ORIGIN` — CORS allow-list (default `http://localhost:5173`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run db:migrate:dev` | Create/apply migrations |
| `npm run db:seed` | Populate demo data |
| `npm run db:reset` | Reset DB + re-seed |

## API routes

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| Vehicles | `GET/POST /vehicles`, `PATCH /vehicles/:id` |
| Drivers | `GET/POST /drivers`, `PATCH /drivers/:id` |
| Trips | `GET/POST /trips`, `POST /trips/:id/dispatch\|complete\|cancel` |
| Maintenance | `GET/POST /maintenance`, `POST /maintenance/:id/close` |
| Fuel | `GET/POST /fuel-expenses/fuel-logs`, `GET/POST /fuel-expenses/expenses` |
| Analytics | `GET /analytics/dashboard`, `/reports`, `/audit-log` |

## Security features

- bcrypt password hashing (cost 12)
- JWT access tokens (~15 min) + httpOnly refresh cookie with rotation
- Account lockout after 5 failed logins
- Global rate limit (100 req / 15 min) + login limit (5 req / min)
- Token-bucket throttle on write endpoints
- Zod validation on all mutating routes
- Helmet security headers + explicit CORS origin
- Centralized error handler (no stack traces in production)

## RBAC

`requireRole(module, "view"|"full")` middleware on every route. Returns **403** when insufficient permissions.
