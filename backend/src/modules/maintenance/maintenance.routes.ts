import { Router } from 'express';
import { maintenanceController } from './maintenance.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requireRole('maintenance'), (_req, res) => maintenanceController.list(_req, res));
router.post('/', requireAuth, requireRole('maintenance', true), (req, res) => maintenanceController.create(req as any, res));
router.post('/:id/close', requireAuth, requireRole('maintenance', true), (req, res) => maintenanceController.close(req as any, res));

export default router;
