import type { Response } from "express";

export interface ApiErrorBody {
  code: string;
  message: string;
  highlight?: string;
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(
  res: Response,
  status: number,
  error: ApiErrorBody,
) {
  return res.status(status).json({ success: false, error });
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public highlight?: string,
  ) {
    super(message);
  }
}

export function businessError(code: string, message: string, highlight?: string): AppError {
  return new AppError(422, code, message, highlight);
}
