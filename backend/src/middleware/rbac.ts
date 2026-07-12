import { Response, NextFunction } from 'express';
import { AuthedRequest } from './auth.js';
import { fail } from '../lib/response.js';
import { canAccess, canWrite, ModuleKey, Role } from '../lib/rbac.js';

// requireRole(module, write?) — checks RBAC matrix for the user's role.
//   write=true → requires 'full' access; otherwise 'view' is also allowed.
export function requireRole(module: ModuleKey, write = false) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return fail(res, 'UNAUTHORIZED', 'Authentication required', 401);
    const role = req.user.role as Role;
    if (!canAccess(role, module)) {
      return fail(res, 'FORBIDDEN', 'You do not have access to this module', 403);
    }
    if (write && !canWrite(role, module)) {
      return fail(res, 'FORBIDDEN', 'You have view-only access to this module', 403);
    }
    next();
  };
}
