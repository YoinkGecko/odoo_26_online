import { z } from 'zod';

export const CreateFuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  liters: z.number().positive("Liters must be positive"),
  cost: z.number().positive("Cost must be positive"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  odometer: z.number().int().nonnegative("Odometer must be non-negative"),
  station: z.string().min(3, "Station name must be at least 3 characters"),
  efficiency: z.string().optional().nullable(),
});

export const UpdateFuelLogSchema = CreateFuelLogSchema.partial();

export const CreateExpenseSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: z.enum(["Fuel", "Maintenance", "Toll", "Insurance", "Repair", "Other"]),
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.number().positive("Amount must be positive"),
  receipt: z.string().min(2, "Receipt code is required"),
  status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();
