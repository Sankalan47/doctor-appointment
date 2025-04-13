import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Appointment from './Appointment';
import Doctor from './Doctor';
import Patient from './Patient';
import Clinic from './Clinic';

@Table({
  tableName: 'ratings',
})
export default class Rating extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Appointment)
  @Column(DataType.UUID)
  appointmentId!: string;

  @BelongsTo(() => Appointment)
  appointment!: Appointment;

  @ForeignKey(() => Doctor)
  @Column(DataType.UUID)
  doctorId!: string;

  @BelongsTo(() => Doctor)
  doctor!: Doctor;

  @ForeignKey(() => Patient)
  @Column(DataType.UUID)
  patientId!: string;

  @BelongsTo(() => Patient)
  patient!: Patient;

  @ForeignKey(() => Clinic)
  @Column(DataType.UUID)
  clinicId?: string;

  @BelongsTo(() => Clinic)
  clinic?: Clinic;

  @Column(DataType.INTEGER)
  doctorRating!: number; // 1-5

  @Column(DataType.INTEGER)
  clinicRating?: number; // 1-5

  @Column(DataType.TEXT)
  review?: string;

  @Column(DataType.BOOLEAN)
  isAnonymous!: boolean;

  @Column(DataType.BOOLEAN)
  isVerified!: boolean;

  @Column(DataType.BOOLEAN)
  isPublished!: boolean;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
