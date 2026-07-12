import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { createDriver, listDrivers, updateDriver } from "./controller.js";

export const driverRoutes = Router();

driverRoutes.use(requireAuth);
driverRoutes.get("/", requireRole("drivers", "view"), listDrivers);
driverRoutes.post("/", requireRole("drivers", "full"), createDriver);
driverRoutes.patch("/:id", requireRole("drivers", "full"), updateDriver);
