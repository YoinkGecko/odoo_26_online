import { z } from 'zod';

export const CreateVehicleSchema = z.object({
  regNumber: z.string().min(2, "Registration number is required"),
  name: z.string().min(2, "Vehicle name is required"),
  model: z.string().min(2, "Model is required"),
  type: z.enum(['Heavy Truck', 'Medium Truck', 'Pickup', 'Van', 'Bus']),
  fuelType: z.enum(['Diesel', 'Petrol', 'Electric', 'Hybrid']),
  maxCapacity: z.number().int().positive("Capacity must be positive"),
  odometer: z.number().int().nonnegative("Odometer must be non-negative"),
  acquisitionCost: z.number().positive("Cost must be positive"),
  purchaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid purchase date format",
  }),
  insuranceExpiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid insurance expiry date format",
  }),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']).default('Available'),
  photoUrl: z.string().url().optional().nullable(),
  documentUrl: z.string().url().optional().nullable(),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();
