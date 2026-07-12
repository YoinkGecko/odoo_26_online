import { Router } from 'express';
import { tripController } from './trip.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requireRole('trips'), (_req, res) => tripController.list(_req, res));
router.get('/active', requireAuth, requireRole('trips'), (_req, res) => tripController.active(_req, res));
router.post('/', requireAuth, requireRole('trips', true), (req, res) => tripController.create(req as any, res));
router.post('/:id/dispatch', requireAuth, requireRole('trips', true), (req, res) => tripController.dispatch(req as any, res));
router.post('/:id/complete', requireAuth, requireRole('trips', true), (req, res) => tripController.complete(req as any, res));
router.post('/:id/cancel', requireAuth, requireRole('trips', true), (req, res) => tripController.cancel(req as any, res));

export default router;
