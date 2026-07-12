import { Request, Response } from 'express';
import { maintenanceService } from './maintenance.service.js';
import { ok, fail } from '../../lib/response.js';
import { AuthedRequest } from '../../middleware/auth.js';
import { maintenanceSchema } from '../../lib/validators.js';

export class MaintenanceController {
  async list(_req: Request, res: Response) {
    return ok(res, await maintenanceService.list());
  }

  async create(req: AuthedRequest, res: Response) {
    const parsed = maintenanceSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const log = await maintenanceService.create(parsed.data, req.user!.id);
      return ok(res, log, 201);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }

  async close(req: AuthedRequest, res: Response) {
    try {
      const log = await maintenanceService.close(req.params.id, req.user!.id);
      return ok(res, log);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }
}

export const maintenanceController = new MaintenanceController();
