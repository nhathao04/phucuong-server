import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuoteItem } from "./quote-item.entity";
import { QuoteCertificate } from "./quote-certificate.entity";
import { User } from "../../users/entities/user.entity";
import { Certificate } from "../../inquiries/entities/certificate.entity";
import { TradeTerm } from "../../products/entities/trade-term.entity";

@Entity({ name: "quotes" })
export class Quote {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "varchar", length: 20, unique: true })
  code!: string;

  // Customer Information
  @Column({ type: "varchar", length: 255 })
  customerName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  companyName!: string | null;

  @Column({ type: "varchar", length: 100 })
  country!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  whatsapp!: string | null;

  // Product Information (from inquiry form)
  @Column({ type: "varchar", length: 20, nullable: true })
  productSource!: "catalog" | "others" | null;

  @Column({ type: "uuid", nullable: true })
  productId!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  productName!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  quantity!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  containerType!: string | null;

  // Preferred price terms
  //   - tradeTermId: FK to a real TradeTerm row when the customer picked from
  //     the BE-managed dropdown (FOB, CIF, …). nullable: customer may not
  //     have a preference.
  //   - tradeTermName: display value persisted at write time. Sourced from
  //     TradeTerm.name when id is set, or from the customer's free-form
  //     text otherwise. Keeping it denormalised on Quote means historical
  //     rows stay readable even if the underlying TradeTerm is later
  //     renamed/deactivated — and we don't need to LEFT JOIN on the read
  //     path just to render a label.
  @Column({ type: "int", nullable: true })
  tradeTermId!: number | null;

  @ManyToOne(() => TradeTerm, { onDelete: "SET NULL", nullable: true })
  tradeTerm!: TradeTerm | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  tradeTermName!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  // Quote Response (from staff)
  @Column({ type: "boolean", default: false })
  contacted!: boolean;

  @Column({ type: "decimal", precision: 14, scale: 2, nullable: true })
  quotedPrice!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  priceUnit!: string | null;

  @Column({ type: "date", nullable: true })
  validUntil!: Date | null;

  @Column({ type: "text", nullable: true })
  staffNotes!: string | null;

  // Staff Assignment
  @Column({ type: "uuid", nullable: true })
  assignedToId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  assignedTo!: User | null;

  @Column({ type: "uuid", nullable: true })
  quotedById!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  quotedBy!: User | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  quotedAt!: Date | null;

  // Relations
  @OneToMany(() => QuoteItem, (item) => item.quote)
  items!: QuoteItem[];

  @OneToMany(() => QuoteCertificate, (qc) => qc.quote)
  certificates!: QuoteCertificate[];

  // Timestamps
  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
