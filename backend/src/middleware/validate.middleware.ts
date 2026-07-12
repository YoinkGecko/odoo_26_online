import { Request, Response, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          issue: err.message,
        }));
        return next(new ValidationError('Validation failed', details));
      }
      next(error);
    }
  };
};
