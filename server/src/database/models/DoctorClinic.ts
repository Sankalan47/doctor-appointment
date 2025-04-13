// server/src/database/models/DoctorClinic.ts
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
import Doctor from './Doctor';
import Clinic from './Clinic';
import DoctorClinicSchedule from './DoctorClinicSchedule';

@Table({
  tableName: 'doctor_clinics',
})
export default class DoctorClinic extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Doctor)
  @Column(DataType.UUID)
  doctorId!: string;

  @BelongsTo(() => Doctor)
  doctor!: Doctor;

  @ForeignKey(() => Clinic)
  @Column(DataType.UUID)
  clinicId!: string;

  @BelongsTo(() => Clinic)
  clinic!: Clinic;

  @Column(DataType.DECIMAL(10, 2))
  consultationFee!: number;

  @Column(DataType.INTEGER)
  consultationDuration!: number; // minutes

  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Column(DataType.TEXT)
  notes?: string;

  // Relationships
  @HasMany(() => DoctorClinicSchedule)
  schedules!: DoctorClinicSchedule[];

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
