import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3001", 10),
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:8443",
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? "5", 10),
  lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES ?? "15", 10),
  isProduction: process.env.NODE_ENV === "production",
};

export const BCRYPT_ROUNDS = 12;
