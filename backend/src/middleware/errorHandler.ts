import { Request, Response, NextFunction } from 'express';
import { fail } from '../lib/response.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../lib/response.js';

// Centralized error middleware — never leaks stack traces to the client.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error', { message: err.message, name: err.name });

  if (err instanceof AppError) {
    return fail(res, err.code, err.message, err.status);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return fail(res, 'VALIDATION', 'Invalid request data', 422);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return fail(res, 'DUPLICATE', 'A record with this value already exists', 409);
    }
    if (prismaErr.code === 'P2025') {
      return fail(res, 'NOT_FOUND', 'Record not found', 404);
    }
    return fail(res, 'DB_ERROR', 'Database operation failed', 500);
  }

  // Fallback — never expose internal details
  return fail(res, 'INTERNAL', 'Internal server error', 500);
}

// 404 handler for unmatched routes
export function notFound(_req: Request, res: Response) {
  return fail(res, 'NOT_FOUND', 'Route not found', 404);
}
