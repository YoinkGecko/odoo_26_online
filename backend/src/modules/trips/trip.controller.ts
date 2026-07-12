import { Request, Response } from 'express';
import { tripService } from './trip.service.js';
import { ok, fail } from '../../lib/response.js';
import { AuthedRequest } from '../../middleware/auth.js';
import { tripSchema } from '../../lib/validators.js';

export class TripController {
  async list(_req: Request, res: Response) {
    return ok(res, await tripService.list());
  }

  async active(_req: Request, res: Response) {
    return ok(res, await tripService.active());
  }

  async create(req: AuthedRequest, res: Response) {
    const parsed = tripSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const trip = await tripService.create(parsed.data, req.user!.id);
      return ok(res, trip, 201);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }

  async dispatch(req: AuthedRequest, res: Response) {
    try {
      const trip = await tripService.dispatch(req.params.id, req.user!.id);
      return ok(res, trip);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }

  async complete(req: AuthedRequest, res: Response) {
    try {
      const trip = await tripService.complete(req.params.id, req.user!.id);
      return ok(res, trip);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }

  async cancel(req: AuthedRequest, res: Response) {
    try {
      const trip = await tripService.cancel(req.params.id, req.user!.id);
      return ok(res, trip);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }
}

export const tripController = new TripController();
