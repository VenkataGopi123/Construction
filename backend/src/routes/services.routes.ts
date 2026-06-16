import { Router } from 'express';
import * as servicesController from '../controllers/services.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes for services
router.get('/', servicesController.listServices);
router.get('/:id', servicesController.getService);

// Admin-only routes for services
router.use(authenticate);

router.post('/', authorize('admin'), servicesController.createService);
router.put('/:id', authorize('admin'), servicesController.updateService);
router.delete('/:id', authorize('admin'), servicesController.deleteService);

export default router;
