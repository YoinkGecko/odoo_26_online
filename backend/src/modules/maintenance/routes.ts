import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { tokenBucketThrottle } from "../../middleware/throttle.js";
import { closeMaintenance, createMaintenance, listMaintenance } from "./controller.js";

const writeThrottle = tokenBucketThrottle({ capacity: 8, refillPerSec: 2 });

export const maintenanceRoutes = Router();

maintenanceRoutes.use(requireAuth);
maintenanceRoutes.get("/", requireRole("maintenance", "view"), listMaintenance);
maintenanceRoutes.post("/", requireRole("maintenance", "full"), writeThrottle, createMaintenance);
maintenanceRoutes.post("/:id/close", requireRole("maintenance", "full"), writeThrottle, closeMaintenance);
