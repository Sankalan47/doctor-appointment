// src/routes/schedule.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getDoctorAvailability,
  setDoctorClinicSchedule,
  checkSchedulingConflicts,
} from '../api/controllers/schedule.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.get('/doctors/:doctorId/availability', getDoctorAvailability);
router.post('/doctors/clinic', protect, authorize(UserRole.DOCTOR), setDoctorClinicSchedule);
router.post('/check-conflicts', protect, checkSchedulingConflicts);

export default router;
