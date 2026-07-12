import { prisma } from './prisma.js';

// Write an audit log entry on every state-changing action.
export async function audit(opts: {
  userId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: opts.userId,
      action: opts.action,
      entity: opts.entity,
      entityId: opts.entityId ?? null,
      details: opts.details ?? '',
    },
  });
}
