import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendSuccess } from "../../lib/response.js";
import { FuelExpenseService } from "./service.js";

const service = new FuelExpenseService();

const fuelSchema = z.object({
  vehicleId: z.string().uuid(),
  date: z.string(),
  liters: z.number().positive(),
  cost: z.number().int().nonnegative(),
  kmCovered: z.number().int().nonnegative(),
});

const expenseSchema = z.object({
  vehicleId: z.string().uuid(),
  expenseType: z.string().min(1),
  amount: z.number().int().nonnegative(),
  date: z.string(),
});

export const listFuelLogs = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await service.listFuelLogs());
});

export const listExpenses = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await service.listExpenses());
});

export const createFuelLog = asyncHandler(async (req: Request, res: Response) => {
  const body = fuelSchema.parse(req.body);
  sendSuccess(res, await service.createFuelLog(body), 201);
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const body = expenseSchema.parse(req.body);
  sendSuccess(res, await service.createExpense(body), 201);
});
