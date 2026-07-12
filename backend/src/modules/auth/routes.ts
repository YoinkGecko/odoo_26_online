import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me, refresh } from "./controller.js";
import { requireAuth } from "../../middleware/auth.js";

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many login attempts — try again in a minute" } },
});

export const authRoutes = Router();

authRoutes.post("/login", loginLimiter, login);
authRoutes.post("/refresh", refresh);
authRoutes.get("/me", requireAuth, me);
