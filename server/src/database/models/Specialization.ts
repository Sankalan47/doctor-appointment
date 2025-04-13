// server/src/database/models/Specialization.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import DoctorSpecialization from './DoctorSpecialization';

@Table({
  tableName: 'specializations',
})
export default class Specialization extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING)
  icon?: string;

  // Relationships
  @HasMany(() => DoctorSpecialization)
  doctorSpecializations!: DoctorSpecialization[];

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
