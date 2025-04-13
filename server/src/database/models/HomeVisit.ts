// server/src/database/models/HomeVisit.ts
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

export enum HomeVisitStatus {
  SCHEDULED = 'scheduled',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'home_visits',
})
export default class HomeVisit extends Model {
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

  @Column(DataType.ENUM(...Object.values(HomeVisitStatus)))
  status!: HomeVisitStatus;

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
    additionalInfo?: string;
  };

  @Column(DataType.DATE)
  estimatedArrivalTime?: Date;

  @Column(DataType.DATE)
  actualArrivalTime?: Date;

  @Column(DataType.DATE)
  visitStartTime?: Date;

  @Column(DataType.DATE)
  visitEndTime?: Date;

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
