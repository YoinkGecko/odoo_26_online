import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CreateTripSchema, UpdateTripSchema } from '../controllers/trip.validator.js';

const router = Router();

router.post('/', validateRequest(CreateTripSchema), TripController.createTrip);
router.get('/', TripController.getTrips);
router.get('/:id', TripController.getTripById);
router.put('/:id', validateRequest(UpdateTripSchema), TripController.updateTrip);
router.post('/:id/dispatch', TripController.dispatchTrip);
router.post('/:id/complete', TripController.completeTrip);
router.post('/:id/cancel', TripController.cancelTrip);

export default router;
