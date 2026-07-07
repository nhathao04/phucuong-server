import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: "product_target_buyers" })
export class ProductTargetBuyer {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(
    () => Product,
    (product) => product.targetBuyers,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;
}
