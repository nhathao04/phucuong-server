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
import { InquiryAction } from "./inquiry.enums";

@Entity({ name: "inquiry_step_events" })
@Check(`"stepNo" BETWEEN 1 AND 4`)
export class InquiryStepEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.stepEvents, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Column({ type: "smallint" })
  stepNo!: number;

  @Column({ type: "varchar", length: 80, nullable: true })
  stepKey!: string | null;

  @Column({
    type: "enum",
    enum: InquiryAction,
    default: InquiryAction.CONTINUE,
  })
  action!: InquiryAction;

  @Column({ type: "jsonb" })
  snapshotData!: Record<string, unknown>;

  @Column({ type: "jsonb", nullable: true })
  changedFields!: Record<string, unknown> | null;

  @Column({ type: "varchar", length: 20, default: "customer" })
  createdBy!: string;

  @Column({ type: "uuid", nullable: true })
  createdByUserId!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  eventAt!: Date;
}
