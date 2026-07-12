import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service.js';

export class VehicleController {
  public static async createVehicle(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      return res.status(201).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getVehicleById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const vehicle = await VehicleService.getVehicleById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateVehicle(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const vehicle = await VehicleService.updateVehicle(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      await VehicleService.deleteVehicle(req.params.id as string);
      return res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getVehicles(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { page, limit, search, type, status, fuelType } = req.query;
      const result = await VehicleService.getVehicles({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        type: type as string,
        status: status as string,
        fuelType: fuelType as string,
      });

      return res.status(200).json({
        success: true,
        data: result.vehicles,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDispatchableVehicles(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const vehicles = await VehicleService.getDispatchableVehicles();
      return res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  }
}
