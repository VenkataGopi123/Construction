import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import projectsRoutes from './projects.routes';
import materialsRoutes from './materials.routes';
import servicesRoutes from './services.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'BuildMaster ERP API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/materials', materialsRoutes);
router.use('/services', servicesRoutes);

export default router;
