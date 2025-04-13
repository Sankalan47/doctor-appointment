// src/routes/doctor.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
} from '../api/controllers/doctor.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.put('/profile', protect, authorize(UserRole.DOCTOR), updateDoctorProfile);

export default router;
