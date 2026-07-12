import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendSuccess } from "../../lib/response.js";
import { AnalyticsService } from "./service.js";

const service = new AnalyticsService();

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await service.dashboard());
});

export const getReports = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await service.reports());
});

export const getAuditLog = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await service.auditLog());
});
