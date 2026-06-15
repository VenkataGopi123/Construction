import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { getProfile } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', usersController.updateProfile);

router.get('/', authorize('super_admin', 'project_manager'), usersController.listUsers);
router.get('/:id', authorize('super_admin', 'project_manager'), usersController.getUser);
router.post('/', authorize('super_admin'), auditLog('CREATE', 'user'), usersController.createUser);
router.put('/:id', authorize('super_admin'), auditLog('UPDATE', 'user'), usersController.updateUser);
router.delete('/:id', authorize('super_admin'), auditLog('DELETE', 'user'), usersController.deleteUser);

export default router;
