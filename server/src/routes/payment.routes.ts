// src/routes/payment.routes.ts
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createPayment,
  verifyPayment,
  getPaymentById,
  getUserPayments,
} from '../api/controllers/payment.controller';
import { UserRole } from '../database/models/User';

const router: Router = Router();

router.post('/', protect, createPayment);
router.put('/:id/verify', protect, authorize(UserRole.ADMIN, UserRole.PATIENT), verifyPayment);
router.get('/:id', protect, getPaymentById);
router.get('/', protect, getUserPayments);

export default router;
