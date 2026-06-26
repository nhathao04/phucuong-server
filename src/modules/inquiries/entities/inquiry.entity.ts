import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import {
  InquiryQuantityUnit,
  InquiryStatus,
  InquiryTradeTerm,
} from "./inquiry.enums";
import { EmailOutbox } from "./email-outbox.entity";
import { InquiryAssignment } from "./inquiry-assignment.entity";
import { InquiryCertificate } from "./inquiry-certificate.entity";
import { InquiryStepEvent } from "./inquiry-step-event.entity";

@Entity({ name: "inquiries" })
@Check(`"currentStep" BETWEEN 1 AND 4`)
export class Inquiry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid", nullable: true })
  productId!: string | null;

  @ManyToOne(() => Product, (product) => product.inquiries, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "productId" })
  product!: Product | null;

  @Index()
  @Column({
    type: "enum",
    enum: InquiryStatus,
    default: InquiryStatus.IN_PROGRESS,
  })
  status!: InquiryStatus;

  @Column({ type: "smallint", default: 1 })
  currentStep!: number;

  @Column({ type: "varchar", length: 120, nullable: true })
  destinationCountry!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  destinationPort!: string | null;

  @Column({
    type: "enum",
    enum: InquiryTradeTerm,
    nullable: true,
  })
  tradeTerm!: InquiryTradeTerm | null;

  @Column({ type: "numeric", precision: 14, scale: 3, nullable: true })
  quantity!: string | null;

  @Column({
    type: "enum",
    enum: InquiryQuantityUnit,
    default: InquiryQuantityUnit.MT,
  })
  quantityUnit!: InquiryQuantityUnit;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  estimatedContainer!: string | null;

  @Column({ type: "date", nullable: true })
  deliveryTime!: string | null;

  @Column({ type: "boolean", default: false })
  sampleRequest!: boolean;

  @Column({ type: "varchar", length: 150, nullable: true })
  fullName!: string | null;

  @Column({ type: "varchar", length: 180, nullable: true })
  companyName!: string | null;

  @Index()
  @Column({ type: "varchar", length: 180, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  whatsapp!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  country!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  submittedAt!: Date | null;

  @OneToMany(
    () => InquiryCertificate,
    (inquiryCertificate) => inquiryCertificate.inquiry,
  )
  inquiryCertificates!: InquiryCertificate[];

  @OneToMany(() => InquiryStepEvent, (stepEvent) => stepEvent.inquiry)
  stepEvents!: InquiryStepEvent[];

  @OneToMany(() => InquiryAssignment, (assignment) => assignment.inquiry)
  assignments!: InquiryAssignment[];

  @OneToMany(() => EmailOutbox, (outbox) => outbox.inquiry)
  outboxEmails!: EmailOutbox[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
