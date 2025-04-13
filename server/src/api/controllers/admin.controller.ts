// src/api/controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import User, { UserRole } from '../../database/models/User';
import Doctor, { DoctorStatus } from '../../database/models/Doctor';
import Appointment from '../../database/models/Appointment';
import Payment from '../../database/models/Payment';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';

/**
 * Get system dashboard statistics
 * @route GET /api/v1/admin/dashboard
 * @access Private (Admin)
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Get user counts
    const userCounts = await User.findAll({
      attributes: [
        'role',
        [req.app.get('sequelize').fn('count', req.app.get('sequelize').col('id')), 'count'],
      ],
      group: ['role'],
    });

    // Format user counts
    const formattedUserCounts = {
      patients: userCounts.find(item => item.role === UserRole.PATIENT)?.get('count') || 0,
      doctors: userCounts.find(item => item.role === UserRole.DOCTOR)?.get('count') || 0,
      admins: userCounts.find(item => item.role === UserRole.ADMIN)?.get('count') || 0,
      clinicAdmins: userCounts.find(item => item.role === UserRole.CLINIC_ADMIN)?.get('count') || 0,
    };

    // Get pending doctor approvals
    const pendingDoctorCount = await Doctor.count({
      where: { status: DoctorStatus.PENDING },
    });

    // Get appointment statistics
    const appointmentCounts = await Appointment.findAll({
      attributes: [
        'status',
        [req.app.get('sequelize').fn('count', req.app.get('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.count({
      where: {
        scheduledStartTime: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    // Calculate revenue statistics
    const totalRevenue = await Payment.sum('amount', {
      where: { status: 'completed' },
    });

    const todayRevenue = await Payment.sum('amount', {
      where: {
        status: 'completed',
        paidAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        userCounts: formattedUserCounts,
        pendingDoctorApprovals: pendingDoctorCount,
        appointmentStats: {
          today: todayAppointments,
          total: appointmentCounts.reduce(
            (sum, item) => sum + parseInt(item.get('count') as string),
            0
          ),
          completed: appointmentCounts.find(item => item.status === 'completed')?.get('count') || 0,
          pending: appointmentCounts.find(item => item.status === 'pending')?.get('count') || 0,
          cancelled: appointmentCounts.find(item => item.status === 'cancelled')?.get('count') || 0,
        },
        revenue: {
          total: totalRevenue || 0,
          today: todayRevenue || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending doctor approvals
 * @route GET /api/v1/admin/doctors/pending
 * @access Private (Admin)
 */
export const getPendingDoctors = async (
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

    // Get pending doctors
    const { count, rows } = await Doctor.findAndCountAll({
      where: { status: DoctorStatus.PENDING },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'ASC']],
    });

    // Format doctors
    const doctors = rows.map(doctor => ({
      id: doctor.id,
      user: {
        id: doctor.user.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        phone: doctor.user.phone,
        profileImage: doctor.user.profileImage,
      },
      licenseNumber: doctor.licenseNumber,
      education: doctor.education,
      experience: doctor.experience,
      createdAt: doctor.createdAt,
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
 * Approve or reject doctor
 * @route PUT /api/v1/admin/doctors/:id/status
 * @access Private (Admin)
 */
export const updateDoctorStatus = async (
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
    const { status, remarks } = req.body;

    if (!Object.values(DoctorStatus).includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    // Find doctor
    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'email'],
        },
      ],
    });

    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // Update status
    await doctor.update({
      status,
      // In a real app, we might add a remarks field to the Doctor model
      // remarks: remarks
    });

    // In a real app, we would send an email notification to the doctor here

    res.status(200).json({
      success: true,
      message: `Doctor ${status === DoctorStatus.ACTIVE ? 'approved' : 'updated'} successfully`,
      data: {
        id: doctor.id,
        status: doctor.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system users
 * @route GET /api/v1/admin/users
 * @access Private (Admin)
 */
export const getUsers = async (
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
    const role = req.query.role as string;
    const search = req.query.search as string;

    // Build query
    let where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    // Get users
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: {
        exclude: ['password', 'refreshToken'],
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const response: PaginatedResponse<User> = {
      data: rows,
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
 * Update user status (activate/deactivate)
 * @route PUT /api/v1/admin/users/:id/status
 * @access Private (Admin)
 */
export const updateUserStatus = async (
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
    const { isActive } = req.body;

    if (isActive === undefined) {
      res.status(400);
      throw new Error('isActive is required');
    }

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent deactivating own account
    if (id === req.user.id.toString() && !isActive) {
      res.status(400);
      throw new Error('Cannot deactivate your own account');
    }

    // Update status
    await user.update({ isActive });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user.id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
