// server/src/database/models/Appointment.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import Doctor from './Doctor';
import Patient from './Patient';
import Clinic from './Clinic';
import Consultation from './Consultation';
import HomeVisit from './HomeVisit';
import Payment from './Payment';
import Prescription from './Prescription';
import Rating from './Rating';

export enum AppointmentType {
  IN_CLINIC = 'in_clinic',
  TELE_CONSULTATION = 'tele_consultation',
  HOME_VISIT = 'home_visit',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

@Table({
  tableName: 'appointments',
})
export default class Appointment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Patient)
  @Column(DataType.UUID)
  patientId!: string;

  @BelongsTo(() => Patient)
  patient!: Patient;

  @ForeignKey(() => Doctor)
  @Column(DataType.UUID)
  doctorId!: string;

  @BelongsTo(() => Doctor)
  doctor!: Doctor;

  @ForeignKey(() => Clinic)
  @Column(DataType.UUID)
  clinicId?: string;

  @BelongsTo(() => Clinic)
  clinic?: Clinic;

  @Column(DataType.ENUM(...Object.values(AppointmentType)))
  type!: AppointmentType;

  @Column(DataType.ENUM(...Object.values(AppointmentStatus)))
  status!: AppointmentStatus;

  @Column(DataType.DATE)
  scheduledStartTime!: Date;

  @Column(DataType.DATE)
  scheduledEndTime!: Date;

  @Column(DataType.DATE)
  actualStartTime?: Date;

  @Column(DataType.DATE)
  actualEndTime?: Date;

  @Column(DataType.TEXT)
  reason?: string;

  @Column(DataType.TEXT)
  symptoms?: string;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.DECIMAL(10, 2))
  fee!: number;

  @Column(DataType.BOOLEAN)
  isPaid!: boolean;

  @Column(DataType.BOOLEAN)
  isRescheduled!: boolean;

  @Column(DataType.UUID)
  previousAppointmentId?: string;

  // Relationships
  @HasOne(() => Consultation)
  consultation?: Consultation;

  @HasOne(() => HomeVisit)
  homeVisit?: HomeVisit;

  @HasOne(() => Payment)
  payment?: Payment;

  @HasOne(() => Prescription)
  prescription?: Prescription;

  @HasOne(() => Rating)
  rating?: Rating;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
