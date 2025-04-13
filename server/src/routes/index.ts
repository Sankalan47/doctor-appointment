// server/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import doctorRoutes from './doctor.routes';
import clinicRoutes from './clinic.routes';
import appointmentRoutes from './appointment.routes';
import consultationRoutes from './consultation.routes';

const router = Router();

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

export default router;
