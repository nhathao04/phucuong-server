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
import { Inquiry } from "./inquiry.entity";

@Entity({ name: "inquiry_requirements" })
export class InquiryRequirement {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.requirement, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Column({ type: "jsonb", nullable: true })
  certificateRequired!: Array<Record<string, unknown>> | null;

  @Column({ type: "jsonb", nullable: true })
  additionalRequirements!: Array<Record<string, unknown>> | null;

  @Column({ type: "text", nullable: true })
  otherNotes!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
