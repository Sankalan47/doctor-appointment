// server/src/api/controllers/doctor.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import Doctor from '../../database/models/Doctor';
import User from '../../database/models/User';
import Specialization from '../../database/models/Specialization';
import DoctorSpecialization from '../../database/models/DoctorSpecialization';
import Clinic from '../../database/models/Clinic';
import DoctorClinic from '../../database/models/DoctorClinic';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';

/**
 * Get all doctors
 * @route GET /api/v1/doctors
 * @access Public
 */
export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const specialization = req.query.specialization as string;

    // Build query
    const where: any = {
      status: 'active',
    };

    // Search by name
    if (search) {
      where['$user.firstName$'] = { [Op.iLike]: `%${search}%` };
      where['$user.lastName$'] = { [Op.iLike]: `%${search}%` };
    }

    // Filter by specialization
    let specializationFilter = {};
    if (specialization) {
      specializationFilter = {
        '$specializations.specialization.name$': specialization,
      };
    }

    // Get doctors
    const { count, rows } = await Doctor.findAndCountAll({
      where: {
        ...where,
        ...specializationFilter,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: DoctorSpecialization,
          include: [
            {
              model: Specialization,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    // Format data
    const doctors = rows.map(doctor => ({
      id: doctor.id,
      user: {
        id: doctor.user.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        profileImage: doctor.user.profileImage,
      },
      biography: doctor.biography,
      consultationFee: doctor.consultationFee,
      homeVisitFee: doctor.homeVisitFee,
      offersHomeVisit: doctor.offersHomeVisit,
      offersTeleConsultation: doctor.offersTeleConsultation,
      averageRating: doctor.averageRating,
      totalRatings: doctor.totalRatings,
      specializations: doctor.specializations.map(s => ({
        id: s.specialization.id,
        name: s.specialization.name,
        isPrimary: s.isPrimary,
      })),
    }));

    const response: PaginatedResponse<(typeof doctors)[0]> = {
      data: doctors,
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
 * Get doctor by ID
 * @route GET /api/v1/doctors/:id
 * @access Public
 */
export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: DoctorSpecialization,
          include: [
            {
              model: Specialization,
              attributes: ['id', 'name', 'description'],
            },
          ],
        },
        {
          model: DoctorClinic,
          include: [
            {
              model: Clinic,
              attributes: ['id', 'name', 'address', 'phone', 'email'],
            },
          ],
        },
      ],
    });

    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // Format data
    const formattedDoctor = {
      id: doctor.id,
      user: {
        id: doctor.user.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        profileImage: doctor.user.profileImage,
      },
      biography: doctor.biography,
      education: doctor.education,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      homeVisitFee: doctor.homeVisitFee,
      offersHomeVisit: doctor.offersHomeVisit,
      offersTeleConsultation: doctor.offersTeleConsultation,
      averageRating: doctor.averageRating,
      totalRatings: doctor.totalRatings,
      specializations: doctor.specializations.map(s => ({
        id: s.specialization.id,
        name: s.specialization.name,
        description: s.specialization.description,
        isPrimary: s.isPrimary,
      })),
      clinics: doctor.doctorClinics.map(dc => ({
        id: dc.clinic.id,
        name: dc.clinic.name,
        address: dc.clinic.address,
        phone: dc.clinic.phone,
        consultationFee: dc.consultationFee,
      })),
    };

    res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor profile
 * @route PUT /api/v1/doctors/profile
 * @access Private (Doctor)
 */
export const updateDoctorProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'doctor') {
      res.status(403);
      throw new Error('Not authorized as a doctor');
    }

    const doctor = await Doctor.findOne({ where: { userId: user.id } });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    const {
      biography,
      education,
      experience,
      consultationFee,
      homeVisitFee,
      offersHomeVisit,
      offersTeleConsultation,
    } = req.body;

    // Update doctor profile
    const updatedDoctor = await doctor.update({
      biography: biography || doctor.biography,
      education: education || doctor.education,
      experience: experience || doctor.experience,
      consultationFee: consultationFee || doctor.consultationFee,
      homeVisitFee: homeVisitFee || doctor.homeVisitFee,
      offersHomeVisit: offersHomeVisit !== undefined ? offersHomeVisit : doctor.offersHomeVisit,
      offersTeleConsultation:
        offersTeleConsultation !== undefined
          ? offersTeleConsultation
          : doctor.offersTeleConsultation,
    });

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: {
        id: updatedDoctor.id,
        biography: updatedDoctor.biography,
        education: updatedDoctor.education,
        experience: updatedDoctor.experience,
        consultationFee: updatedDoctor.consultationFee,
        homeVisitFee: updatedDoctor.homeVisitFee,
        offersHomeVisit: updatedDoctor.offersHomeVisit,
        offersTeleConsultation: updatedDoctor.offersTeleConsultation,
      },
    });
  } catch (error) {
    next(error);
  }
};
