import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service.js';

export class MaintenanceController {
  public static async createMaintenance(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await MaintenanceService.createMaintenance(req.body);
      return res.status(201).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMaintenanceById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await MaintenanceService.getMaintenanceById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateMaintenance(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await MaintenanceService.updateMaintenance(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteMaintenance(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      await MaintenanceService.deleteMaintenance(req.params.id as string);
      return res.status(200).json({
        success: true,
        message: "Maintenance record deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMaintenanceRecords(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { page, limit, search, status, category } = req.query;
      const result = await MaintenanceService.getMaintenanceRecords({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
        category: category as string,
      });

      return res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
