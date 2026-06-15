import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/change-password', authenticate, authController.changePassword);

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

export default router;
