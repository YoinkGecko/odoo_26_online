import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '../lib/response.js';

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';

// requireAuth — verifies JWT access token, attaches user to req
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as any;
    req.user = { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
    next();
  } catch {
    return fail(res, 'TOKEN_EXPIRED', 'Session expired, please log in again', 401);
  }
}
