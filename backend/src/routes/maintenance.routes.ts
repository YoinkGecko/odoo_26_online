import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CreateMaintenanceSchema, UpdateMaintenanceSchema } from '../controllers/maintenance.validator.js';

const router = Router();

router.post('/', validateRequest(CreateMaintenanceSchema), MaintenanceController.createMaintenance);
router.get('/', MaintenanceController.getMaintenanceRecords);
router.get('/:id', MaintenanceController.getMaintenanceById);
router.put('/:id', validateRequest(UpdateMaintenanceSchema), MaintenanceController.updateMaintenance);
router.delete('/:id', MaintenanceController.deleteMaintenance);

export default router;
