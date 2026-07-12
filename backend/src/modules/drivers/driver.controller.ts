import { Request, Response } from 'express';
import { driverService } from './driver.service.js';
import { ok, fail } from '../../lib/response.js';
import { AuthedRequest } from '../../middleware/auth.js';
import { driverSchema } from '../../lib/validators.js';

export class DriverController {
  async list(_req: Request, res: Response) {
    return ok(res, await driverService.list());
  }

  async dispatchable(_req: Request, res: Response) {
    return ok(res, await driverService.dispatchable());
  }

  async create(req: AuthedRequest, res: Response) {
    const parsed = driverSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const driver = await driverService.create(parsed.data, req.user!.id);
      return ok(res, driver, 201);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }
}

export const driverController = new DriverController();
