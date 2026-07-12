import { Router } from 'express';
import { fuelExpenseController } from './fuel-expense.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/fuel', requireAuth, requireRole('fuel-expenses'), (_req, res) => fuelExpenseController.listFuel(_req, res));
router.post('/fuel', requireAuth, requireRole('fuel-expenses', true), (req, res) => fuelExpenseController.createFuel(req as any, res));
router.get('/expenses', requireAuth, requireRole('fuel-expenses'), (_req, res) => fuelExpenseController.listExpenses(_req, res));
router.post('/expenses', requireAuth, requireRole('fuel-expenses', true), (req, res) => fuelExpenseController.createExpense(req as any, res));
router.get('/totals', requireAuth, requireRole('fuel-expenses'), (_req, res) => fuelExpenseController.totals(_req, res));

export default router;
