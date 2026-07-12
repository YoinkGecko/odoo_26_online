import { z } from 'zod';

export const CreateDriverSchema = z.object({
  name: z.string().min(2, "Driver name is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid license expiry date format",
  }),
  phone: z.string().min(5, "Contact number is required"),
  safetyScore: z.number().int().min(0).max(100).default(100),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).default('Available'),
  experience: z.string().min(1, "Experience is required"),
  tripsCount: z.number().int().nonnegative().default(0),
  incidentsCount: z.number().int().nonnegative().default(0),
  rating: z.number().min(1.0).max(5.0).default(5.0),
  avatar: z.string().min(1, "Avatar label is required"),
});

export const UpdateDriverSchema = CreateDriverSchema.partial();
