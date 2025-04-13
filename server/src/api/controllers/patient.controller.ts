// src/api/controllers/patient.controller.ts
import { Request, Response, NextFunction } from 'express';
import Patient from '../../database/models/Patient';
import User from '../../database/models/User';
import { AuthRequest } from '../../middleware/auth.middleware';

/**
 * Get patient profile
 * @route GET /api/v1/patients/profile
 * @access Private (Patient)
 */
export const getPatientProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const patient = await Patient.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'email', 'phone', 'profileImage']
        }
      ]
    });

    if (!patient) {
      res.status(404);
      throw new Error('Patient profile not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: patient.id,
        user: {
          firstName: patient.user.firstName,
          lastName: patient.user.lastName,
          email: patient.user.email,
          phone: patient.user.phone,
          profileImage: patient.user.profileImage
        },
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        allergies: patient.allergies,
        chronicDiseases: patient.chronicDiseases,
        currentMedications: patient.currentMedications,
        medicalHistory: patient.medicalHistory,
        emergencyContact: {
          name: patient.emergencyContactName,
          phone: patient.emergencyContactPhone,
          relation: patient.emergencyContactRelation
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient profile
 * @route PUT /api/v1/patients/profile
 * @access Private (Patient)
 */
export const updatePatientProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      res.status(404);
      throw new Error('Patient profile not found');
    }

    const {
      dateOfBirth,
      gender,
      allergies,
      chronicDiseases,
      currentMedications,
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation
    } = req.body;

    // Update patient profile
    const updatedPatient = await patient.update({
      dateOfBirth: dateOfBirth || patient.dateOfBirth,
      gender: gender || patient.gender,
      allergies: allergies || patient.allergies,
      chronicDiseases: chronicDiseases || patient.chronicDiseases,
      currentMedications: currentMedications || patient.currentMedications,
      medicalHistory: medicalHistory || patient.medicalHistory,
      emergencyContactName: emergencyContactName || patient.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone || patient.emergencyContactPhone,
      emergencyContactRelation: emergencyContactRelation || patient.emergencyContactRelation
    });

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: {
        id: updatedPatient.id,
        dateOfBirth: updatedPatient.dateOfBirth,
        gender: updatedPatient.gender,
        allergies: updatedPatient.allergies,
        chronicDiseases: updatedPatient.chronicDiseases,
        currentMedications: updatedPatient.currentMedications,
        medicalHistory: updatedPatient.medicalHistory,
        emergencyContact: {
          name: updatedPatient.emergencyContactName,
          phone: updatedPatient.emergencyContactPhone,
          relation: updatedPatient.emergencyContactRelation
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient medical history
 * @route GET /api/v1/patients/medical-history
 * @access Private (Patient, Doctor with permission)
 */
export const getMedicalHistory = async (
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
    let patient;

    if (req.user.role === 'patient') {
      // Patients can only access their own medical history
      patient = await Patient.findOne({ where: { userId: req.user.id } });
    } else if (req.user.role === 'doctor') {
      // Doctors can access medical history of their patients
      // This would need a check to verify the doctor has an appointment with this patient
      patient = await Patient.findByPk(patientId);
      
      // Additional authorization check would go here
      // For example: check if the doctor has an appointment with this patient
    } else if (req.user.role === 'admin') {
      patient = await Patient.findByPk(patientId);
    }

    if (!patient) {
      res.status(404);
      throw new Error('Patient not found or access denied');
    }

    res.status(200).json({
      success: true,
      data: {
        allergies: patient.allergies,
        chronicDiseases: patient.chronicDiseases,
        currentMedications: patient.currentMedications,
        medicalHistory: patient.medicalHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update medical history
 * @route PUT /api/v1/patients/medical-history
 * @access Private (Patient)
 */
export const updateMedicalHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      res.status(404);
      throw new Error('Patient profile not found');
    }

    const { allergies, chronicDiseases, currentMedications, medicalHistory } = req.body;

    // Update medical history
    const updatedPatient = await patient.update({
      allergies: allergies || patient.allergies,
      chronicDiseases: chronicDiseases || patient.chronicDiseases,
      currentMedications: currentMedications || patient.currentMedications,
      medicalHistory: medicalHistory || patient.medicalHistory
    });

    res.status(200).json({
      success: true,
      message: 'Medical history updated successfully',
      data: {
        allergies: updatedPatient.allergies,
        chronicDiseases: updatedPatient.chronicDiseases,
        currentMedications: updatedPatient.currentMedications,
        medicalHistory: updatedPatient.medicalHistory
      }
    });
  } catch (error) {
    next(error);
  }
};