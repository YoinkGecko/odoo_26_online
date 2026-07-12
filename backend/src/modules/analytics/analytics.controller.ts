import { Request, Response } from 'express';
import { analyticsService } from './analytics.service.js';
import { ok } from '../../lib/response.js';

export class AnalyticsController {
  async dashboard(_req: Request, res: Response) {
    return ok(res, await analyticsService.dashboard());
  }

  async analytics(_req: Request, res: Response) {
    return ok(res, await analyticsService.analytics());
  }
}

export const analyticsController = new AnalyticsController();
