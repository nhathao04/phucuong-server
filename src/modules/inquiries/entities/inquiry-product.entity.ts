import {
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
import { Inquiry } from "./inquiry.entity";
import { Product } from "../../products/entities/product.entity";
import { InquiryProductAttribute } from "./inquiry-product-attribute.entity";

@Entity({ name: "inquiry_products" })
export class InquiryProduct {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.inquiryProducts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column({ type: "numeric", precision: 14, scale: 3, nullable: true })
  quantityMt!: string | null;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  estimatedContainer!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  moqStatus!: string | null;

  @Column({ type: "boolean", default: false })
  sampleRequired!: boolean;

  @Column({ type: "jsonb", nullable: true })
  notes!: Record<string, unknown> | null;

  @OneToMany(
    () => InquiryProductAttribute,
    (attribute) => attribute.inquiryProduct,
  )
  attributes!: InquiryProductAttribute[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
