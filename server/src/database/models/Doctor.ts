// server/src/database/models/Doctor.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import User from './User';
import Appointment from './Appointment';
import DoctorClinic from './DoctorClinic';
import DoctorSchedule from './DoctorSchedule';
import DoctorSpecialization from './DoctorSpecialization';

export enum DoctorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

@Table({
  tableName: 'doctors',
  paranoid: true,
})
export default class Doctor extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.STRING)
  licenseNumber!: string;

  @Column(DataType.TEXT)
  biography?: string;

  @Column(DataType.JSONB)
  education!: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;

  @Column(DataType.JSONB)
  experience!: Array<{
    position: string;
    institution: string;
    startYear: number;
    endYear?: number;
  }>;

  @Column(DataType.DECIMAL(10, 2))
  consultationFee!: number;

  @Column(DataType.DECIMAL(10, 2))
  homeVisitFee?: number;

  @Column(DataType.BOOLEAN)
  offersHomeVisit!: boolean;

  @Column(DataType.BOOLEAN)
  offersTeleConsultation!: boolean;

  @Column(DataType.ENUM(...Object.values(DoctorStatus)))
  status!: DoctorStatus;

  @Column(DataType.FLOAT)
  averageRating?: number;

  @Column(DataType.INTEGER)
  totalRatings?: number;

  // Relationships
  @HasMany(() => Appointment)
  appointments!: Appointment[];

  @HasMany(() => DoctorClinic)
  doctorClinics!: DoctorClinic[];

  @HasMany(() => DoctorSchedule)
  schedules!: DoctorSchedule[];

  @HasMany(() => DoctorSpecialization)
  specializations!: DoctorSpecialization[];

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;
}
