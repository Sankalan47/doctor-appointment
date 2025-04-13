// src/api/controllers/prescription.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Prescription from '../../database/models/Prescription';
import PrescriptionMedication from '../../database/models/PrescriptionMedication';
import Appointment from '../../database/models/Appointment';
import Doctor from '../../database/models/Doctor';
import Patient from '../../database/models/Patient';
import User from '../../database/models/User';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaginatedResponse } from '../../types';

/**
 * Create a new prescription
 * @route POST /api/v1/prescriptions
 * @access Private (Doctor)
 */
export const createPrescription = async (
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
      patientId,
      diagnosis,
      instructions,
      notes,
      validUntil,
      medications
    } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, doctorId: doctor.id }
    });
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found or does not belong to this doctor');
    }

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

    // Create prescription
    const prescriptionId = uuidv4();
    const prescription = await Prescription.create({
      id: prescriptionId,
      appointmentId,
      doctorId: doctor.id,
      patientId,
      diagnosis,
      instructions,
      notes,
      validUntil,
      isDigitallySigned: true,
      digitalSignature: `Dr. ${req.user.email}` // In a real app, this would be more secure
    });

    // Add medications to prescription
    if (medications && medications.length > 0) {
      await Promise.all(
        medications.map(async (med: any) => {
          await PrescriptionMedication.create({
            id: uuidv4(),
            prescriptionId,
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            durationUnit: med.durationUnit,
            isBeforeMeal: med.isBeforeMeal || false,
            instructions: med.instructions,
            notes: med.notes
          });
        })
      );
    }

    // Get the created prescription with medications
    const prescriptionWithMeds = await Prescription.findByPk(prescriptionId, {
      include: [PrescriptionMedication]
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescriptionWithMeds
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prescriptions for a patient
 * @route GET /api/v1/prescriptions/patient/:patientId
 * @access Private (Patient, Doctor)
 */
export const getPatientPrescriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const { patientId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== patientId) {
        res.status(403);
        throw new Error('You can only view your own prescriptions');
      }
    } else if (req.user.role === 'doctor') {
      // Doctor should only view prescriptions they wrote or for patients they treat
      // This would need additional validation in a real app
    }

    const { count, rows } = await Prescription.findAndCountAll({
      where: { patientId },
      include: [
        {
          model: PrescriptionMedication,
        },
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
          model: Appointment,
          attributes: ['id', 'scheduledStartTime', 'type']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Format prescriptions
    const prescriptions = rows.map(prescription => ({
      id: prescription.id,
      diagnosis: prescription.diagnosis,
      instructions: prescription.instructions,
      validUntil: prescription.validUntil,
      createdAt: prescription.createdAt,
      doctor: {
        id: prescription.doctor.id,
        name: `${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`
      },
      appointment: {
        id: prescription.appointment.id,
        date: prescription.appointment.scheduledStartTime,
        type: prescription.appointment.type
      },
      medications: prescription.medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: `${med.duration} ${med.durationUnit}`,
        isBeforeMeal: med.isBeforeMeal,
        instructions: med.instructions
      }))
    }));

    const response: PaginatedResponse<(typeof prescriptions)[0]> = {
      data: prescriptions,
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

/**
 * Get a specific prescription
 * @route GET /api/v1/prescriptions/:id
 * @access Private (Patient, Doctor)
 */
export const getPrescriptionById = async (
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

    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: PrescriptionMedication,
        },
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
        },
        {
          model: Appointment,
          attributes: ['id', 'scheduledStartTime', 'type']
        }
      ]
    });

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    // Authorization check
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== prescription.patientId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== prescription.doctorId) {
        res.status(403);
        throw new Error('Unauthorized');
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: prescription.id,
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        notes: prescription.notes,
        validUntil: prescription.validUntil,
        isDigitallySigned: prescription.isDigitallySigned,
        createdAt: prescription.createdAt,
        doctor: {
          id: prescription.doctor.id,
          name: `${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`
        },
        patient: {
          id: prescription.patient.id,
          name: `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`
        },
        appointment: {
          id: prescription.appointment.id,
          date: prescription.appointment.scheduledStartTime,
          type: prescription.appointment.type
        },
        medications: prescription.medications.map(med => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          durationUnit: med.durationUnit,
          isBeforeMeal: med.isBeforeMeal,
          instructions: med.instructions,
          notes: med.notes
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};