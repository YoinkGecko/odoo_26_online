import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { BCRYPT_ROUNDS, emailForRole, roleDisplayName, roleFromDisplayName } from "../../config/constants.js";
import { env } from "../../config/env.js";
import { businessError } from "../../lib/response.js";
import type { AuthPayload } from "../../middleware/auth.js";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateLoginSuccess(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async incrementFailedLogin(userId: string, attempts: number) {
    const lockedUntil =
      attempts >= env.maxLoginAttempts
        ? new Date(Date.now() + env.lockoutMinutes * 60 * 1000)
        : null;
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
  }

  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  async revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }
}

export class AuthService {
  constructor(private repo = new AuthRepository()) {}

  signAccessToken(user: User) {
    const payload: AuthPayload = { sub: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"] });
  }

  signRefreshToken(user: User) {
    return jwt.sign({ sub: user.id }, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  async login(email: string, password: string, roleDisplay?: string) {
    let user = await this.repo.findByEmail(email.toLowerCase());

    // Demo: map role dropdown to persona email when using shared demo login
    if (roleDisplay) {
      const role = roleFromDisplayName(roleDisplay);
      if (role) {
        const personaEmail = emailForRole(role);
        user = await this.repo.findByEmail(personaEmail);
      }
    }

    if (!user) {
      throw businessError("INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw businessError(
        "ACCOUNT_LOCKED",
        `Account locked after ${env.maxLoginAttempts} failed attempts. Try again later.`,
        "Account locked",
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      await this.repo.incrementFailedLogin(user.id, attempts);
      if (attempts >= env.maxLoginAttempts) {
        throw businessError(
          "ACCOUNT_LOCKED",
          `Account locked after ${env.maxLoginAttempts} failed attempts.`,
          "Account locked",
        );
      }
      throw businessError("INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (roleDisplay) {
      const expectedRole = roleFromDisplayName(roleDisplay);
      if (expectedRole && user.role !== expectedRole) {
        throw businessError("ROLE_MISMATCH", "Selected role does not match this account");
      }
    }

    await this.repo.updateLoginSuccess(user.id);
    await this.repo.revokeAllRefreshTokens(user.id);

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.repo.storeRefreshToken(user.id, refreshToken, refreshExpires);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: roleDisplayName(user.role),
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { sub: string };
    } catch {
      throw businessError("TOKEN_INVALID", "Invalid or expired refresh token");
    }

    const stored = await this.repo.findRefreshToken(refreshToken);
    if (!stored || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
      throw businessError("TOKEN_INVALID", "Invalid or expired refresh token");
    }

    const user = stored.user;
    await this.repo.revokeRefreshToken(refreshToken);

    const newAccess = this.signAccessToken(user);
    const newRefresh = this.signRefreshToken(user);
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.repo.storeRefreshToken(user.id, newRefresh, refreshExpires);

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  static async hashPassword(password: string) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }
}
