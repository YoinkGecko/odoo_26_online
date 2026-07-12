import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  CreateFuelLogSchema,
  UpdateFuelLogSchema,
  CreateExpenseSchema,
  UpdateExpenseSchema
} from '../controllers/expense.validator.js';

const router = Router();

// Fuel Logs routing
router.post('/fuel-logs', validateRequest(CreateFuelLogSchema), ExpenseController.createFuelLog);
router.get('/fuel-logs', ExpenseController.getFuelLogs);
router.get('/fuel-logs/:id', ExpenseController.getFuelLogById);
router.put('/fuel-logs/:id', validateRequest(UpdateFuelLogSchema), ExpenseController.updateFuelLog);
router.delete('/fuel-logs/:id', ExpenseController.deleteFuelLog);

// Expenses Routing
router.get('/expenses/metrics', ExpenseController.getMetrics);
router.get('/expenses/charts', ExpenseController.getChartData);

router.post('/expenses', validateRequest(CreateExpenseSchema), ExpenseController.createExpense);
router.get('/expenses', ExpenseController.getExpenses);
router.get('/expenses/:id', ExpenseController.getExpenseById);
router.put('/expenses/:id', validateRequest(UpdateExpenseSchema), ExpenseController.updateExpense);
router.delete('/expenses/:id', ExpenseController.deleteExpense);

export default router;
