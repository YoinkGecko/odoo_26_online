import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { ok, fail } from '../../lib/response.js';
import { AuthedRequest } from '../../middleware/auth.js';
import { loginSchema } from '../../lib/validators.js';

export class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const result = await authService.login(parsed.data.email, parsed.data.password, parsed.data.role);
      return ok(res, result);
    } catch (e: any) {
      return fail(res, e.code ?? 'AUTH_ERROR', e.message ?? 'Login failed', e.status ?? 401);
    }
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) return fail(res, 'VALIDATION', 'Refresh token required', 422);
    try {
      const result = await authService.refresh(refreshToken);
      return ok(res, result);
    } catch (e: any) {
      return fail(res, e.code ?? 'AUTH_ERROR', e.message ?? 'Refresh failed', e.status ?? 401);
    }
  }

  async logout(req: AuthedRequest, res: Response) {
    const refreshToken = req.body?.refreshToken;
    await authService.logout(refreshToken, req.user?.id ?? null);
    return ok(res, { loggedOut: true });
  }

  async me(req: AuthedRequest, res: Response) {
    if (!req.user) return fail(res, 'UNAUTHORIZED', 'Authentication required', 401);
    const user = await authService.me(req.user.id);
    return ok(res, user);
  }
}

export const authController = new AuthController();
