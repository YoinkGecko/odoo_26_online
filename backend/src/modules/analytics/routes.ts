import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { getAuditLog, getDashboard, getReports } from "./controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth);
analyticsRoutes.get("/dashboard", requireRole("dashboard", "view"), getDashboard);
analyticsRoutes.get("/reports", requireRole("analytics", "view"), getReports);
analyticsRoutes.get("/audit-log", requireRole("analytics", "view"), getAuditLog);
