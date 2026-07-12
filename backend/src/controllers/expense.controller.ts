import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service.js';

export class ExpenseController {
  // Fuel Logs Controllers
  public static async createFuelLog(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await ExpenseService.createFuelLog(req.body);
      return res.status(201).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFuelLogs(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { page, limit, search, vehicleId } = req.query;
      const result = await ExpenseService.getFuelLogs({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        vehicleId: vehicleId as string,
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

  public static async getFuelLogById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await ExpenseService.getFuelLogById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateFuelLog(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await ExpenseService.updateFuelLog(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteFuelLog(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      await ExpenseService.deleteFuelLog(req.params.id as string);
      return res.status(200).json({
        success: true,
        message: "Fuel log deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  // General Expenses Controllers
  public static async createExpense(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await ExpenseService.createExpense(req.body);
      return res.status(201).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExpenses(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { page, limit, search, vehicleId } = req.query;
      const result = await ExpenseService.getExpenses({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        vehicleId: vehicleId as string,
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

  public static async getExpenseById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await ExpenseService.getExpenseById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateExpense(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const record = await ExpenseService.updateExpense(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      await ExpenseService.deleteExpense(req.params.id as string);
      return res.status(200).json({
        success: true,
        message: "Expense record deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  // Summary Operational Metrics
  public static async getMetrics(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const metrics = await ExpenseService.getMetrics();
      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getChartData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const charts = await ExpenseService.getChartData();
      return res.status(200).json({
        success: true,
        data: charts,
      });
    } catch (error) {
      next(error);
    }
  }
}
