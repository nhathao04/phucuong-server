import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: "product_packaging_options" })
export class ProductPackagingOption {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(
    () => Product,
    (product) => product.packagingOptions,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  details!: string[];

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;
}
