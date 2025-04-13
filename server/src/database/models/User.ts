// server/src/database/models/User.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  BeforeCreate,
  BeforeUpdate,
  HasOne,
  Unique,
  AllowNull,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import config from '../../config';
import Doctor from './Doctor';
import Patient from './Patient';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  CLINIC_ADMIN = 'clinic_admin',
}

@Table({
  tableName: 'users',
  paranoid: true, // Soft deletes
})
export default class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  firstName!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  lastName!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Unique
  @Column(DataType.STRING)
  phone!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: UserRole;

  @Column(DataType.STRING)
  profileImage?: string;

  @Column(DataType.JSONB)
  address?: Record<string, any>;

  @Column(DataType.BOOLEAN)
  isEmailVerified!: boolean;

  @Column(DataType.BOOLEAN)
  isPhoneVerified!: boolean;

  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Column(DataType.DATE)
  lastLogin?: Date;

  @Column(DataType.STRING)
  refreshToken?: string;

  // Virtual field (not stored in DB)
  @Column(DataType.VIRTUAL)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Relationships
  @HasOne(() => Doctor)
  doctor?: Doctor;

  @HasOne(() => Patient)
  patient?: Patient;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;

  // Hash password before saving
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User): Promise<void> {
    // Only hash the password if it has been modified (or is new)
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  // Compare password method
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
