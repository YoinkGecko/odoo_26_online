import { Request, Response } from 'express';
import { vehicleService } from './vehicle.service.js';
import { ok, fail } from '../../lib/response.js';
import { AuthedRequest } from '../../middleware/auth.js';
import { vehicleSchema } from '../../lib/validators.js';

export class VehicleController {
  async list(_req: Request, res: Response) {
    return ok(res, await vehicleService.list());
  }

  async dispatchable(_req: Request, res: Response) {
    return ok(res, await vehicleService.dispatchable());
  }

  async create(req: AuthedRequest, res: Response) {
    const parsed = vehicleSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const vehicle = await vehicleService.create(parsed.data, req.user!.id);
      return ok(res, vehicle, 201);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }
}

export const vehicleController = new VehicleController();
