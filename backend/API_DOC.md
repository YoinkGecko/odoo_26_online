# TransitOps Backend API Documentation

This document explains the backend API from start to end. It lists every endpoint, what it expects, what it returns, and which database table it interacts with.

Base URL:

- Local development: http://localhost:4000/api

Authentication:

- Most endpoints require a Bearer token.
- Get the token from POST /auth/login or POST /auth/register.
- Send the header:
  - Authorization: Bearer <token>

## 1. Authentication Endpoints

### POST /auth/register

Creates a new user account.

Required body:

- email: string
- password: string
- name: string
- role: string (optional, defaults to Fleet Manager)

What it uses:

- Table: users

Behavior:

- Checks if email already exists.
- Hashes the password.
- Inserts a new user into users.
- Returns a JWT token and the created user object.

Example request:

```json
{
  "email": "new.user@example.com",
  "password": "Secret123!",
  "name": "New User",
  "role": "Fleet Manager"
}
```

Example response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "usr-123",
    "email": "new.user@example.com",
    "role": "Fleet Manager",
    "name": "New User"
  }
}
```

### POST /auth/login

Logs in an existing user.

Required body:

- email: string
- password: string

What it uses:

- Table: users

Behavior:

- Looks up the user by email.
- Verifies the password using bcrypt.
- Returns a JWT token and the user object.

Example request:

```json
{
  "email": "fleet.manager@transitops.io",
  "password": "FleetOps#2026"
}
```

### GET /auth/me

Returns the currently authenticated user from the JWT token.

Required headers:

- Authorization: Bearer <token>

What it uses:

- No database table directly.
- Reads token details.

---

## 2. Vehicle Endpoints

These endpoints manage the vehicles table.

### GET /vehicles

Returns all vehicles.

Optional query params:

- status: filters by vehicle status
- type: filters by vehicle type
- region: filters by region
- availability=dispatch: returns only available vehicles

What it uses:

- Table: vehicles

Example:

```http
GET /vehicles?status=Available
```

### POST /vehicles

Creates a new vehicle.

Required body:

- registrationNumber: string
- name: string

Optional body:

- type: string
- maxLoadCapacity: number
- odometer: number
- acquisitionCost: number
- status: string
- region: string

What it uses:

- Table: vehicles

Behavior:

- Validates that registration number and name are present.
- Prevents duplicate registration numbers.

Example request:

```json
{
  "registrationNumber": "TX-9999-Z",
  "name": "Ford Transit",
  "type": "Van",
  "maxLoadCapacity": 1500,
  "odometer": 50000,
  "acquisitionCost": 45000,
  "status": "Available",
  "region": "North"
}
```

### PUT /vehicles/:id

Updates an existing vehicle.

Body:

- Any of the vehicle fields

What it uses:

- Table: vehicles

Behavior:

- Updates the selected vehicle by id.
- Prevents duplicate registration numbers.

### DELETE /vehicles/:id

Deletes a vehicle by id.

What it uses:

- Table: vehicles

Behavior:

- Prevents deletion if the vehicle is currently on an active dispatched trip.

---

## 3. Driver Endpoints

These endpoints manage the drivers table.

### GET /drivers

Returns all drivers.

Optional query params:

- status: filter by driver status
- availability=dispatch: returns only available drivers with non-expired license

What it uses:

- Table: drivers

### POST /drivers

Creates a new driver.

Required body:

- name: string
- licenseNumber: string

Optional body:

- licenseCategory: string
- licenseExpiry: string (date)
- contactNumber: string
- safetyScore: number
- status: string

What it uses:

- Table: drivers

Behavior:

- Prevents duplicate license numbers.

### PUT /drivers/:id

Updates an existing driver.

Body:

- Any of the driver fields

What it uses:

- Table: drivers

### PATCH /drivers/:id/suspend

Suspends a driver.

What it uses:

- Table: drivers

Behavior:

- Sets driver status to Suspended.

### PATCH /drivers/:id/reactivate

Reactivates a driver.

What it uses:

- Table: drivers

Behavior:

- Sets driver status to Available.

### DELETE /drivers/:id

Deletes a driver.

What it uses:

- Table: drivers

Behavior:

- Prevents deletion if the driver is assigned to an active dispatched trip.

---

## 4. Trip Endpoints

These endpoints manage the trips table and also update vehicles and drivers statuses.

### GET /trips

Returns all trips.

Optional query params:

- status: filter by trip status
- limit: limit result count
- sort: currently supports createdAt:desc

What it uses:

- Tables: trips, vehicles, drivers

### POST /trips

Creates a new trip draft.

Required body:

- source: string
- destination: string
- vehicleId: string
- driverId: string
- cargoWeight: number
- plannedDistance: number

Optional body:

- eta: string (date)

What it uses:

- Tables: trips, vehicles, drivers

Behavior:

- Validates that the vehicle exists.
- Validates that the driver exists.
- Ensures the vehicle is Available.
- Ensures the driver is not Suspended.
- Ensures driver license is not expired.
- Ensures cargo weight does not exceed vehicle capacity.
- Inserts a new row into trips with status Draft.

Example request:

```json
{
  "source": "Chicago, IL",
  "destination": "Detroit, MI",
  "vehicleId": "veh-001",
  "driverId": "drv-001",
  "cargoWeight": 900,
  "plannedDistance": 370,
  "eta": "2026-07-13"
}
```

### POST /trips/:id/dispatch

Dispatches a draft trip.

What it uses:

- Tables: trips, vehicles, drivers

Behavior:

- Only Draft trips can be dispatched.
- Marks the trip as Dispatched.
- Updates the vehicle status to On Trip.
- Updates the driver status to On Trip.
- Sets dispatched_at date.

### POST /trips/:id/complete

Completes a dispatched trip.

Optional body:

- finalOdometer: number
- fuelConsumed: number

What it uses:

- Tables: trips, vehicles, drivers

Behavior:

- Only Dispatched trips can be completed.
- Marks trip as Completed.
- Restores vehicle and driver to Available.
- Updates vehicle odometer if finalOdometer is supplied.

### POST /trips/:id/cancel

Cancels a trip.

What it uses:

- Tables: trips, vehicles, drivers

Behavior:

- Allows Draft or Dispatched trips to be cancelled.
- If it was Dispatched, vehicle and driver are restored to Available.

### DELETE /trips/:id

Deletes a completed or cancelled trip.

What it uses:

- Table: trips

Behavior:

- Only Completed or Cancelled trips can be deleted.

---

## 5. Maintenance Endpoints

These endpoints manage the maintenance_logs table and may update vehicles.

### GET /maintenance

Returns all maintenance logs.

What it uses:

- Tables: maintenance_logs, vehicles

### POST /maintenance

Creates a new maintenance record.

Required body:

- vehicleId: string
- type: string
- description: string

Optional body:

- cost: number
- openedAt: string (date)

What it uses:

- Tables: maintenance_logs, vehicles

Behavior:

- Sets the vehicle status to In Shop.
- Inserts a new maintenance log with status Open.

### PUT /maintenance/:id

Updates a maintenance record.

Body:

- type: string
- description: string
- cost: number
- openedAt: string

What it uses:

- Table: maintenance_logs

### PATCH /maintenance/:id/close

Closes a maintenance record.

What it uses:

- Tables: maintenance_logs, vehicles

Behavior:

- Marks the maintenance log as Closed.
- If no other open maintenance logs remain for the vehicle, the vehicle status becomes Available.

### DELETE /maintenance/:id

Deletes a maintenance record.

What it uses:

- Tables: maintenance_logs, vehicles

Behavior:

- If the deleted record was Open and no other open maintenance logs remain, the vehicle may return to Available.

---

## 6. Fuel Log Endpoints

These endpoints manage the fuel_logs table.

### GET /fuel-logs

Returns all fuel logs.

What it uses:

- Tables: fuel_logs, vehicles

### POST /fuel-logs

Creates a fuel log.

Required body:

- vehicleId: string
- date: string
- liters: number
- pricePerLiter: number

Optional body:

- tripId: string
- odometer: number
- station: string

What it uses:

- Table: fuel_logs

Behavior:

- Automatically calculates total_cost = liters \* pricePerLiter.

### PUT /fuel-logs/:id

Updates a fuel log.

Body:

- Any of the fuel log fields

What it uses:

- Table: fuel_logs

### DELETE /fuel-logs/:id

Deletes a fuel log.

What it uses:

- Table: fuel_logs

---

## 7. Expense Endpoints

These endpoints manage the expenses table.

### GET /expenses

Returns all expenses.

What it uses:

- Tables: expenses, vehicles

### POST /expenses

Creates an expense record.

Required body:

- vehicleId: string
- date: string
- category: string
- amount: number

Optional body:

- tripId: string
- description: string

What it uses:

- Table: expenses

### PUT /expenses/:id

Updates an expense record.

Body:

- Any of the expense fields

What it uses:

- Table: expenses

### DELETE /expenses/:id

Deletes an expense record.

What it uses:

- Table: expenses

---

## 8. Dashboard Endpoints

These endpoints provide dashboard metrics.

### GET /dashboard/kpis

Returns key performance indicators.

Optional query params:

- vehicleType
- status
- region

What it uses:

- Tables: vehicles, trips, drivers

Returns:

- fleetUtilization
- activeVehicles
- availableVehicles
- inMaintenance
- activeTrips
- pendingTrips
- driversOnDuty
- inShopVehicles
- expiringLicenses
- utilizationPercent

### GET /dashboard/vehicle-status-breakdown

Returns vehicle status distribution.

What it uses:

- Table: vehicles

### GET /dashboard/utilization-trend

Returns utilization trend history.

Optional query param:

- days: number (default 14)

What it uses:

- Tables: trips, vehicles

---

## 9. Database Tables Summary

### users

Stores authentication accounts.
Fields:

- id
- email
- password_hash
- role
- name

### vehicles

Stores vehicles.
Fields:

- id
- registration_number
- name
- type
- max_load_capacity
- odometer
- acquisition_cost
- status
- region

### drivers

Stores drivers.
Fields:

- id
- name
- license_number
- license_category
- license_expiry
- contact_number
- safety_score
- status

### trips

Stores trips.
Fields:

- id
- source
- destination
- vehicle_id
- driver_id
- cargo_weight
- vehicle_max_load
- planned_distance
- status
- created_at
- eta
- dispatched_at
- completed_at
- final_odometer
- fuel_consumed

### maintenance_logs

Stores maintenance records.
Fields:

- id
- vehicle_id
- type
- description
- opened_at
- closed_at
- cost
- status

### fuel_logs

Stores fuel records.
Fields:

- id
- vehicle_id
- trip_id
- date
- liters
- price_per_liter
- total_cost
- odometer
- station

### expenses

Stores expenses.
Fields:

- id
- vehicle_id
- trip_id
- date
- category
- description
- amount

---

## 10. Notes for API Consumers

- All dates should usually be sent in YYYY-MM-DD format.
- The API returns camelCase field names like registrationNumber and vehicleReg.
- Authentication is required for most endpoints.
- Common status values:
  - Vehicles: Available, On Trip, In Shop, Retired
  - Drivers: Available, On Trip, Off Duty, Suspended
  - Trips: Draft, Dispatched, Completed, Cancelled
  - Maintenance: Open, Closed

If you want, I can also turn this into a cleaner Markdown file in the repo root or add sample cURL commands for each endpoint.
