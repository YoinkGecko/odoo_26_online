import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./lib/asyncHandler.js";
import { authRoutes } from "./modules/auth/routes.js";
import { vehicleRoutes } from "./modules/vehicles/routes.js";
import { driverRoutes } from "./modules/drivers/routes.js";
import { tripRoutes } from "./modules/trips/routes.js";
import { maintenanceRoutes } from "./modules/maintenance/routes.js";
import { fuelExpenseRoutes } from "./modules/fuel-expenses/routes.js";
import { analyticsRoutes } from "./modules/analytics/routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.frontendOrigin,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json());

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
  });
  app.use(globalLimiter);

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/auth", authRoutes);
  app.use("/vehicles", vehicleRoutes);
  app.use("/drivers", driverRoutes);
  app.use("/trips", tripRoutes);
  app.use("/maintenance", maintenanceRoutes);
  app.use("/fuel-expenses", fuelExpenseRoutes);
  app.use("/analytics", analyticsRoutes);

  app.use(errorHandler);

  return app;
}
