import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
} from "typeorm";
import { Certificate } from "./certificate.entity";
import { Inquiry } from "./inquiry.entity";

@Entity({ name: "inquiry_certificates" })
export class InquiryCertificate {
  @PrimaryColumn({ type: "uuid" })
  inquiryId!: string;

  @PrimaryColumn({ type: "uuid" })
  certificateId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.inquiryCertificates, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @ManyToOne(
    () => Certificate,
    (certificate) => certificate.inquiryCertificates,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "certificateId" })
  certificate!: Certificate;

  @CreateDateColumn()
  createdAt!: Date;
}
