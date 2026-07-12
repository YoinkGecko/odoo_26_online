import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { tokenBucketThrottle } from "../../middleware/throttle.js";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  listTrips,
} from "./controller.js";

const writeThrottle = tokenBucketThrottle({ capacity: 8, refillPerSec: 2 });

export const tripRoutes = Router();

tripRoutes.use(requireAuth);
tripRoutes.get("/", requireRole("trips", "view"), listTrips);
tripRoutes.post("/", requireRole("trips", "full"), writeThrottle, createTrip);
tripRoutes.post("/:id/dispatch", requireRole("trips", "full"), writeThrottle, dispatchTrip);
tripRoutes.post("/:id/complete", requireRole("trips", "full"), writeThrottle, completeTrip);
tripRoutes.post("/:id/cancel", requireRole("trips", "full"), writeThrottle, cancelTrip);
