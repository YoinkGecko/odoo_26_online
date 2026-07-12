import { Request, Response, NextFunction } from 'express';
import { DriverService } from '../services/driver.service.js';

export class DriverController {
  public static async createDriver(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const driver = await DriverService.createDriver(req.body);
      return res.status(201).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDriverById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const driver = await DriverService.getDriverById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateDriver(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const driver = await DriverService.updateDriver(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteDriver(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      await DriverService.deleteDriver(req.params.id as string);
      return res.status(200).json({
        success: true,
        message: 'Driver deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDrivers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { page, limit, search, status, category, minSafetyScore } = req.query;
      const result = await DriverService.getDrivers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
        category: category as string,
        minSafetyScore: minSafetyScore ? Number(minSafetyScore) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: result.drivers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDispatchableDrivers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const drivers = await DriverService.getDispatchableDrivers();
      return res.status(200).json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  }
}
