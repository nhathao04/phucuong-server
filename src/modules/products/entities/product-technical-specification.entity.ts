import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: "product_technical_specifications" })
export class ProductTechnicalSpecification {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(
    () => Product,
    (product) => product.technicalSpecifications,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column({ type: "varchar", length: 255 })
  label!: string;

  @Column({ type: "text" })
  value!: string;

  @Column({ type: "varchar", length: 60, nullable: true })
  unit!: string | null;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;
}
