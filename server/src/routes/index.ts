// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import doctorRoutes from './doctor.routes';
import clinicRoutes from './clinic.routes';
import appointmentRoutes from './appointment.routes';
import consultationRoutes from './consultation.routes';
import patientRoutes from './patient.routes';
import prescriptionRoutes from './prescription.routes';
import scheduleRoutes from './schedule.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import ratingRoutes from './rating.routes';

const router: Router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);
router.use('/clinics', clinicRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/patients', patientRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/ratings', ratingRoutes);

export default router;
