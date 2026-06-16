import { Router } from 'express';
import * as projectsController from '../controllers/projects.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'user'), projectsController.listProjects);
router.get('/:id', authorize('admin', 'user'), projectsController.getProject);
router.post('/', authorize('admin'), projectsController.createProject);
router.put('/:id', authorize('admin'), projectsController.updateProject);
router.delete('/:id', authorize('admin'), projectsController.deleteProject);

export default router;
