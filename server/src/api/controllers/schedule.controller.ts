// src/api/controllers/schedule.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import Doctor from '../../database/models/Doctor';
import DoctorClinic from '../../database/models/DoctorClinic';
import DoctorClinicSchedule from '../../database/models/DoctorClinicSchedule';
import Clinic from '../../database/models/Clinic';
import Appointment from '../../database/models/Appointment';
import { AuthRequest } from '../../middleware/auth.middleware';

/**
 * Get doctor availability
 * @route GET /api/v1/schedules/doctors/:doctorId/availability
 * @access Public
 */
export const getDoctorAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const clinicId = req.query.clinicId as string;

    if (!startDate || !endDate) {
      res.status(400);
      throw new Error('Start date and end date are required');
    }

    // Get doctor schedules
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // Get doctor's clinic schedules
    let doctorClinics;
    if (clinicId) {
      // Get schedule for specific clinic
      doctorClinics = await DoctorClinic.findAll({
        where: { doctorId, clinicId, isActive: true },
        include: [
          {
            model: DoctorClinicSchedule,
            where: { isActive: true }
          },
          {
            model: Clinic,
            attributes: ['id', 'name', 'address']
          }
        ]
      });
    } else {
      // Get schedules for all clinics
      doctorClinics = await DoctorClinic.findAll({
        where: { doctorId, isActive: true },
        include: [
          {
            model: DoctorClinicSchedule,
            where: { isActive: true }
          },
          {
            model: Clinic,
            attributes: ['id', 'name', 'address']
          }
        ]
      });
    }

    // Get existing appointments within date range
    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        scheduledStartTime: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: {
          [Op.notIn]: ['cancelled', 'no_show']
        }
      },
      attributes: ['scheduledStartTime', 'scheduledEndTime', 'status', 'type']
    });

    // Calculate available slots based on schedule and existing appointments
    const availableSlots: Array<{
      clinicId: string;
      clinicName: string;
      date: string;
      slots: Array<{
        startTime: string;
        endTime: string;
      }>;
    }> = [];

    // Process each clinic schedule
    for (const doctorClinic of doctorClinics) {
      const schedules = doctorClinic.schedules;
      const slotDuration = doctorClinic.consultationDuration; // minutes
      
      // Generate dates within the range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateRange: string[] = [];
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d).toISOString().split('T')[0]);
      }

      // Process each date in the range
      for (const date of dateRange) {
        const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, ...
        
        // Find schedule for this day of week
        const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
        if (!daySchedule) continue;

        // Parse schedule times
        const startTime = daySchedule.startTime;
        const endTime = daySchedule.endTime;
        
        // Generate time slots for this day
        const dateSlots: Array<{ startTime: string; endTime: string }> = [];
        
        let currentTime = new Date(`${date}T${startTime}`);
        const scheduledEnd = new Date(`${date}T${endTime}`);
        
        while (currentTime < scheduledEnd) {
          const slotStart = new Date(currentTime);
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
          
          if (slotEnd <= scheduledEnd) {
            // Check if this slot overlaps with any appointment
            const isSlotAvailable = !appointments.some(appointment => {
              const apptStart = new Date(appointment.scheduledStartTime);
              const apptEnd = new Date(appointment.scheduledEndTime);
              
              return (
                (slotStart >= apptStart && slotStart < apptEnd) ||
                (slotEnd > apptStart && slotEnd <= apptEnd) ||
                (slotStart <= apptStart && slotEnd >= apptEnd)
              );
            });
            
            if (isSlotAvailable) {
              dateSlots.push({
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString()
              });
            }
          }
          
          // Move to next slot
          currentTime = slotEnd;
        }
        
        // Add slots for this date if any are available
        if (dateSlots.length > 0) {
          availableSlots.push({
            clinicId: doctorClinic.clinicId,
            clinicName: doctorClinic.clinic.name,
            date,
            slots: dateSlots
          });
        }
      }
    }

    // If doctor offers teleconsultation or home visits, add those slots too
    if (doctor.offersTeleConsultation || doctor.offersHomeVisit) {
      // Implementation for virtual visits would go here
      // This would be similar to clinic visits but with different rules
    }

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set doctor schedule
 * @route POST /api/v1/schedules/doctors/clinic
 * @access Private (Doctor)
 */
export const setDoctorClinicSchedule = async (
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
      clinicId,
      schedules,
      consultationFee,
      consultationDuration
    } = req.body;

    // Get doctor
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    // Verify clinic exists
    const clinic = await Clinic.findByPk(clinicId);
    if (!clinic) {
      res.status(404);
      throw new Error('Clinic not found');
    }

    // Check if doctor is already associated with this clinic
    let doctorClinic = await DoctorClinic.findOne({
      where: { doctorId: doctor.id, clinicId }
    });

    if (!doctorClinic) {
      // Create new doctor-clinic association
      doctorClinic = await DoctorClinic.create({
        id: uuidv4(),
        doctorId: doctor.id,
        clinicId,
        consultationFee,
        consultationDuration,
        isActive: true
      });
    } else {
      // Update existing association
      await doctorClinic.update({
        consultationFee: consultationFee || doctorClinic.consultationFee,
        consultationDuration: consultationDuration || doctorClinic.consultationDuration,
        isActive: true
      });
    }

    // Delete existing schedules for this doctor-clinic combination
    await DoctorClinicSchedule.destroy({
      where: { doctorClinicId: doctorClinic.id }
    });

    // Create new schedules
    if (schedules && schedules.length > 0) {
      await Promise.all(
        schedules.map(async (schedule: any) => {
          await DoctorClinicSchedule.create({
            id: uuidv4(),
            doctorClinicId: doctorClinic!.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            slotDuration: schedule.slotDuration || consultationDuration,
            maxPatients: schedule.maxPatients,
            isActive: true
          });
        })
      );
    }

    // Get updated schedules
    const updatedSchedules = await DoctorClinicSchedule.findAll({
      where: { doctorClinicId: doctorClinic.id }
    });

    res.status(200).json({
      success: true,
      message: 'Doctor clinic schedule set successfully',
      data: {
        doctorClinic: {
          id: doctorClinic.id,
          clinicId,
          consultationFee: doctorClinic.consultationFee,
          consultationDuration: doctorClinic.consultationDuration
        },
        schedules: updatedSchedules
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check for scheduling conflicts
 * @route POST /api/v1/schedules/check-conflicts
 * @access Private
 */
export const checkSchedulingConflicts = async (
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
      startTime,
      endTime
    } = req.body;

    // Check for overlapping appointments
    const conflictingAppointments = await Appointment.findAll({
      where: {
        doctorId,
        [Op.or]: [
          {
            scheduledStartTime: {
              [Op.lt]: new Date(endTime),
            },
            scheduledEndTime: {
              [Op.gt]: new Date(startTime),
            },
          },
        ],
        status: {
          [Op.notIn]: ['cancelled', 'no_show', 'completed']
        }
      }
    });

    res.status(200).json({
      success: true,
      hasConflicts: conflictingAppointments.length > 0,
      conflicts: conflictingAppointments.map(appt => ({
        id: appt.id,
        startTime: appt.scheduledStartTime,
        endTime: appt.scheduledEndTime,
        status: appt.status
      }))
    });
  } catch (error) {
    next(error);
  }
};