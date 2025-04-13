// src/routes/user.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  verifyEmail,
  getUserById,
} from '../api/controllers/user.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

// Public routes
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/profile-image', protect, uploadProfileImage);

// Admin routes
router.get('/:id', protect, authorize(UserRole.ADMIN), getUserById);

export default router;
