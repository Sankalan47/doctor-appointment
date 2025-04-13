// server/src/database/models/Clinic.ts
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
} from 'sequelize-typescript';
import User from './User';
import DoctorClinic from './DoctorClinic';
import ClinicSchedule from './DoctorClinicSchedule';

@Table({
  tableName: 'clinics',
  paranoid: true,
})
export default class Clinic extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  adminId!: string;

  @BelongsTo(() => User, 'adminId')
  admin!: User;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.JSONB)
  address!: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column(DataType.STRING)
  phone!: string;

  @Column(DataType.STRING)
  email?: string;

  @Column(DataType.STRING)
  website?: string;

  @Column(DataType.JSONB)
  operatingHours!: Array<{
    day: number; // 0-6 for Sun-Sat
    openTime: string; // HH:MM format
    closeTime: string;
    isClosed: boolean;
  }>;

  @Column(DataType.ARRAY(DataType.STRING))
  facilities?: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  images?: string[];

  @Column(DataType.STRING)
  registrationNumber?: string;

  @Column(DataType.BOOLEAN)
  isVerified!: boolean;

  @Column(DataType.FLOAT)
  averageRating?: number;

  @Column(DataType.INTEGER)
  totalRatings?: number;

  // Relationships
  @HasMany(() => DoctorClinic)
  doctorClinics!: DoctorClinic[];

  @HasMany(() => ClinicSchedule)
  schedules!: ClinicSchedule[];

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;
}
