// src/api/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Payment, { PaymentStatus, PaymentMethod } from '../../database/models/Payment';
import Appointment from '../../database/models/Appointment';
import Doctor from '../../database/models/Doctor';
import Patient from '../../database/models/Patient';
import User from '../../database/models/User';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';

/**
 * Create a payment
 * @route POST /api/v1/payments
 * @access Private
 */
export const createPayment = async (
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
      appointmentId,
      amount,
      method,
      transactionId,
      gatewayResponse
    } = req.body;

    // Verify appointment exists
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Doctor,
          attributes: ['id']
        },
        {
          model: Patient,
          attributes: ['id']
        }
      ]
    });

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Check if user is authorized (patient, doctor of the appointment, or admin)
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // For patients, verify they are the appointment owner
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== appointment.patientId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      where: { appointmentId }
    });

    if (existingPayment) {
      res.status(400);
      throw new Error('Payment already exists for this appointment');
    }

    // Calculate fees
    const platformFee = (amount * 0.05); // 5% platform fee, adjust as needed
    const doctorAmount = amount - platformFee;

    // Create payment
    const payment = await Payment.create({
      id: uuidv4(),
      appointmentId,
      amount,
      tax: 0, // Adjust for tax calculation if needed
      platformFee,
      doctorAmount,
      status: PaymentStatus.PENDING,
      method: method || PaymentMethod.CREDIT_CARD,
      transactionId,
      gatewayResponse,
      invoiceNumber: `INV-${Date.now()}-${appointmentId.substring(0, 4)}`
    });

    // If transaction ID is provided, consider payment as completed
    if (transactionId) {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      await payment.save();

      // Update appointment payment status
      await appointment.update({ isPaid: true });
    }

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        id: payment.id,
        appointmentId: payment.appointmentId,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        invoiceNumber: payment.invoiceNumber,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify payment
 * @route PUT /api/v1/payments/:id/verify
 * @access Private
 */
export const verifyPayment = async (
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
    const { transactionId, status, gatewayResponse } = req.body;

    // Find payment
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Appointment,
          attributes: ['id', 'patientId', 'doctorId', 'status']
        }
      ]
    });

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    // Update payment status
    payment.status = status || PaymentStatus.COMPLETED;
    payment.transactionId = transactionId || payment.transactionId;
    payment.gatewayResponse = gatewayResponse || payment.gatewayResponse;

    if (status === PaymentStatus.COMPLETED) {
      payment.paidAt = new Date();
      
      // Update appointment payment status
      await payment.appointment.update({ isPaid: true });
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        id: payment.id,
        status: payment.status,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID
 * @route GET /api/v1/payments/:id
 * @access Private
 */
export const getPaymentById = async (
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

    // Find payment
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            {
              model: Doctor,
              include: [
                {
                  model: User,
                  attributes: ['firstName', 'lastName']
                }
              ]
            },
            {
              model: Patient,
              include: [
                {
                  model: User,
                  attributes: ['firstName', 'lastName']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    // Check authorization
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== payment.appointment.patientId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== payment.appointment.doctorId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    }

    // Format response
    const formattedPayment = {
      id: payment.id,
      appointmentId: payment.appointmentId,
      amount: payment.amount,
      tax: payment.tax,
      platformFee: payment.platformFee,
      doctorAmount: payment.doctorAmount,
      status: payment.status,
      method: payment.method,
      transactionId: payment.transactionId,
      invoiceNumber: payment.invoiceNumber,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      appointment: {
        id: payment.appointment.id,
        patient: {
          id: payment.appointment.patient.id,
          name: `${payment.appointment.patient.user.firstName} ${payment.appointment.patient.user.lastName}`
        },
        doctor: {
          id: payment.appointment.doctor.id,
          name: `${payment.appointment.doctor.user.firstName} ${payment.appointment.doctor.user.lastName}`
        }
      }
    };

    res.status(200).json({
      success: true,
      data: formattedPayment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user payments
 * @route GET /api/v1/payments
 * @access Private
 */
export const getUserPayments = async (
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

    // Determine if user is patient or doctor
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let appointmentFilter: any = {};

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      if (!patient) {
        res.status(404);
        throw new Error('Patient profile not found');
      }
      appointmentFilter = { patientId: patient.id };
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: user.id } });
      if (!doctor) {
        res.status(404);
        throw new Error('Doctor profile not found');
      }
      appointmentFilter = { doctorId: doctor.id };
    } else if (user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized');
    }

    // Status filter
    const statusFilter = status ? { status } : {};

    // Get payments
    const { count, rows } = await Payment.findAndCountAll({
      include: [
        {
          model: Appointment,
          where: appointmentFilter,
          include: [
            {
              model: Doctor,
              include: [
                {
                  model: User,
                  attributes: ['firstName', 'lastName']
                }
              ]
            },
            {
              model: Patient,
              include: [
                {
                  model: User,
                  attributes: ['firstName', 'lastName']
                }
              ]
            }
          ]
        }
      ],
      where: statusFilter,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Format payments
    const payments = rows.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      invoiceNumber: payment.invoiceNumber,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      appointment: {
        id: payment.appointment.id,
        patientName: `${payment.appointment.patient.user.firstName} ${payment.appointment.patient.user.lastName}`,
        doctorName: `${payment.appointment.doctor.user.firstName} ${payment.appointment.doctor.user.lastName}`
      }
    }));

    const response: PaginatedResponse<(typeof payments)[0]> = {
      data: payments,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };

    res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
};