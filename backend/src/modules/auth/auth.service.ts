import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/response.js';
import { audit } from '../../lib/audit.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 7;
const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function signAccessToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefreshToken(user: { id: string }) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` });
}

export class AuthService {
  async login(email: string, password: string, role: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError('ACCOUNT_LOCKED', `Account locked. Try again in ${mins} min.`, 403);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const attempts = user.failedAttempts + 1;
      if (attempts >= MAX_FAILED) {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) },
        });
        throw new AppError('ACCOUNT_LOCKED', 'Too many failed attempts. Account locked for 15 minutes.', 403);
      }
      await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: attempts } });
      const remaining = MAX_FAILED - attempts;
      throw new AppError('INVALID_CREDENTIALS', `Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, 401);
    }

    if (user.role !== role) {
      throw new AppError('ROLE_MISMATCH', `This email is not registered as ${role.replace(/_/g, ' ').toLowerCase()}.`, 403);
    }

    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null } });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000) },
    });

    await audit({ userId: user.id, action: 'LOGIN', entity: 'auth', entityId: user.id, details: `${user.name} logged in` });

    return {
      token: accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as any;
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError('INVALID_REFRESH', 'Refresh token invalid or expired', 401);
    }
    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError('INVALID_REFRESH', 'User not found', 401);
    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    await prisma.refreshToken.create({
      data: { token: newRefresh, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000) },
    });
    return { token: newAccess, refreshToken: newRefresh };
  }

  async logout(refreshToken: string | undefined, userId: string | null) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
    }
    if (userId) await audit({ userId, action: 'LOGOUT', entity: 'auth', entityId: userId, details: 'User logged out' });
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
    return user;
  }
}

export const authService = new AuthService();
