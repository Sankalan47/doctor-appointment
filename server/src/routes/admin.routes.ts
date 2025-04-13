// src/routes/admin.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getPendingDoctors,
  updateDoctorStatus,
  getUsers,
  updateUserStatus,
} from '../api/controllers/admin.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.get('/dashboard', protect, authorize(UserRole.ADMIN), getDashboardStats);
router.get('/doctors/pending', protect, authorize(UserRole.ADMIN), getPendingDoctors);
router.put('/doctors/:id/status', protect, authorize(UserRole.ADMIN), updateDoctorStatus);
router.get('/users', protect, authorize(UserRole.ADMIN), getUsers);
router.put('/users/:id/status', protect, authorize(UserRole.ADMIN), updateUserStatus);

export default router;
