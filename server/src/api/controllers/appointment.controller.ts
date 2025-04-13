// server/src/api/controllers/appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import Appointment, { AppointmentStatus, AppointmentType } from '../../database/models/Appointment';
import Doctor from '../../database/models/Doctor';
import Patient from '../../database/models/Patient';
import User from '../../database/models/User';
import Clinic from '../../database/models/Clinic';
import Consultation from '../../database/models/Consultation';
import HomeVisit from '../../database/models/HomeVisit';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';
import { getSocketIO } from '../../services/socket.service';

/**
 * Create a new appointment
 * @route POST /api/v1/appointments
 * @access Private
 */
export const createAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const {
      doctorId,
      clinicId,
      type,
      scheduledStartTime,
      scheduledEndTime,
      reason,
      symptoms,
      address,
    } = req.body;

    // Get patient ID based on authenticated user
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      res.status(404);
      throw new Error('Patient profile not found');
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // For in-clinic appointments, verify clinic exists
    if (type === AppointmentType.IN_CLINIC && clinicId) {
      const clinic = await Clinic.findByPk(clinicId);
      if (!clinic) {
        res.status(404);
        throw new Error('Clinic not found');
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      id: uuidv4(),
      patientId: patient.id,
      doctorId,
      clinicId: type === AppointmentType.IN_CLINIC ? clinicId : null,
      type,
      status: AppointmentStatus.PENDING,
      scheduledStartTime,
      scheduledEndTime,
      reason,
      symptoms,
      fee: type === AppointmentType.HOME_VISIT ? doctor.homeVisitFee : doctor.consultationFee,
      isPaid: false,
      isRescheduled: false,
    });

    // Create associated records based on appointment type
    if (type === AppointmentType.TELE_CONSULTATION) {
      await Consultation.create({
        id: uuidv4(),
        appointmentId: appointment.id,
        status: 'scheduled',
      });
    } else if (type === AppointmentType.HOME_VISIT) {
      if (!address) {
        res.status(400);
        throw new Error('Address is required for home visits');
      }

      await HomeVisit.create({
        id: uuidv4(),
        appointmentId: appointment.id,
        status: 'scheduled',
        address,
      });
    }

    // Notify doctor about new appointment
    const io = getSocketIO();
    io.to(`doctor-${doctorId}`).emit('new-appointment', {
      id: appointment.id,
      type: appointment.type,
      scheduledStartTime: appointment.scheduledStartTime,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        id: appointment.id,
        type: appointment.type,
        status: appointment.status,
        scheduledStartTime: appointment.scheduledStartTime,
        scheduledEndTime: appointment.scheduledEndTime,
        fee: appointment.fee,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user appointments
 * @route GET /api/v1/appointments
 * @access Private
 */
export const getUserAppointments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const from = req.query.from as string;
    const to = req.query.to as string;

    // Determine if user is patient or doctor
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let where: any = {};

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      if (!patient) {
        res.status(404);
        throw new Error('Patient profile not found');
      }
      where.patientId = patient.id;
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: user.id } });
      if (!doctor) {
        res.status(404);
        throw new Error('Doctor profile not found');
      }
      where.doctorId = doctor.id;
    } else {
      res.status(403);
      throw new Error('Unauthorized');
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (from && to) {
      where.scheduledStartTime = {
        [Op.between]: [new Date(from), new Date(to)],
      };
    } else if (from) {
      where.scheduledStartTime = {
        [Op.gte]: new Date(from),
      };
    } else if (to) {
      where.scheduledStartTime = {
        [Op.lte]: new Date(to),
      };
    }

    // Get appointments
    const { count, rows } = await Appointment.findAndCountAll({
      where,
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
        {
          model: Clinic,
          attributes: ['id', 'name', 'address'],
        },
        {
          model: Consultation,
        },
        {
          model: HomeVisit,
        },
      ],
      order: [['scheduledStartTime', 'DESC']],
      limit,
      offset,
    });

    // Format appointments
    const appointments = rows.map(appointment => ({
      id: appointment.id,
      type: appointment.type,
      status: appointment.status,
      scheduledStartTime: appointment.scheduledStartTime,
      scheduledEndTime: appointment.scheduledEndTime,
      reason: appointment.reason,
      symptoms: appointment.symptoms,
      fee: appointment.fee,
      isPaid: appointment.isPaid,
      doctor: {
        id: appointment.doctor.id,
        firstName: appointment.doctor.user.firstName,
        lastName: appointment.doctor.user.lastName,
        profileImage: appointment.doctor.user.profileImage,
      },
      patient: {
        id: appointment.patient.id,
        firstName: appointment.patient.user.firstName,
        lastName: appointment.patient.user.lastName,
        profileImage: appointment.patient.user.profileImage,
      },
      clinic: appointment.clinic
        ? {
            id: appointment.clinic.id,
            name: appointment.clinic.name,
            address: appointment.clinic.address,
          }
        : null,
      consultation: appointment.consultation
        ? {
            id: appointment.consultation.id,
            status: appointment.consultation.status,
            sessionId: appointment.consultation.sessionId,
          }
        : null,
      homeVisit: appointment.homeVisit
        ? {
            id: appointment.homeVisit.id,
            status: appointment.homeVisit.status,
            address: appointment.homeVisit.address,
            estimatedArrivalTime: appointment.homeVisit.estimatedArrivalTime,
          }
        : null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }));

    const response: PaginatedResponse<(typeof appointments)[0]> = {
      data: appointments,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by ID
 * @route GET /api/v1/appointments/:id
 * @access Private
 */
export const getAppointmentById = async (
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

    const appointment = await Appointment.findByPk(id, {
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
        {
          model: Clinic,
          attributes: ['id', 'name', 'address', 'phone'],
        },
        {
          model: Consultation,
        },
        {
          model: HomeVisit,
        },
      ],
    });

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Verify user has access to this appointment
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      if (!patient || patient.id !== appointment.patientId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: user.id } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    } else if (user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized');
    }

    // Format appointment
    const formattedAppointment = {
      id: appointment.id,
      type: appointment.type,
      status: appointment.status,
      scheduledStartTime: appointment.scheduledStartTime,
      scheduledEndTime: appointment.scheduledEndTime,
      actualStartTime: appointment.actualStartTime,
      actualEndTime: appointment.actualEndTime,
      reason: appointment.reason,
      symptoms: appointment.symptoms,
      notes: appointment.notes,
      fee: appointment.fee,
      isPaid: appointment.isPaid,
      doctor: {
        id: appointment.doctor.id,
        firstName: appointment.doctor.user.firstName,
        lastName: appointment.doctor.user.lastName,
        profileImage: appointment.doctor.user.profileImage,
      },
      patient: {
        id: appointment.patient.id,
        firstName: appointment.patient.user.firstName,
        lastName: appointment.patient.user.lastName,
        profileImage: appointment.patient.user.profileImage,
      },
      clinic: appointment.clinic
        ? {
            id: appointment.clinic.id,
            name: appointment.clinic.name,
            address: appointment.clinic.address,
            phone: appointment.clinic.phone,
          }
        : null,
      consultation: appointment.consultation
        ? {
            id: appointment.consultation.id,
            status: appointment.consultation.status,
            sessionId: appointment.consultation.sessionId,
            sessionToken: appointment.consultation.sessionToken,
            startTime: appointment.consultation.startTime,
            endTime: appointment.consultation.endTime,
            duration: appointment.consultation.duration,
            doctorNotes: appointment.consultation.doctorNotes,
          }
        : null,
      homeVisit: appointment.homeVisit
        ? {
            id: appointment.homeVisit.id,
            status: appointment.homeVisit.status,
            address: appointment.homeVisit.address,
            estimatedArrivalTime: appointment.homeVisit.estimatedArrivalTime,
            actualArrivalTime: appointment.homeVisit.actualArrivalTime,
            visitStartTime: appointment.homeVisit.visitStartTime,
            visitEndTime: appointment.homeVisit.visitEndTime,
            doctorNotes: appointment.homeVisit.doctorNotes,
          }
        : null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: formattedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status
 * @route PUT /api/v1/appointments/:id/status
 * @access Private
 */
export const updateAppointmentStatus = async (
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
    const { status, notes } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Verify user has permission to update
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: user.id } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    } else if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      if (!patient || patient.id !== appointment.patientId) {
        res.status(403);
        throw new Error('Unauthorized');
      }

      // Patients can only cancel their appointments
      if (status !== AppointmentStatus.CANCELLED) {
        res.status(403);
        throw new Error('Patients can only cancel appointments');
      }
    } else if (user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized');
    }

    // Update appointment status
    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    // Update associated records based on appointment type
    if (appointment.type === AppointmentType.TELE_CONSULTATION) {
      const consultation = await Consultation.findOne({ where: { appointmentId: appointment.id } });
      if (consultation) {
        let consultationStatus;
        switch (status) {
          case AppointmentStatus.CONFIRMED:
            consultationStatus = 'scheduled';
            break;
          case AppointmentStatus.IN_PROGRESS:
            consultationStatus = 'in_progress';
            appointment.actualStartTime = new Date();
            break;
          case AppointmentStatus.COMPLETED:
            consultationStatus = 'completed';
            appointment.actualEndTime = new Date();
            break;
          case AppointmentStatus.CANCELLED:
            consultationStatus = 'cancelled';
            break;
          case AppointmentStatus.NO_SHOW:
            consultationStatus = 'missed';
            break;
          default:
            consultationStatus = consultation.status;
        }
        await consultation.update({ status: consultationStatus });
      }
    } else if (appointment.type === AppointmentType.HOME_VISIT) {
      const homeVisit = await HomeVisit.findOne({ where: { appointmentId: appointment.id } });
      if (homeVisit) {
        let homeVisitStatus;
        switch (status) {
          case AppointmentStatus.CONFIRMED:
            homeVisitStatus = 'scheduled';
            break;
          case AppointmentStatus.IN_PROGRESS:
            homeVisitStatus = 'in_progress';
            appointment.actualStartTime = new Date();
            break;
          case AppointmentStatus.COMPLETED:
            homeVisitStatus = 'completed';
            appointment.actualEndTime = new Date();
            break;
          case AppointmentStatus.CANCELLED:
            homeVisitStatus = 'cancelled';
            break;
          default:
            homeVisitStatus = homeVisit.status;
        }
        await homeVisit.update({ status: homeVisitStatus });
      }
    }

    await appointment.save();

    // Notify the other party
    const io = getSocketIO();
    if (user.role === 'doctor') {
      io.to(`patient-${appointment.patientId}`).emit('appointment-updated', {
        id: appointment.id,
        status: appointment.status,
      });
    } else {
      io.to(`doctor-${appointment.doctorId}`).emit('appointment-updated', {
        id: appointment.id,
        status: appointment.status,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: {
        id: appointment.id,
        status: appointment.status,
        updatedAt: appointment.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
