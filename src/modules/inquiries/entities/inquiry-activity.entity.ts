import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Inquiry } from "./inquiry.entity";
import { InquiryActivityAction } from "./inquiry.enums";

@Entity({ name: "inquiry_activities" })
export class InquiryActivity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.activities, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Column({ type: "smallint", nullable: true })
  stepNo!: number | null;

  @Column({ type: "enum", enum: InquiryActivityAction })
  action!: InquiryActivityAction;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "uuid", nullable: true })
  createdByUserId!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
