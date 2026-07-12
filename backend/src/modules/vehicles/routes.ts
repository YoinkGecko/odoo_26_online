import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { createVehicle, listVehicles, updateVehicle } from "./controller.js";

export const vehicleRoutes = Router();

vehicleRoutes.use(requireAuth);
vehicleRoutes.get("/", requireRole("fleet", "view"), listVehicles);
vehicleRoutes.post("/", requireRole("fleet", "full"), createVehicle);
vehicleRoutes.patch("/:id", requireRole("fleet", "full"), updateVehicle);
