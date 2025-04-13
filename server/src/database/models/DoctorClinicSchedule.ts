// server/src/database/models/DoctorClinicSchedule.ts
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
import DoctorClinic from './DoctorClinic';

@Table({
  tableName: 'doctor_clinic_schedules',
})
export default class DoctorClinicSchedule extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => DoctorClinic)
  @Column(DataType.UUID)
  doctorClinicId!: string;

  @BelongsTo(() => DoctorClinic)
  doctorClinic!: DoctorClinic;

  @Column(DataType.INTEGER)
  dayOfWeek!: number; // 0-6 for Sun-Sat

  @Column(DataType.TIME)
  startTime!: string; // HH:MM:SS format

  @Column(DataType.TIME)
  endTime!: string;

  @Column(DataType.INTEGER)
  slotDuration!: number; // minutes

  @Column(DataType.INTEGER)
  maxPatients?: number; // max patients per slot, null for unlimited

  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
