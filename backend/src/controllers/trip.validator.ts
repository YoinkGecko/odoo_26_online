import { z } from 'zod';

export const CreateTripSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  origin: z.string().min(2, "Origin location is required"),
  destination: z.string().min(2, "Destination location is required"),
  cargo: z.string().min(1, "Cargo type is required"),
  weight: z.number().int().positive("Cargo weight must be greater than zero"),
  priority: z.enum(['Normal', 'High', 'Urgent']).default('Normal'),
  status: z.enum(['Draft', 'Scheduled', 'In Progress', 'Completed', 'Cancelled']).default('Scheduled'),
  notes: z.string().optional().nullable(),
  eta: z.string().optional().nullable(),
  distance: z.string().optional().nullable(),
});

export const UpdateTripSchema = CreateTripSchema.partial();
