import { Request, Response } from 'express';
import { fuelExpenseService } from './fuel-expense.service.js';
import { ok, fail } from '../../lib/response.js';
import { AuthedRequest } from '../../middleware/auth.js';
import { fuelSchema, expenseSchema } from '../../lib/validators.js';

export class FuelExpenseController {
  async listFuel(_req: Request, res: Response) {
    return ok(res, await fuelExpenseService.listFuel());
  }

  async createFuel(req: AuthedRequest, res: Response) {
    const parsed = fuelSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const log = await fuelExpenseService.createFuel(parsed.data, req.user!.id);
      return ok(res, log, 201);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }

  async listExpenses(_req: Request, res: Response) {
    return ok(res, await fuelExpenseService.listExpenses());
  }

  async createExpense(req: AuthedRequest, res: Response) {
    const parsed = expenseSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input', 422);
    try {
      const exp = await fuelExpenseService.createExpense(parsed.data, req.user!.id);
      return ok(res, exp, 201);
    } catch (e: any) {
      return fail(res, e.code ?? 'ERROR', e.message ?? 'Failed', e.status ?? 400);
    }
  }

  async totals(_req: Request, res: Response) {
    return ok(res, await fuelExpenseService.totals());
  }
}

export const fuelExpenseController = new FuelExpenseController();
