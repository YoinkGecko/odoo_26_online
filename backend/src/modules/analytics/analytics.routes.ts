import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/dashboard', requireAuth, requireRole('dashboard'), (_req, res) => analyticsController.dashboard(_req, res));
router.get('/', requireAuth, requireRole('analytics'), (_req, res) => analyticsController.analytics(_req, res));

export default router;
