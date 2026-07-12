import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/db.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function writeAuditLog(
  params: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Prisma.InputJsonValue;
  },
  db: DbClient = prisma,
) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
    },
  });
}
