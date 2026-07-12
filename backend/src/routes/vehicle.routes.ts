import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CreateVehicleSchema, UpdateVehicleSchema } from '../controllers/vehicle.validator.js';

const router = Router();

router.post('/', validateRequest(CreateVehicleSchema), VehicleController.createVehicle);
router.get('/', VehicleController.getVehicles);
router.get('/dispatchable', VehicleController.getDispatchableVehicles);
router.get('/:id', VehicleController.getVehicleById);
router.put('/:id', validateRequest(UpdateVehicleSchema), VehicleController.updateVehicle);
router.delete('/:id', VehicleController.deleteVehicle);

export default router;
