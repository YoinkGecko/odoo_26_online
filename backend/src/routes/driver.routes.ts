import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CreateDriverSchema, UpdateDriverSchema } from '../controllers/driver.validator.js';

const router = Router();

router.post('/', validateRequest(CreateDriverSchema), DriverController.createDriver);
router.get('/', DriverController.getDrivers);
router.get('/dispatchable', DriverController.getDispatchableDrivers);
router.get('/:id', DriverController.getDriverById);
router.put('/:id', validateRequest(UpdateDriverSchema), DriverController.updateDriver);
router.delete('/:id', DriverController.deleteDriver);

export default router;
