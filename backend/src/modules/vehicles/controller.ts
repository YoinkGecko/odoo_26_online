import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendSuccess } from "../../lib/response.js";
import { VehicleService } from "./service.js";

const service = new VehicleService();

const createSchema = z.object({
  registrationNumber: z.string().min(1),
  model: z.string().min(1),
  type: z.string().min(1),
  maxLoadKg: z.number().int().positive(),
  odometerKm: z.number().int().nonnegative(),
  region: z.string().min(1),
});

const updateSchema = z.object({
  model: z.string().optional(),
  type: z.string().optional(),
  maxLoadKg: z.number().int().positive().optional(),
  odometerKm: z.number().int().nonnegative().optional(),
  region: z.string().optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
});

export const listVehicles = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const dispatchable = req.query.dispatchable === "true";
  const data = await service.list({ status, dispatchable });
  sendSuccess(res, data);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const body = createSchema.parse(req.body);
  const data = await service.create(body);
  sendSuccess(res, data, 201);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const body = updateSchema.parse(req.body);
  const data = await service.update(req.params.id as string, body);
  sendSuccess(res, data);
});
