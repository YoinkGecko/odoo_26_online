import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';

const router = Router();

router.get('/reports/kpis', ReportsController.getKpis);
router.get('/reports/charts', ReportsController.getChartsData);
router.get('/reports/top-costly-vehicles', ReportsController.getTopCostlyVehicles);
router.get('/reports/expense-breakdown', ReportsController.getExpenseBreakdown);
router.get('/reports/export/csv', ReportsController.exportCsv);
router.get('/reports/export/pdf', ReportsController.exportPdf);

export default router;
