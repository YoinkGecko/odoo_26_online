import { z } from 'zod';

// Reusable Zod schemas — validated before reaching any service.

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  role: z.enum(['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']),
});

export const vehicleSchema = z.object({
  regNo: z.string().min(1).max(20),
  model: z.string().min(1).max(100),
  type: z.enum(['TRUCK', 'VAN', 'TRAILER', 'BUS', 'PICKUP']),
  maxCapacity: z.number().int().positive(),
  odometer: z.number().int().min(0).optional().default(0),
  acquisitionCost: z.number().min(0).optional().default(0),
  region: z.string().optional().default('Central'),
});

export const driverSchema = z.object({
  name: z.string().min(1).max(100),
  licenseNo: z.string().min(1).max(30),
  licenseCategory: z.enum(['A', 'B', 'C', 'CE']),
  licenseExpiry: z.string().datetime(),
  contact: z.string().max(50).optional().default(''),
  safetyScore: z.number().int().min(0).max(100).optional().default(80),
});

export const tripSchema = z.object({
  source: z.string().min(1).max(100),
  destination: z.string().min(1).max(100),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeight: z.number().int().positive(),
  plannedDistance: z.number().positive(),
});

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  serviceType: z.string().min(1).max(100),
  cost: z.number().min(0),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional().default(''),
});

export const fuelSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().datetime().optional(),
  liters: z.number().positive(),
  cost: z.number().positive(),
});

export const expenseSchema = z.object({
  tripId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  type: z.enum(['TOLL', 'MISC']),
  amount: z.number().positive(),
  date: z.string().datetime().optional(),
  description: z.string().max(200).optional().default(''),
});
