import { Router } from 'express';
import * as materialsController from '../controllers/materials.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'project_manager', 'material_manager', 'supplier'), materialsController.listMaterials);
router.get('/low-stock', authorize('super_admin', 'material_manager'), materialsController.getLowStock);
router.get('/categories', authorize('super_admin', 'material_manager', 'project_manager'), materialsController.listCategories);
router.post('/categories', authorize('super_admin', 'material_manager'), materialsController.createCategory);
router.get('/:id', authorize('super_admin', 'project_manager', 'material_manager', 'supplier'), materialsController.getMaterial);
router.post('/', authorize('super_admin', 'material_manager'), auditLog('CREATE', 'material'), materialsController.createMaterial);
router.put('/:id', authorize('super_admin', 'material_manager'), auditLog('UPDATE', 'material'), materialsController.updateMaterial);
router.delete('/:id', authorize('super_admin', 'material_manager'), auditLog('DELETE', 'material'), materialsController.deleteMaterial);
router.post('/:id/adjust-stock', authorize('super_admin', 'material_manager'), auditLog('STOCK_ADJUST', 'material'), materialsController.adjustStock);

export default router;
