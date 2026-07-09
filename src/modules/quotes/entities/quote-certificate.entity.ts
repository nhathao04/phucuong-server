import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quote } from "./quote.entity";
import { Certificate } from "../../inquiries/entities/certificate.entity";

@Entity({ name: "quote_certificates" })
export class QuoteCertificate {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "int" })
  quoteId!: number;

  @ManyToOne(() => Quote, (quote) => quote.certificates, { onDelete: "CASCADE" })
  quote!: Quote;

  @Column({ type: "uuid" })
  certificateId!: string;

  @ManyToOne(() => Certificate, { onDelete: "CASCADE" })
  certificate!: Certificate;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
