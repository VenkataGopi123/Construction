import { Router } from 'express';
import * as websiteController from '../controllers/website.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.get('/projects', websiteController.getPublicProjects);
router.get('/testimonials', websiteController.getTestimonials);
router.get('/stats', websiteController.getWebsiteStats);
router.post('/contact', websiteController.submitContact);
router.get('/chat/:session_id', optionalAuth, websiteController.getChatMessages);
router.post('/chat/:session_id', optionalAuth, websiteController.sendChatMessage);

router.use(authenticate);

router.get('/admin/testimonials', authorize('super_admin', 'project_manager'), websiteController.getAllTestimonials);
router.post('/admin/testimonials', authorize('super_admin'), auditLog('CREATE', 'testimonial'), websiteController.createTestimonial);
router.get('/admin/contacts', authorize('super_admin', 'project_manager'), websiteController.listContactSubmissions);
router.patch('/admin/contacts/:id/read', authorize('super_admin', 'project_manager'), websiteController.markContactRead);

export default router;
