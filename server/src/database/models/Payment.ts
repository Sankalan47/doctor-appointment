// server/src/database/models/Payment.ts
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

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  CASH = 'cash',
  OTHER = 'other',
}

@Table({
  tableName: 'payments',
})
export default class Payment extends Model {
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

  @Column(DataType.DECIMAL(10, 2))
  amount!: number;

  @Column(DataType.DECIMAL(10, 2))
  tax?: number;

  @Column(DataType.DECIMAL(10, 2))
  platformFee?: number;

  @Column(DataType.DECIMAL(10, 2))
  doctorAmount?: number;

  @Column(DataType.ENUM(...Object.values(PaymentStatus)))
  status!: PaymentStatus;

  @Column(DataType.ENUM(...Object.values(PaymentMethod)))
  method!: PaymentMethod;

  @Column(DataType.STRING)
  transactionId?: string;

  @Column(DataType.JSONB)
  gatewayResponse?: Record<string, any>;

  @Column(DataType.STRING)
  invoiceNumber?: string;

  @Column(DataType.DATE)
  paidAt?: Date;

  @Column(DataType.STRING)
  refundReason?: string;

  @Column(DataType.DECIMAL(10, 2))
  refundAmount?: number;

  @Column(DataType.DATE)
  refundedAt?: Date;

  // Timestamps
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
