import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Inquiry } from "./inquiry.entity";
import { EmailOutboxStatus } from "./inquiry.enums";

@Entity({ name: "email_outbox" })
@Check(`"stepNo" BETWEEN 1 AND 4`)
export class EmailOutbox {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.outboxEmails, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Column({ type: "smallint" })
  stepNo!: number;

  @Column({ type: "varchar", length: 80 })
  templateCode!: string;

  @Column({ type: "varchar", length: 180 })
  toEmail!: string;

  @Column({ type: "jsonb" })
  payload!: Record<string, unknown>;

  @Index()
  @Column({
    type: "enum",
    enum: EmailOutboxStatus,
    default: EmailOutboxStatus.PENDING,
  })
  status!: EmailOutboxStatus;

  @Column({ type: "integer", default: 0 })
  retryCount!: number;

  @Column({ type: "text", nullable: true })
  lastError!: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  nextRetryAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
