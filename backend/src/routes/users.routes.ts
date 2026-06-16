import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { getProfile } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', usersController.updateProfile);

router.get('/', authorize('admin'), usersController.listUsers);
router.get('/:id', authorize('admin'), usersController.getUser);
router.post('/', authorize('admin'), usersController.createUser);
router.put('/:id', authorize('admin'), usersController.updateUser);
router.delete('/:id', authorize('admin'), usersController.deleteUser);

export default router;
