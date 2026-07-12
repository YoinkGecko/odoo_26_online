import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, sendError } from "./response.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, {
      code: err.code,
      message: err.message,
      highlight: err.highlight,
    });
  }

  if (err instanceof ZodError) {
    const first = err.errors[0];
    return sendError(res, 400, {
      code: "VALIDATION_ERROR",
      message: first?.message ?? "Invalid request body",
    });
  }

  console.error(err);
  return sendError(res, 500, {
    code: "INTERNAL_ERROR",
    message: env.isProduction ? "An unexpected error occurred" : String(err),
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
