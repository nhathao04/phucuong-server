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
import { Product } from "./product.entity";
import { ProductAttribute } from "./product-attribute.entity";

@Entity({ name: "product_attribute_values" })
@Index(["productId", "attributeId"], { unique: true })
export class ProductAttributeValue {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.attributeValues, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Index()
  @Column({ type: "int" })
  attributeId!: number;

  @ManyToOne(
    () => ProductAttribute,
    (attribute) => attribute.productValues,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "attributeId" })
  attribute!: ProductAttribute;

  @Column({ type: "text", nullable: true })
  value!: string | null;

  @Column({ type: "numeric", precision: 14, scale: 3, nullable: true })
  valueNumber!: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  unit!: string | null;

  @Column({ type: "text", nullable: true })
  footnote!: string | null;

  @Column({ type: "varchar", length: 180, nullable: true })
  sectionLabel!: string | null;

  @Column({ type: "boolean", default: false })
  required!: boolean;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}