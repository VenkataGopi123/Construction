import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import projectsRoutes from './projects.routes';
import customersRoutes from './customers.routes';
import materialsRoutes from './materials.routes';
import websiteRoutes from './website.routes';
import servicesRoutes from './services.routes';
import teamRoutes from './team.routes';

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
router.use('/customers', customersRoutes);
router.use('/materials', materialsRoutes);
router.use('/website', websiteRoutes);
router.use('/services', servicesRoutes);
router.use('/team', teamRoutes);

export default router;
