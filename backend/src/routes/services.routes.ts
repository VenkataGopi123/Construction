import { Router } from 'express';
import * as servicesController from '../controllers/services.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

// Public routes for services
router.get('/', servicesController.listServices);
router.get('/:id', servicesController.getService);

// Admin-only routes for services
router.use(authenticate);

router.post('/', authorize('super_admin'), auditLog('CREATE', 'service'), servicesController.createService);
router.put('/:id', authorize('super_admin'), auditLog('UPDATE', 'service'), servicesController.updateService);
router.delete('/:id', authorize('super_admin'), auditLog('DELETE', 'service'), servicesController.deleteService);

export default router;
