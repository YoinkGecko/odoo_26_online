import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginLimiter, (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', requireAuth, (req, res) => authController.logout(req as any, res));
router.get('/me', requireAuth, (req, res) => authController.me(req as any, res));

export default router;
