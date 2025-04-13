// src/routes/patient.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getPatientProfile,
  updatePatientProfile,
  getMedicalHistory,
  updateMedicalHistory,
} from '../api/controllers/patient.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.get('/profile', protect, authorize(UserRole.PATIENT), getPatientProfile);
router.put('/profile', protect, authorize(UserRole.PATIENT), updatePatientProfile);
router.get('/medical-history', protect, authorize(UserRole.PATIENT), getMedicalHistory);
router.put('/medical-history', protect, authorize(UserRole.PATIENT), updateMedicalHistory);
router.get(
  '/:patientId/medical-history',
  protect,
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  getMedicalHistory
);

export default router;
