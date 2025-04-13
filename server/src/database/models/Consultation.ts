// server/src/database/models/Consultation.ts
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
import Appointment from './Appointment';

export enum ConsultationStatus {
  SCHEDULED = 'scheduled',
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'consultations',
})
export default class Consultation extends Model {
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

  @Column(DataType.ENUM(...Object.values(ConsultationStatus)))
  status!: ConsultationStatus;

  @Column(DataType.STRING)
  sessionId?: string;

  @Column(DataType.STRING)
  sessionToken?: string;

  @Column(DataType.DATE)
  startTime?: Date;

  @Column(DataType.DATE)
  endTime?: Date;

  @Column(DataType.INTEGER)
  duration?: number; // in minutes

  @Column(DataType.STRING)
  recordingUrl?: string;

  @Column(DataType.TEXT)
  doctorNotes?: string;

  @Column(DataType.JSONB)
  metadata?: Record<string, any>;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
