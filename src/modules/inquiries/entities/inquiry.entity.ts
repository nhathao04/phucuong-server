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
import { Customer } from "../../customers/entities/customer.entity";
import { Product } from "../../products/entities/product.entity";
import { Country } from "../../geography/entities/country.entity";
import { Port } from "../../geography/entities/port.entity";
import {
  InquiryFormStatus,
  InquiryPaymentTerm,
  InquiryQuantityUnit,
  InquiryStatus,
  InquirySalesStatus,
  InquiryTradeTerm,
} from "./inquiry.enums";
import { EmailOutbox } from "./email-outbox.entity";
import { InquiryAssignment } from "./inquiry-assignment.entity";
import { InquiryCertificate } from "./inquiry-certificate.entity";
import { InquiryStepEvent } from "./inquiry-step-event.entity";
import { InquiryProduct } from "./inquiry-product.entity";
import { InquiryCommercial } from "./inquiry-commercial.entity";
import { InquiryRequirement } from "./inquiry-requirement.entity";
import { InquiryActivity } from "./inquiry-activity.entity";
import { EmailLog } from "./email-log.entity";
import { Notification } from "./notification.entity";

@Entity({ name: "inquiries" })
@Check(`"currentStep" BETWEEN 1 AND 4`)
export class Inquiry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50, nullable: true })
  code!: string | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  customerId!: string | null;

  @ManyToOne(() => Customer, (customer) => customer.inquiries, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "customerId" })
  customer!: Customer | null;

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
  @Column({ type: "uuid", nullable: true })
  destinationCountryId!: string | null;

  @ManyToOne(() => Country, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "destinationCountryId" })
  destinationCountryRelation!: Country | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  destinationPortId!: string | null;

  @ManyToOne(() => Port, (port) => port.inquiries, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "destinationPortId" })
  destinationPortRelation!: Port | null;

  @Index()
  @Column({
    type: "enum",
    enum: InquiryStatus,
    default: InquiryStatus.DRAFT,
  })
  status!: InquiryStatus;

  @Column({ type: "smallint", default: 1 })
  currentStep!: number;

  @Column({
    type: "enum",
    enum: InquiryFormStatus,
    default: InquiryFormStatus.DRAFT_STEP_1,
  })
  formStatus!: InquiryFormStatus;

  @Column({
    type: "enum",
    enum: InquirySalesStatus,
    nullable: true,
  })
  salesStatus!: InquirySalesStatus | null;

  @Column({ type: "boolean", default: false })
  isCompleted!: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  lastStepSavedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  step1CompletedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  step2CompletedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  step3CompletedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  step4CompletedAt!: Date | null;

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

  @Column({
    type: "enum",
    enum: InquiryPaymentTerm,
    nullable: true,
  })
  paymentTerm!: InquiryPaymentTerm | null;

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
  expectedDeliveryDate!: string | null;

  @Column({ type: "date", nullable: true })
  deliveryTime!: string | null;

  @Column({ type: "boolean", default: false })
  sampleRequest!: boolean;

  @Column({ type: "jsonb", nullable: true })
  productAttributes!: Record<string, unknown> | null;

  @Column({ type: "jsonb", nullable: true })
  commercialTerms!: Record<string, unknown> | null;

  @Column({ type: "jsonb", nullable: true })
  customerRequirements!: Record<string, unknown> | null;

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

  @Column({ type: "text", nullable: true })
  internalNotes!: string | null;

  @Column({ type: "inet", nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  referrerUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  landingPageUrl!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmSource!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmMedium!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmCampaign!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmContent!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmTerm!: string | null;

  @Column({ type: "boolean", default: false })
  customerEmailSent!: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  customerEmailSentAt!: Date | null;

  @Column({ type: "boolean", default: false })
  internalEmailSent!: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  internalEmailSentAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  submittedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  leadCapturedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  lastContinueAt!: Date | null;

  @OneToMany(
    () => InquiryCertificate,
    (inquiryCertificate) => inquiryCertificate.inquiry,
  )
  inquiryCertificates!: InquiryCertificate[];

  @OneToMany(() => InquiryStepEvent, (stepEvent) => stepEvent.inquiry)
  stepEvents!: InquiryStepEvent[];

  @OneToMany(() => InquiryProduct, (inquiryProduct) => inquiryProduct.inquiry)
  inquiryProducts!: InquiryProduct[];

  @OneToMany(() => InquiryCommercial, (commercial) => commercial.inquiry)
  commercial!: InquiryCommercial[];

  @OneToMany(() => InquiryRequirement, (requirement) => requirement.inquiry)
  requirement!: InquiryRequirement[];

  @OneToMany(() => InquiryActivity, (activity) => activity.inquiry)
  activities!: InquiryActivity[];

  @OneToMany(() => EmailLog, (emailLog) => emailLog.inquiry)
  emailLogs!: EmailLog[];

  @OneToMany(() => Notification, (notification) => notification.inquiry)
  notifications!: Notification[];

  @OneToMany(() => InquiryAssignment, (assignment) => assignment.inquiry)
  assignments!: InquiryAssignment[];

  @OneToMany(() => EmailOutbox, (outbox) => outbox.inquiry)
  outboxEmails!: EmailOutbox[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
