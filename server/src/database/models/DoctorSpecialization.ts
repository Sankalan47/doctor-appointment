// server/src/database/models/DoctorSpecialization.ts
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
import Doctor from './Doctor';
import Specialization from './Specialization';

@Table({
  tableName: 'doctor_specializations',
})
export default class DoctorSpecialization extends Model {
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

  @ForeignKey(() => Specialization)
  @Column(DataType.UUID)
  specializationId!: string;

  @BelongsTo(() => Specialization)
  specialization!: Specialization;

  @Column(DataType.BOOLEAN)
  isPrimary!: boolean;

  @Column(DataType.DATE)
  certificationDate?: Date;

  @Column(DataType.STRING)
  certificationNumber?: string;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
