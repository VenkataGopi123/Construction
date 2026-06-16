import { Router } from 'express';
import * as materialsController from '../controllers/materials.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'user'), materialsController.listMaterials);
router.get('/:id', authorize('admin', 'user'), materialsController.getMaterial);
router.post('/', authorize('admin'), materialsController.createMaterial);
router.put('/:id', authorize('admin'), materialsController.updateMaterial);
router.delete('/:id', authorize('admin'), materialsController.deleteMaterial);

export default router;
