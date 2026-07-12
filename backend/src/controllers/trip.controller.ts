import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service.js';

export class TripController {
  public static async createTrip(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const trip = await TripService.createTrip(req.body);
      return res.status(201).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTripById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const trip = await TripService.getTripById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateTrip(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const trip = await TripService.updateTrip(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async dispatchTrip(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const trip = await TripService.dispatchTrip(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async completeTrip(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const trip = await TripService.completeTrip(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async cancelTrip(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const trip = await TripService.cancelTrip(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTrips(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { page, limit, search, status, priority } = req.query;
      const result = await TripService.getTrips({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
        priority: priority as string,
      });

      return res.status(200).json({
        success: true,
        data: result.trips,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
