// src/routes/prescription.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
} from '../api/controllers/prescription.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.post('/', protect, authorize(UserRole.DOCTOR), createPrescription);
router.get(
  '/patient/:patientId',
  protect,
  authorize(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN),
  getPatientPrescriptions
);
router.get(
  '/:id',
  protect,
  authorize(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN),
  getPrescriptionById
);

export default router;
