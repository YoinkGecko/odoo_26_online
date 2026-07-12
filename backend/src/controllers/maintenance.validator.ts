import { z } from 'zod';

export const CreateMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  type: z.string().min(2, "Service type is required"),
  category: z.enum(["Mechanical", "Brakes", "Tyres", "Electrical", "Inspection", "Servicing"]),
  priority: z.enum(["Normal", "High", "Critical"]),
  cost: z.number().nonnegative("Estimated cost must be positive or zero"),
  technician: z.string().min(2, "Technician name is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid scheduled date format",
  }),
  status: z.enum(["Scheduled", "In Progress", "Completed", "Overdue"]).default("Scheduled"),
  notes: z.string().optional().nullable(),
});

export const UpdateMaintenanceSchema = CreateMaintenanceSchema.partial();
