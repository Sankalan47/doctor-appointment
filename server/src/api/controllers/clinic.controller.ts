// src/api/controllers/clinic.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import Clinic from '../../database/models/Clinic';
import User from '../../database/models/User';
import Doctor from '../../database/models/Doctor';
import DoctorClinic from '../../database/models/DoctorClinic';
import DoctorClinicSchedule from '../../database/models/DoctorClinicSchedule';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';

/**
 * Get all clinics
 * @route GET /api/v1/clinics
 * @access Public
 */
export const getClinics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    // Build query
    let where: any = { isVerified: true };

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { '$address.city$': { [Op.iLike]: `%${search}%` } },
          { '$address.state$': { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    // Get clinics
    const { count, rows } = await Clinic.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    // Format clinics
    const clinics = rows.map(clinic => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      facilities: clinic.facilities,
      images: clinic.images,
      averageRating: clinic.averageRating,
      totalRatings: clinic.totalRatings,
    }));

    const response: PaginatedResponse<(typeof clinics)[0]> = {
      data: clinics,
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
 * Get clinic by ID
 * @route GET /api/v1/clinics/:id
 * @access Public
 */
export const getClinicById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByPk(id, {
      include: [
        {
          model: DoctorClinic,
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
              model: DoctorClinicSchedule,
            },
          ],
        },
      ],
    });

    if (!clinic) {
      res.status(404);
      throw new Error('Clinic not found');
    }

    // Format response
    const formattedClinic = {
      id: clinic.id,
      name: clinic.name,
      description: clinic.description,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website,
      operatingHours: clinic.operatingHours,
      facilities: clinic.facilities,
      images: clinic.images,
      averageRating: clinic.averageRating,
      totalRatings: clinic.totalRatings,
      doctors: clinic.doctorClinics.map(dc => ({
        id: dc.doctor.id,
        name: `${dc.doctor.user.firstName} ${dc.doctor.user.lastName}`,
        profileImage: dc.doctor.user.profileImage,
        consultationFee: dc.consultationFee,
        schedules: dc.schedules.map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      })),
    };

    res.status(200).json({
      success: true,
      data: formattedClinic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new clinic
 * @route POST /api/v1/clinics
 * @access Private (Admin, Clinic Admin)
 */
export const createClinic = async (
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
      name,
      description,
      address,
      phone,
      email,
      website,
      operatingHours,
      facilities,
      images,
      registrationNumber,
    } = req.body;

    // Create clinic
    const clinic = await Clinic.create({
      id: uuidv4(),
      adminId: req.user.id,
      name,
      description,
      address,
      phone,
      email,
      website,
      operatingHours,
      facilities,
      images,
      registrationNumber,
      isVerified: req.user.role === 'admin', // Auto-verify if created by admin
      averageRating: null,
      totalRatings: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Clinic created successfully',
      data: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        isVerified: clinic.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update clinic
 * @route PUT /api/v1/clinics/:id
 * @access Private (Admin, Clinic Admin)
 */
export const updateClinic = async (
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
    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      operatingHours,
      facilities,
      images,
      registrationNumber,
    } = req.body;

    // Find clinic
    const clinic = await Clinic.findByPk(id);

    if (!clinic) {
      res.status(404);
      throw new Error('Clinic not found');
    }

    // Check authorization
    if (req.user.role !== 'admin' && clinic.adminId !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this clinic');
    }

    // Update clinic
    const updatedClinic = await clinic.update({
      name: name || clinic.name,
      description: description || clinic.description,
      address: address || clinic.address,
      phone: phone || clinic.phone,
      email: email || clinic.email,
      website: website || clinic.website,
      operatingHours: operatingHours || clinic.operatingHours,
      facilities: facilities || clinic.facilities,
      images: images || clinic.images,
      registrationNumber: registrationNumber || clinic.registrationNumber,
    });

    res.status(200).json({
      success: true,
      message: 'Clinic updated successfully',
      data: {
        id: updatedClinic.id,
        name: updatedClinic.name,
        address: updatedClinic.address,
        phone: updatedClinic.phone,
        email: updatedClinic.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify clinic
 * @route PUT /api/v1/clinics/:id/verify
 * @access Private (Admin)
 */
export const verifyClinic = async (
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
    const { isVerified } = req.body;

    if (isVerified === undefined) {
      res.status(400);
      throw new Error('isVerified is required');
    }

    // Find clinic
    const clinic = await Clinic.findByPk(id);

    if (!clinic) {
      res.status(404);
      throw new Error('Clinic not found');
    }

    // Update verification status
    await clinic.update({ isVerified });

    res.status(200).json({
      success: true,
      message: `Clinic ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: {
        id: clinic.id,
        isVerified: clinic.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};
