// src/api/controllers/consultation.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Consultation, { ConsultationStatus } from '../../database/models/Consultation';
import Appointment, { AppointmentStatus } from '../../database/models/Appointment';
import Doctor from '../../database/models/Doctor';
import Patient from '../../database/models/Patient';
import User from '../../database/models/User';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getIO } from '../../services/socket.service';

/**
 * Start a consultation session
 * @route POST /api/v1/consultations/:id/start
 * @access Private (Doctor)
 */
export const startConsultation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { id } = req.params;

    // Find consultation
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            {
              model: Doctor,
              include: [
                {
                  model: User,
                  attributes: ['id'],
                },
              ],
            },
            {
              model: Patient,
              include: [
                {
                  model: User,
                  attributes: ['id'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!consultation) {
      res.status(404);
      throw new Error('Consultation not found');
    }

    // Verify doctor authorization
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor || doctor.id !== consultation.appointment.doctorId) {
      res.status(403);
      throw new Error('Not authorized to start this consultation');
    }

    // Verify consultation can be started
    if (
      consultation.status !== ConsultationStatus.SCHEDULED &&
      consultation.status !== ConsultationStatus.WAITING
    ) {
      res.status(400);
      throw new Error(`Cannot start consultation in ${consultation.status} status`);
    }

    // In a real application, this would integrate with a video API
    // For this example, we'll generate mock session data
    const sessionId = uuidv4();
    const sessionToken = uuidv4();

    // Update consultation
    await consultation.update({
      status: ConsultationStatus.IN_PROGRESS,
      sessionId,
      sessionToken,
      startTime: new Date(),
    });

    // Update appointment status
    await consultation.appointment.update({
      status: AppointmentStatus.IN_PROGRESS,
      actualStartTime: new Date(),
    });

    // Notify patient via websocket
    const io = getIO();
    io.to(`patient-${consultation.appointment.patientId}`).emit('consultation-started', {
      id: consultation.id,
      appointmentId: consultation.appointmentId,
      sessionId,
      sessionToken,
    });

    res.status(200).json({
      success: true,
      message: 'Consultation started successfully',
      data: {
        id: consultation.id,
        status: consultation.status,
        sessionId: consultation.sessionId,
        sessionToken: consultation.sessionToken,
        startTime: consultation.startTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End a consultation session
 * @route PUT /api/v1/consultations/:id/end
 * @access Private (Doctor)
 */
export const endConsultation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { id } = req.params;
    const { doctorNotes } = req.body;

    // Find consultation
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Appointment,
        },
      ],
    });

    if (!consultation) {
      res.status(404);
      throw new Error('Consultation not found');
    }

    // Verify doctor authorization
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor || doctor.id !== consultation.appointment.doctorId) {
      res.status(403);
      throw new Error('Not authorized to end this consultation');
    }

    // Verify consultation is in progress
    if (consultation.status !== ConsultationStatus.IN_PROGRESS) {
      res.status(400);
      throw new Error(`Cannot end consultation in ${consultation.status} status`);
    }

    // Calculate duration
    const startTime = consultation.startTime!;
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    // Update consultation
    await consultation.update({
      status: ConsultationStatus.COMPLETED,
      endTime,
      duration: durationMinutes,
      doctorNotes: doctorNotes || consultation.doctorNotes,
    });

    // Update appointment status
    await consultation.appointment.update({
      status: AppointmentStatus.COMPLETED,
      actualEndTime: endTime,
      notes: doctorNotes || consultation.appointment.notes,
    });

    // Notify patient via websocket
    const io = getIO();
    io.to(`patient-${consultation.appointment.patientId}`).emit('consultation-ended', {
      id: consultation.id,
      appointmentId: consultation.appointmentId,
    });

    res.status(200).json({
      success: true,
      message: 'Consultation ended successfully',
      data: {
        id: consultation.id,
        status: consultation.status,
        endTime: consultation.endTime,
        duration: consultation.duration,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a consultation session
 * @route GET /api/v1/consultations/:id/join
 * @access Private (Patient, Doctor)
 */
export const joinConsultation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { id } = req.params;

    // Find consultation
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            {
              model: Doctor,
              include: [
                {
                  model: User,
                  attributes: ['id', 'firstName', 'lastName', 'profileImage'],
                },
              ],
            },
            {
              model: Patient,
              include: [
                {
                  model: User,
                  attributes: ['id', 'firstName', 'lastName', 'profileImage'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!consultation) {
      res.status(404);
      throw new Error('Consultation not found');
    }

    // Check authorization
    let isAuthorized = false;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      isAuthorized = doctor?.id === consultation.appointment.doctorId;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      isAuthorized = patient?.id === consultation.appointment.patientId;
    } else if (req.user.role === 'admin') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      res.status(403);
      throw new Error('Not authorized to join this consultation');
    }

    // If patient is joining and consultation is 'scheduled', update to 'waiting'
    if (req.user.role === 'patient' && consultation.status === ConsultationStatus.SCHEDULED) {
      await consultation.update({ status: ConsultationStatus.WAITING });

      // Notify doctor
      const io = getIO();
      io.to(`doctor-${consultation.appointment.doctorId}`).emit('patient-waiting', {
        id: consultation.id,
        appointmentId: consultation.appointmentId,
        patientName: `${consultation.appointment.patient.user.firstName} ${consultation.appointment.patient.user.lastName}`,
      });
    }

    // Return consultation details
    res.status(200).json({
      success: true,
      data: {
        id: consultation.id,
        status: consultation.status,
        sessionId: consultation.sessionId,
        sessionToken: consultation.sessionToken,
        startTime: consultation.startTime,
        appointment: {
          id: consultation.appointment.id,
          scheduledStartTime: consultation.appointment.scheduledStartTime,
          scheduledEndTime: consultation.appointment.scheduledEndTime,
        },
        doctor: {
          id: consultation.appointment.doctor.id,
          name: `${consultation.appointment.doctor.user.firstName} ${consultation.appointment.doctor.user.lastName}`,
          profileImage: consultation.appointment.doctor.user.profileImage,
        },
        patient: {
          id: consultation.appointment.patient.id,
          name: `${consultation.appointment.patient.user.firstName} ${consultation.appointment.patient.user.lastName}`,
          profileImage: consultation.appointment.patient.user.profileImage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultation details
 * @route GET /api/v1/consultations/:id
 * @access Private (Patient, Doctor)
 */
export const getConsultationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { id } = req.params;

    // Find consultation
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            {
              model: Doctor,
              include: [
                {
                  model: User,
                  attributes: ['firstName', 'lastName', 'profileImage'],
                },
              ],
            },
            {
              model: Patient,
              include: [
                {
                  model: User,
                  attributes: ['firstName', 'lastName', 'profileImage'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!consultation) {
      res.status(404);
      throw new Error('Consultation not found');
    }

    // Check authorization
    let isAuthorized = false;
    let includeNotes = false;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      isAuthorized = doctor?.id === consultation.appointment.doctorId;
      includeNotes = isAuthorized;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      isAuthorized = patient?.id === consultation.appointment.patientId;
    } else if (req.user.role === 'admin') {
      isAuthorized = true;
      includeNotes = true;
    }

    if (!isAuthorized) {
      res.status(403);
      throw new Error('Not authorized to view this consultation');
    }

    // Format response
    const response = {
      id: consultation.id,
      status: consultation.status,
      appointmentId: consultation.appointmentId,
      startTime: consultation.startTime,
      endTime: consultation.endTime,
      duration: consultation.duration,
      appointment: {
        id: consultation.appointment.id,
        scheduledStartTime: consultation.appointment.scheduledStartTime,
        scheduledEndTime: consultation.appointment.scheduledEndTime,
        status: consultation.appointment.status,
      },
      doctor: {
        id: consultation.appointment.doctor.id,
        name: `${consultation.appointment.doctor.user.firstName} ${consultation.appointment.doctor.user.lastName}`,
        profileImage: consultation.appointment.doctor.user.profileImage,
      },
      patient: {
        id: consultation.appointment.patient.id,
        name: `${consultation.appointment.patient.user.firstName} ${consultation.appointment.patient.user.lastName}`,
        profileImage: consultation.appointment.patient.user.profileImage,
      },
    };

    // Include notes if authorized
    if (includeNotes) {
      Object.assign(response, {
        doctorNotes: consultation.doctorNotes,
      });
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
