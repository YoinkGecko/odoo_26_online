import { Router } from 'express';
import { driverController } from './driver.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requireRole('drivers'), (_req, res) => driverController.list(_req, res));
router.get('/dispatchable', requireAuth, requireRole('trips'), (_req, res) => driverController.dispatchable(_req, res));
router.post('/', requireAuth, requireRole('drivers', true), (req, res) => driverController.create(req as any, res));

export default router;
