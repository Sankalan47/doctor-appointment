// src/api/controllers/rating.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Rating from '../../database/models/Rating';
import Appointment from '../../database/models/Appointment';
import Doctor from '../../database/models/Doctor';
import Patient from '../../database/models/Patient';
import Clinic from '../../database/models/Clinic';
import User from '../../database/models/User';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';
import { sequelize } from '../../database';
import { Op } from 'sequelize';

/**
 * Create a rating
 * @route POST /api/v1/ratings
 * @access Private (Patient)
 */
export const createRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { appointmentId, doctorRating, clinicRating, review, isAnonymous } = req.body;

    // Verify patient
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      res.status(404);
      throw new Error('Patient profile not found');
    }

    // Verify appointment exists and belongs to this patient
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, patientId: patient.id },
      include: [
        {
          model: Doctor,
        },
        {
          model: Clinic,
        },
      ],
    });

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found or does not belong to this patient');
    }

    // Verify appointment is completed
    if (appointment.status !== 'completed') {
      res.status(400);
      throw new Error('Cannot rate an appointment that is not completed');
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: { appointmentId },
    });

    if (existingRating) {
      res.status(400);
      throw new Error('Rating already exists for this appointment');
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Create rating
      const rating = await Rating.create(
        {
          id: uuidv4(),
          appointmentId,
          doctorId: appointment.doctorId,
          patientId: patient.id,
          clinicId: appointment.clinicId,
          doctorRating,
          clinicRating: appointment.clinicId ? clinicRating : null,
          review,
          isAnonymous: isAnonymous || false,
          isVerified: true, // Auto-verify since it's from a completed appointment
          isPublished: true, // Auto-publish
        },
        { transaction }
      );

      // Update doctor's average rating
      if (doctorRating) {
        const doctor = appointment.doctor;
        const doctorRatings = await Rating.findAll({
          where: { doctorId: doctor.id },
          attributes: ['doctorRating'],
        });

        const totalRating = doctorRatings.reduce((sum, r) => sum + r.doctorRating, 0);
        const averageRating = totalRating / doctorRatings.length;
        const totalRatings = doctorRatings.length;

        await doctor.update(
          {
            averageRating,
            totalRatings,
          },
          { transaction }
        );
      }
      // src/api/controllers/rating.controller.ts (continued)
      // Update clinic's average rating if applicable
      if (clinicRating && appointment.clinicId) {
        const clinic = appointment.clinic;
        const clinicRatings = await Rating.findAll({
          where: { clinicId: clinic!.id, clinicRating: { [Op.ne]: null } },
          attributes: ['clinicRating'],
        });

        const totalRating = clinicRatings.reduce((sum, r) => sum + (r.clinicRating || 0), 0);
        const averageRating = totalRating / clinicRatings.length;
        const totalRatings = clinicRatings.length;

        await clinic!.update(
          {
            averageRating,
            totalRatings,
          },
          { transaction }
        );
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: {
          id: rating.id,
          doctorRating: rating.doctorRating,
          clinicRating: rating.clinicRating,
          review: rating.review,
          isAnonymous: rating.isAnonymous,
          createdAt: rating.createdAt,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings for a doctor
 * @route GET /api/v1/ratings/doctor/:doctorId
 * @access Public
 */
export const getDoctorRatings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get doctor
    const doctor = await Doctor.findByPk(doctorId, {
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // Get ratings
    const { count, rows } = await Rating.findAndCountAll({
      where: {
        doctorId,
        isPublished: true,
      },
      include: [
        {
          model: Patient,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Format ratings
    const ratings = rows.map(rating => ({
      id: rating.id,
      rating: rating.doctorRating,
      review: rating.review,
      patientName: rating.isAnonymous
        ? 'Anonymous'
        : `${rating.patient.user.firstName} ${rating.patient.user.lastName}`,
      createdAt: rating.createdAt,
    }));

    const response: PaginatedResponse<(typeof ratings)[0]> = {
      data: ratings,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor.id,
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        averageRating: doctor.averageRating,
        totalRatings: doctor.totalRatings,
      },
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings for a clinic
 * @route GET /api/v1/ratings/clinic/:clinicId
 * @access Public
 */
export const getClinicRatings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get clinic
    const clinic = await Clinic.findByPk(clinicId);

    if (!clinic) {
      res.status(404);
      throw new Error('Clinic not found');
    }

    // Get ratings
    const { count, rows } = await Rating.findAndCountAll({
      where: {
        clinicId,
        clinicRating: { [Op.ne]: null },
        isPublished: true,
      },
      include: [
        {
          model: Patient,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Format ratings
    const ratings = rows.map(rating => ({
      id: rating.id,
      rating: rating.clinicRating,
      review: rating.review,
      patientName: rating.isAnonymous
        ? 'Anonymous'
        : `${rating.patient.user.firstName} ${rating.patient.user.lastName}`,
      createdAt: rating.createdAt,
    }));

    const response: PaginatedResponse<(typeof ratings)[0]> = {
      data: ratings,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };

    res.status(200).json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        averageRating: clinic.averageRating,
        totalRatings: clinic.totalRatings,
      },
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage rating (admin)
 * @route PUT /api/v1/ratings/:id
 * @access Private (Admin)
 */
export const manageRating = async (
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
    const { isPublished } = req.body;

    if (isPublished === undefined) {
      res.status(400);
      throw new Error('isPublished is required');
    }

    // Find rating
    const rating = await Rating.findByPk(id);

    if (!rating) {
      res.status(404);
      throw new Error('Rating not found');
    }

    // Update publication status
    await rating.update({ isPublished });

    // If unpublishing, recalculate averages
    if (!isPublished) {
      // Recalculate doctor average
      const doctorRatings = await Rating.findAll({
        where: {
          doctorId: rating.doctorId,
          isPublished: true,
        },
        attributes: ['doctorRating'],
      });

      const doctor = await Doctor.findByPk(rating.doctorId);
      if (doctor) {
        if (doctorRatings.length > 0) {
          const totalRating = doctorRatings.reduce((sum, r) => sum + r.doctorRating, 0);
          const averageRating = totalRating / doctorRatings.length;
          await doctor.update({
            averageRating,
            totalRatings: doctorRatings.length,
          });
        } else {
          await doctor.update({
            averageRating: null,
            totalRatings: 0,
          });
        }
      }

      // Recalculate clinic average if applicable
      if (rating.clinicId) {
        const clinicRatings = await Rating.findAll({
          where: {
            clinicId: rating.clinicId,
            clinicRating: { [Op.ne]: null },
            isPublished: true,
          },
          attributes: ['clinicRating'],
        });

        const clinic = await Clinic.findByPk(rating.clinicId);
        if (clinic) {
          if (clinicRatings.length > 0) {
            const totalRating = clinicRatings.reduce((sum, r) => sum + (r.clinicRating || 0), 0);
            const averageRating = totalRating / clinicRatings.length;
            await clinic.update({
              averageRating,
              totalRatings: clinicRatings.length,
            });
          } else {
            await clinic.update({
              averageRating: null,
              totalRatings: 0,
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Rating ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: {
        id: rating.id,
        isPublished: rating.isPublished,
      },
    });
  } catch (error) {
    next(error);
  }
};
