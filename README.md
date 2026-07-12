# TransitOps — Smart Transport Operations Platform

A full-stack transport operations platform for logistics companies managing vehicles, drivers, trips, maintenance, and expenses.

**Stack:** React + Vite + Tailwind (frontend) · Node.js + Express + TypeScript (backend) · PostgreSQL + Prisma (database)

---

## Quick Start

### Frontend (runs immediately — in-memory demo backend)

```bash
npm install
npm run dev
```

Open the app at the printed URL. The frontend ships with a **built-in in-memory backend** that enforces all business rules, so you can explore every feature without setting up a database.

**Demo accounts** (password: `demo1234`):

| Role              | Email                    | Lands on        |
|-------------------|--------------------------|-----------------|
| Fleet Manager     | manager@transitops.io    | Dashboard       |
| Dispatcher        | dispatch@transitops.io   | Trips           |
| Safety Officer    | safety@transitops.io     | Maintenance     |
| Financial Analyst | finance@transitops.io    | Analytics       |

### Backend (Express + Prisma + PostgreSQL)

```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL + JWT secrets
npx prisma generate
npx prisma migrate dev    # runs the init migration
npm run seed              # loads realistic sample data
npm run dev               # starts API on http://localhost:4000
```

---

## Required Environment Variables

| Variable              | Description                                    | Example                                              |
|-----------------------|------------------------------------------------|------------------------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string                   | `postgresql://user:pass@localhost:5432/transitops`  |
| `JWT_ACCESS_SECRET`   | Secret for signing access tokens               | `openssl rand -hex 32`                               |
| `JWT_REFRESH_SECRET`  | Secret for signing refresh tokens              | `openssl rand -hex 32`                               |
| `FRONTEND_ORIGIN`     | CORS allow-list origin(s), comma-separated     | `http://localhost:5173`                              |
| `PORT`                | Backend server port                            | `4000`                                               |
| `NODE_ENV`            | Environment                                    | `development`                                        |

---

## Migrations & Seed

```bash
cd backend

# Apply the initial migration (creates all tables, enums, indexes)
npx prisma migrate dev --name init

# Re-run anytime to apply pending migrations
npx prisma migrate deploy

# Load sample data (4 users, 8 vehicles, 6 drivers, 4 trips, etc.)
npm run seed
```

The migration is written as real SQL in `backend/prisma/migrations/20250115000000_init/migration.sql` and uses Postgres enums for every status field, with indexes on `vehicles.status`, `drivers.status`, and `drivers.licenseExpiry`.

---

## Architecture

### Frontend (`src/`)

```
src/
├── components/         # Reusable UI: Button, Badge, Card, Table, FilterBar, RuleNote
│   └── ui/             # Design-system primitives
├── context/            # AuthContext (login/logout/session)
├── data/seed.ts        # In-memory seed data
├── screens/            # One file per screen (Login, Dashboard, Fleet, …)
├── api.ts              # In-memory backend with business-rule enforcement
├── types.ts            # Domain types, RBAC matrix, labels
└── utils/              # Formatting + cn() helper
```

### Backend (`backend/`)

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma schema (entities, enums, indexes)
│   ├── migrations/            # Real SQL migration
│   └── seed.ts                # Sample data script
└── src/
    ├── modules/
    │   ├── auth/              # routes → controller → service
    │   ├── vehicles/          # routes → controller → service
    │   ├── drivers/           # routes → controller → service
    │   ├── trips/             # routes → controller → service (atomic transactions)
    │   ├── maintenance/       # routes → controller → service
    │   ├── fuel-expenses/     # routes → controller → service
    │   └── analytics/         # routes → controller → service
    ├── middleware/
    │   ├── auth.ts            # JWT verification (requireAuth)
    │   ├── rbac.ts            # Role-based access guard (requireRole)
    │   ├── rateLimiter.ts     # Custom sliding-window rate limiter
    │   └── errorHandler.ts    # Centralized error handling (no stack traces leaked)
    └── lib/
        ├── prisma.ts          # Prisma client
        ├── response.ts        # { success, data, error } envelope
        ├── rbac.ts            # Permission matrix
        ├── validators.ts      # Zod schemas for every request body
        ├── audit.ts           # audit_logs writer
        └── logger.ts          # Structured logger
```

Every module follows the **routes → controller → service** pattern. Controllers only parse/validate input and format responses. All business logic lives in services. The response envelope `{ success, data, error }` is used on every endpoint via shared helpers.

---

## RBAC — One Login, Four Roles

| Module           | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|------------------|:-------------:|:----------:|:--------------:|:-----------------:|
| Dashboard        | Full          | Full       | View           | View              |
| Fleet            | Full          | View       | View           | View              |
| Drivers          | Full          | View       | Full           | View              |
| Trips            | Full          | Full       | View           | View              |
| Maintenance      | Full          | —          | Full           | View              |
| Fuel & Expenses  | Full          | —          | View           | Full              |
| Analytics        | Full          | —          | View           | Full              |
| Settings         | Full          | —          | —              | —                 |

The matrix is enforced both in the frontend sidebar (hidden nav items) and in the backend `requireRole()` middleware (403 on violation).

---

## Business Rules (enforced server-side)

All rules are checked in the service layer, not just the UI. Rejections return a structured error the frontend renders via `<RuleNote>`:

```json
{ "success": false, "error": { "code": "CAPACITY_EXCEEDED", "message": "Cargo weight exceeds TRK-7781 capacity by 200kg — dispatch blocked" } }
```

| Rule | Enforcement point |
|------|-------------------|
| Vehicle reg number is unique | DB unique constraint + service check |
| Retired/In Shop vehicles hidden from dispatch | `vehicleService.dispatchable()` filters to `AVAILABLE` |
| Expired license or Suspended driver can't be assigned | `tripService.create()` + `dispatch()` check `licenseExpiry` + `status` |
| Vehicle/Driver already On Trip can't be re-assigned | Status check before dispatch |
| Cargo weight ≤ vehicle max capacity | `CAPACITY_EXCEEDED` rejection |
| Dispatch atomically sets vehicle + driver to On Trip | `prisma.$transaction()` |
| Completing reverts both to Available | `prisma.$transaction()` |
| Cancelling restores both to Available | `prisma.$transaction()` |
| Opening maintenance sets vehicle to In Shop | `maintenanceService.create()` |
| Closing maintenance restores to Available (unless Retired) | `maintenanceService.close()` |

---

## Security

- **Bcrypt** password hashing (cost 12)
- **JWT** access tokens (15 min TTL) + refresh token rotation
- **Account lockout** after 5 failed login attempts (15-min lock)
- **Rate limiting** — custom sliding-window middleware (100 req/15 min general, 5 req/min on `/auth/login`)
- **Zod** schema validation on every request body
- **Parameterized queries** only (Prisma default — no raw SQL string concatenation)
- **Helmet** security headers
- **CORS** allow-list (frontend origin only)
- **audit_logs** entry on every state-changing action
- **Centralized error middleware** — never leaks stack traces

---

## API Endpoints

```
POST   /api/auth/login            Login (rate-limited 5/min)
POST   /api/auth/refresh          Refresh token rotation
POST   /api/auth/logout           Revoke refresh token
GET    /api/auth/me               Current user

GET    /api/vehicles              List vehicles
GET    /api/vehicles/dispatchable Available vehicles for dispatch
POST   /api/vehicles              Register vehicle (full access)

GET    /api/drivers               List drivers
GET    /api/drivers/dispatchable  Available + valid-license drivers
POST   /api/drivers               Add driver (full access)

GET    /api/trips                 List all trips
GET    /api/trips/active          Active/draft trips
POST   /api/trips                 Create draft trip
POST   /api/trips/:id/dispatch    Dispatch (atomic)
POST   /api/trips/:id/complete    Complete (atomic)
POST   /api/trips/:id/cancel      Cancel (restores availability)

GET    /api/maintenance           List service logs
POST   /api/maintenance           Log service (vehicle → In Shop)
POST   /api/maintenance/:id/close Close record (vehicle → Available)

GET    /api/fuel-expenses/fuel        List fuel logs
POST   /api/fuel-expenses/fuel        Log fuel
GET    /api/fuel-expenses/expenses    List expenses
POST   /api/fuel-expenses/expenses    Add expense
GET    /api/fuel-expenses/totals      Total operational cost

GET    /api/analytics/dashboard   Dashboard KPIs + breakdown
GET    /api/analytics             Analytics KPIs + charts data
```

---

## Design System

- **Light theme** — off-white background (`#FAFAFA`), white cards with 1px gray borders, no drop shadows
- **Primary accent** — deep purple (`#5B3A6B`) used sparingly (buttons, active nav, links)
- **Status badges** — soft-tint pills: green=Available/Completed, blue=On Trip/Dispatched, amber=In Shop/Pending, red=Suspended/Cancelled/Retired
- **Inter font** — regular + medium weights
- **Compact, data-dense tables** — this is an ops tool
- **Reusable components** — Button, Badge, Table, Card, FilterBar, RuleNote used identically across all screens
