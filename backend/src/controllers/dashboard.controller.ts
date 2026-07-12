import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  public static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const stats = await DashboardService.getDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
