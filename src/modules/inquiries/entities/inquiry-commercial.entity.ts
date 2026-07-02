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
import { InquiryPaymentTerm, InquiryTradeTerm } from "./inquiry.enums";

@Entity({ name: "inquiry_commercials" })
export class InquiryCommercial {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.commercial, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Column({ type: "enum", enum: InquiryTradeTerm, nullable: true })
  tradeTerm!: InquiryTradeTerm | null;

  @Column({ type: "enum", enum: InquiryPaymentTerm, nullable: true })
  paymentTerm!: InquiryPaymentTerm | null;

  @Column({ type: "date", nullable: true })
  expectedDeliveryDate!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
