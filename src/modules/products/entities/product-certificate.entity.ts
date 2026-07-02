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
import { Certificate } from "../../inquiries/entities/certificate.entity";
import { Product } from "./product.entity";

@Entity({ name: "product_certificates" })
export class ProductCertificate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Index()
  @Column({ type: "uuid" })
  certificateId!: string;

  @ManyToOne(() => Certificate, { onDelete: "CASCADE" })
  @JoinColumn({ name: "certificateId" })
  certificate!: Certificate;

  @Column({ type: "boolean", default: false })
  isRequired!: boolean;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
