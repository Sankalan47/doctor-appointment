// src/routes/rating.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createRating,
  getDoctorRatings,
  getClinicRatings,
  manageRating,
} from '../api/controllers/rating.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.post('/', protect, authorize(UserRole.PATIENT), createRating);
router.get('/doctor/:doctorId', getDoctorRatings);
router.get('/clinic/:clinicId', getClinicRatings);
router.put('/:id', protect, authorize(UserRole.ADMIN), manageRating);

export default router;
