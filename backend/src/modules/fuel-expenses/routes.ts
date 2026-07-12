import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import {
  createExpense,
  createFuelLog,
  listExpenses,
  listFuelLogs,
} from "./controller.js";

export const fuelExpenseRoutes = Router();

fuelExpenseRoutes.use(requireAuth);
fuelExpenseRoutes.get("/fuel-logs", requireRole("fuel", "view"), listFuelLogs);
fuelExpenseRoutes.post("/fuel-logs", requireRole("fuel", "full"), createFuelLog);
fuelExpenseRoutes.get("/expenses", requireRole("fuel", "view"), listExpenses);
fuelExpenseRoutes.post("/expenses", requireRole("fuel", "full"), createExpense);
