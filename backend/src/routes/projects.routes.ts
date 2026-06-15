import { Router } from 'express';
import * as projectsController from '../controllers/projects.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'project_manager', 'customer'), projectsController.listProjects);
router.get('/:id', authorize('super_admin', 'project_manager', 'customer'), projectsController.getProject);
router.post('/', authorize('super_admin', 'project_manager'), auditLog('CREATE', 'project'), projectsController.createProject);
router.put('/:id', authorize('super_admin', 'project_manager'), auditLog('UPDATE', 'project'), projectsController.updateProject);
router.delete('/:id', authorize('super_admin'), auditLog('DELETE', 'project'), projectsController.deleteProject);

router.post('/:id/milestones', authorize('super_admin', 'project_manager'), projectsController.addMilestone);
router.post('/:id/updates', authorize('super_admin', 'project_manager'), projectsController.addUpdate);
router.post('/:id/assign-worker', authorize('super_admin', 'project_manager'), projectsController.assignWorker);

export default router;
