import { Response } from 'express';

// Consistent response envelope: { success, data, error }
// Every endpoint uses this — never send a bare object.

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({ success: false, error: { code, message } });
}

export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}
