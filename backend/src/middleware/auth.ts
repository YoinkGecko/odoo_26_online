import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { sendError } from "../lib/response.js";

export interface AuthPayload {
  sub: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return sendError(res, 401, { code: "TOKEN_INVALID", message: "Invalid or expired access token" });
  }
}
