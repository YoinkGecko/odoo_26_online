import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './lib/logger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import vehicleRoutes from './modules/vehicles/vehicle.routes.js';
import driverRoutes from './modules/drivers/driver.routes.js';
import tripRoutes from './modules/trips/trip.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import fuelExpenseRoutes from './modules/fuel-expenses/fuel-expenses.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

// Security headers
app.use(helmet());

// CORS — explicit allow-list (frontend origin only)
app.use(cors({
  origin: FRONTEND_ORIGIN.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '1mb' }));

// General rate limiter (100 req / 15 min per IP)
app.use(generalLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel-expenses', fuelExpenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 + error handling (never leaks stack traces)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`TransitOps backend running on port ${PORT}`, { frontend: FRONTEND_ORIGIN });
});
