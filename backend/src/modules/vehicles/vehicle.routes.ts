import { Router } from 'express';
import { vehicleController } from './vehicle.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requireRole('fleet'), (_req, res) => vehicleController.list(_req, res));
router.get('/dispatchable', requireAuth, requireRole('trips'), (_req, res) => vehicleController.dispatchable(_req, res));
router.post('/', requireAuth, requireRole('fleet', true), (req, res) => vehicleController.create(req as any, res));

export default router;
