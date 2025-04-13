// src/routes/consultation.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  startConsultation,
  endConsultation,
  joinConsultation,
  getConsultationById,
} from '../api/controllers/consultation.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.post('/:id/start', protect, authorize(UserRole.DOCTOR), startConsultation);
router.put('/:id/end', protect, authorize(UserRole.DOCTOR), endConsultation);
router.get('/:id/join', protect, authorize(UserRole.DOCTOR, UserRole.PATIENT), joinConsultation);
router.get(
  '/:id',
  protect,
  authorize(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN),
  getConsultationById
);

export default router;
