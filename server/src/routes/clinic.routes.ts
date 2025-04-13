// src/routes/clinic.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  verifyClinic,
} from '../api/controllers/clinic.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.get('/', getClinics);
router.get('/:id', getClinicById);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.CLINIC_ADMIN), createClinic);
router.put('/:id', protect, authorize(UserRole.ADMIN, UserRole.CLINIC_ADMIN), updateClinic);
router.put('/:id/verify', protect, authorize(UserRole.ADMIN), verifyClinic);

export default router;
