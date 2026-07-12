import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendSuccess } from "../../lib/response.js";
import { TripService } from "./service.js";

const service = new TripService();

const createSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  cargoWeightKg: z.number().int().nonnegative(),
  plannedDistanceKm: z.number().int().positive().optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  scheduledDate: z.string().optional(),
});

export const listTrips = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const data = await service.list(status);
  sendSuccess(res, data);
});

export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const body = createSchema.parse(req.body);
  const data = await service.create(body, req.user?.sub);
  sendSuccess(res, data, 201);
});

export const dispatchTrip = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.dispatch(req.params.id as string, req.user?.sub);
  sendSuccess(res, data);
});

export const completeTrip = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.complete(req.params.id as string, req.user?.sub);
  sendSuccess(res, data);
});

export const cancelTrip = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.cancel(req.params.id as string, req.user?.sub);
  sendSuccess(res, data);
});
