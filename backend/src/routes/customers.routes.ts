import { Router } from 'express';
import * as customersController from '../controllers/customers.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'project_manager', 'customer'), customersController.listCustomers);
router.get('/leads', authorize('super_admin', 'project_manager'), customersController.listLeads);
router.post('/leads', authorize('super_admin', 'project_manager'), auditLog('CREATE', 'crm_lead'), customersController.createLead);
router.get('/:id', authorize('super_admin', 'project_manager', 'customer'), customersController.getCustomer);
router.post('/', authorize('super_admin', 'project_manager'), auditLog('CREATE', 'customer'), customersController.createCustomer);
router.put('/:id', authorize('super_admin', 'project_manager'), auditLog('UPDATE', 'customer'), customersController.updateCustomer);
router.delete('/:id', authorize('super_admin'), auditLog('DELETE', 'customer'), customersController.deleteCustomer);

export default router;
