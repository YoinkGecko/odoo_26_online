import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendSuccess } from "../../lib/response.js";
import { MaintenanceService } from "./service.js";

const service = new MaintenanceService();

const createSchema = z.object({
  vehicleId: z.string().uuid(),
  issue: z.string().min(1),
  serviceType: z.string().min(1),
  cost: z.number().int().nonnegative(),
  openedAt: z.string().optional(),
});

export const listMaintenance = asyncHandler(async (_req: Request, res: Response) => {
  const data = await service.list();
  sendSuccess(res, data);
});

export const createMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const body = createSchema.parse(req.body);
  const data = await service.create(body, req.user?.sub);
  sendSuccess(res, data, 201);
});

export const closeMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.close(req.params.id as string, req.user?.sub);
  sendSuccess(res, data);
});
