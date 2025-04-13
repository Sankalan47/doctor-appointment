// server/src/database/models/Patient.ts
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
import Appointment from './Appointment';

@Table({
  tableName: 'patients',
  paranoid: true,
})
export default class Patient extends Model {
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

  @Column(DataType.DATEONLY)
  dateOfBirth?: Date;

  @Column(DataType.ENUM('male', 'female', 'other'))
  gender?: string;

  @Column(DataType.TEXT)
  allergies?: string;

  @Column(DataType.TEXT)
  chronicDiseases?: string;

  @Column(DataType.TEXT)
  currentMedications?: string;

  @Column(DataType.JSONB)
  medicalHistory?: Record<string, any>;

  @Column(DataType.STRING)
  emergencyContactName?: string;

  @Column(DataType.STRING)
  emergencyContactPhone?: string;

  @Column(DataType.STRING)
  emergencyContactRelation?: string;

  // Relationships
  @HasMany(() => Appointment)
  appointments!: Appointment[];

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;
}
