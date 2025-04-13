// src/routes/appointment.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from '../api/controllers/appointment.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

// Protected routes
router.post('/', protect, authorize(UserRole.PATIENT), createAppointment);
router.get('/', protect, getUserAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/status', protect, updateAppointmentStatus);

export default router;
