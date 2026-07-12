import type { Request, Response } from "express";
import { z } from "zod";
import { roleDisplayName } from "../../config/constants.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendSuccess } from "../../lib/response.js";
import { AuthService } from "./service.js";

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.string().optional(),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password, body.role);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(res, { accessToken: result.accessToken, user: result.user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, error: { code: "NO_REFRESH_TOKEN", message: "Refresh token required" } });
    return;
  }
  const result = await authService.refresh(token);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(res, { accessToken: result.accessToken });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, {
    user: {
      id: req.user!.sub,
      email: req.user!.email,
      role: roleDisplayName(req.user!.role),
    },
  });
});
