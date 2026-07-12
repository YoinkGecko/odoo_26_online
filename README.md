# TransitOps Fleet Management

## Overview

This repository contains a fleet management application with a full backend API and a frontend app. The system supports authenticated access, role-based authorization, seeded demo data, and a real API-driven frontend.

- `backend/` - Express.js API server with PostgreSQL persistence.
- `frontend/` - Next.js 15 + React 19 frontend that consumes the backend API.

## What has been implemented

- Complete backend API with authentication, JWT authorization, and role-based access control.
- Frontend configured to use the backend API through `frontend/src/lib/api.ts`.
- Seed data and demo accounts for four roles.
- Role enforcement in backend routes so each user role only accesses permitted endpoints.
- Dashboard KPI endpoints used by the frontend.
- Vehicle, driver, trip, maintenance, fuel log, and expense management APIs.

## Architecture

### Backend

- Entry point: `backend/src/index.js`
- Auth middleware: `backend/src/middleware/auth.js`
- Routes:
  - `backend/src/routes/auth.js`
  - `backend/src/routes/vehicles.js`
  - `backend/src/routes/drivers.js`
  - `backend/src/routes/trips.js`
  - `backend/src/routes/maintenance.js`
  - `backend/src/routes/fuelLogs.js`
  - `backend/src/routes/expenses.js`
  - `backend/src/routes/dashboard.js`
- Database helper: `backend/src/db.js`
- Seed/setup script: `backend/src/setup.js`

### Frontend

- Entry point: `frontend/src/app/page.tsx`
- API client: `frontend/src/lib/api.ts`
- Auth flow and token storage use browser `localStorage`.
- Navigation and page access can be controlled via role information returned by `/api/auth/me`.

## Setup

### Backend

1. Enter the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file in the repository root or backend folder. Required values:
   ```env
   JWT_SECRET=jwtsecretverylongsecretpasswordthatnoonecancrack2052389729ubohv8q23ryp8chpbc7@adhsfphwef
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=root
   DB_NAME=odoo_26
   ```
4. Start the backend dev server:
   ```bash
   npm run dev
   ```
5. Initialize the database schema and seed data:
   ```bash
   npm run db:setup
   ```

### Frontend

1. Enter the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```
4. Visit the frontend at the configured port (default `http://localhost:4028`).

## Demo credentials

The seeded users and roles are:

- Fleet Manager
  - Email: `fleet.manager@transitops.io`
  - Password: `FleetOps#2026`
- Driver
  - Email: `driver@transitops.io`
  - Password: `DriveOps#2026`
- Safety Officer
  - Email: `safety.officer@transitops.io`
  - Password: `SafeOps#2026`
- Financial Analyst
  - Email: `finance@transitops.io`
  - Password: `FinOps#2026`

## API Documentation

### Base URL

- Backend API base: `http://localhost:4000/api`
- Frontend API client uses `NEXT_PUBLIC_API_URL` or defaults to `/api`.

### Authentication

#### POST `/api/auth/register`

- Public endpoint.
- Creates a new user.
- Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "User Name",
    "role": "Fleet Manager"
  }
  ```
- Response:
  ```json
  {
    "token": "...",
    "user": { "id": "usr-...", "email": "...", "role": "...", "name": "..." }
  }
  ```

#### POST `/api/auth/login`

- Public endpoint.
- Request body:
  ```json
  { "email": "user@example.com", "password": "Password123!" }
  ```
- Response includes JWT token and user object.

#### GET `/api/auth/me`

- Requires `Authorization: Bearer <token>`.
- Returns the authenticated user.

### Vehicles

#### GET `/api/vehicles`

- Roles allowed: `Fleet Manager`, `Safety Officer`
- Query params supported: `status`, `type`, `region`, `availability=dispatch`

#### POST `/api/vehicles`

- Role allowed: `Fleet Manager`
- Create a new vehicle.

#### PUT `/api/vehicles/:id`

- Role allowed: `Fleet Manager`
- Update vehicle metadata.

#### DELETE `/api/vehicles/:id`

- Role allowed: `Fleet Manager`
- Deletes vehicle only if not on an active dispatched trip.

### Drivers

#### GET `/api/drivers`

- Roles allowed: `Fleet Manager`, `Safety Officer`
- Query params supported: `status`, `availability=dispatch`

#### POST `/api/drivers`

- Role allowed: `Fleet Manager`
- Create a driver.

#### PUT `/api/drivers/:id`

- Role allowed: `Fleet Manager`
- Update driver details.

#### PATCH `/api/drivers/:id/suspend`

- Role allowed: `Fleet Manager`
- Suspends a driver.

#### PATCH `/api/drivers/:id/reactivate`

- Role allowed: `Fleet Manager`
- Reactivates a suspended driver.

#### DELETE `/api/drivers/:id`

- Role allowed: `Fleet Manager`
- Deletes driver only if not assigned to an active dispatched trip.

### Trips

#### GET `/api/trips`

- Roles allowed: `Fleet Manager`, `Driver`
- Query params supported: `status`, `limit`, `sort`

#### POST `/api/trips`

- Role allowed: `Fleet Manager`
- Create a new trip in `Draft` status.

#### POST `/api/trips/:id/dispatch`

- Role allowed: `Fleet Manager`
- Moves a draft trip to `Dispatched`, and updates vehicle/driver status.

#### POST `/api/trips/:id/complete`

- Role allowed: `Fleet Manager`
- Completes a trip and returns vehicle/driver to `Available`.

#### POST `/api/trips/:id/cancel`

- Role allowed: `Fleet Manager`
- Cancels `Draft` or `Dispatched` trips.

#### DELETE `/api/trips/:id`

- Role allowed: `Fleet Manager`
- Deletes trips only if `Completed` or `Cancelled`.

### Maintenance

#### GET `/api/maintenance`

- Roles allowed: `Fleet Manager`, `Safety Officer`

#### POST `/api/maintenance`

- Roles allowed: `Fleet Manager`, `Safety Officer`

#### PUT `/api/maintenance/:id`

- Roles allowed: `Fleet Manager`, `Safety Officer`

#### PATCH `/api/maintenance/:id/close`

- Roles allowed: `Fleet Manager`, `Safety Officer`
- Closes an open maintenance log and updates vehicle status.

#### DELETE `/api/maintenance/:id`

- Roles allowed: `Fleet Manager`, `Safety Officer`

### Fuel Logs

#### GET `/api/fuel-logs`

- Roles allowed: `Fleet Manager`, `Financial Analyst`

#### POST `/api/fuel-logs`

- Role allowed: `Fleet Manager`

#### PUT `/api/fuel-logs/:id`

- Role allowed: `Fleet Manager`

#### DELETE `/api/fuel-logs/:id`

- Role allowed: `Fleet Manager`

### Expenses

#### GET `/api/expenses`

- Roles allowed: `Fleet Manager`, `Financial Analyst`

#### POST `/api/expenses`

- Role allowed: `Fleet Manager`

#### PUT `/api/expenses/:id`

- Role allowed: `Fleet Manager`

#### DELETE `/api/expenses/:id`

- Role allowed: `Fleet Manager`

### Dashboard

#### GET `/api/dashboard/kpis`

- Public in the current implementation, used by the frontend.
- Accepts query params: `vehicleType`, `status`, `region`.
- Returns fleet utilization, active vehicles, pending trips, expiring licenses, and more.

#### GET `/api/dashboard/vehicle-status-breakdown`

- Returns vehicle counts grouped by status.

#### GET `/api/dashboard/utilization-trend?days=14`

- Returns utilization trend for the configured number of days.

## Roles and access control

The app supports these roles:

- `Fleet Manager` - full access to vehicles, drivers, trips, maintenance, fuel logs, expenses, and most dashboards.
- `Driver` - access to trip listing and trip-related workflows.
- `Safety Officer` - access to vehicles, drivers, and maintenance.
- `Financial Analyst` - access to fuel logs, expenses, and related dashboards.

Backend role enforcement is implemented in `backend/src/middleware/auth.js` using `requireRole(...)` on protected routes.

## Notes

- The frontend app uses `frontend/src/lib/api.ts` to send authenticated requests.
- All API requests go through JWT bearer authentication after login.
- If you want to switch frontend API host, set `NEXT_PUBLIC_API_URL` in frontend environment.
- Demo users are seeded by `backend/src/setup.js`.

## Quick start

1. Start PostgreSQL locally.
2. Run backend setup and server.
3. Start frontend.
4. Login using one of the seeded credentials.

Enjoy the TransitOps demo application with role-based API security and frontend-backed workflows.
