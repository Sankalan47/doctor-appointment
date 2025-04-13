// server/src/database/models/Prescription.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import Appointment from './Appointment';
import Doctor from './Doctor';
import Patient from './Patient';
import PrescriptionMedication from './PrescriptionMedication';

@Table({
  tableName: 'prescriptions',
})
export default class Prescription extends Model {
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

  @Column(DataType.TEXT)
  diagnosis?: string;

  @Column(DataType.TEXT)
  instructions?: string;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.DATEONLY)
  validUntil?: Date;

  @Column(DataType.BOOLEAN)
  isDigitallySigned!: boolean;

  @Column(DataType.STRING)
  digitalSignature?: string;

  @Column(DataType.STRING)
  prescriptionUrl?: string;

  // Relationships
  @HasMany(() => PrescriptionMedication)
  medications!: PrescriptionMedication[];

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
