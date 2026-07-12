import type { NextFunction, Request, Response } from "express";
import type { ModuleKey } from "../config/constants.js";
import { ROLE_PERMISSIONS } from "../config/constants.js";
import { sendError } from "../lib/response.js";

export function requireRole(module: ModuleKey, min: "view" | "full" = "view") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const perm = ROLE_PERMISSIONS[req.user.role][module];
    const allowed = min === "full" ? perm === "full" : perm === "full" || perm === "view";

    if (!allowed) {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Insufficient permissions for this action" });
    }

    next();
  };
}
