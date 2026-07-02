import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "../../customers/entities/customer.entity";
import { Inquiry } from "./inquiry.entity";
import { InquiryEmailType } from "./inquiry.enums";

export enum EmailLogStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}

@Entity({ name: "email_logs" })
export class EmailLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.emailLogs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Index()
  @Column({ type: "uuid", nullable: true })
  customerId!: string | null;

  @ManyToOne(() => Customer, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "customerId" })
  customer!: Customer | null;

  @Column({ type: "enum", enum: InquiryEmailType })
  type!: InquiryEmailType;

  @Column({ type: "varchar", length: 220 })
  recipient!: string;

  @Column({
    type: "enum",
    enum: EmailLogStatus,
    default: EmailLogStatus.PENDING,
  })
  status!: EmailLogStatus;

  @Column({ type: "jsonb", nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ type: "text", nullable: true })
  errorMessage!: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
