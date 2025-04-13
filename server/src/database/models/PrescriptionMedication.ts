// server/src/database/models/PrescriptionMedication.ts
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
import Prescription from './Prescription';

@Table({
  tableName: 'prescription_medications',
})
export default class PrescriptionMedication extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Prescription)
  @Column(DataType.UUID)
  prescriptionId!: string;

  @BelongsTo(() => Prescription)
  prescription!: Prescription;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  dosage!: string;

  @Column(DataType.STRING)
  frequency!: string;

  @Column(DataType.INTEGER)
  duration!: number;

  @Column(DataType.STRING)
  durationUnit!: string; // days, weeks, months

  @Column(DataType.BOOLEAN)
  isBeforeMeal!: boolean;

  @Column(DataType.TEXT)
  instructions?: string;

  @Column(DataType.TEXT)
  notes?: string;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
