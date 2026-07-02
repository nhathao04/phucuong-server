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
import { ProductAttributeOption } from "./product-attribute-option.entity";

@Entity({ name: "product_attribute_mappings" })
export class ProductAttributeMapping {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.attributeMappings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Index()
  @Column({ type: "uuid" })
  attributeId!: string;

  @ManyToOne(() => ProductAttribute, (attribute) => attribute.productMappings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "attributeId" })
  attribute!: ProductAttribute;

  @Column({ type: "uuid", nullable: true })
  defaultOptionId!: string | null;

  @ManyToOne(() => ProductAttributeOption, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "defaultOptionId" })
  defaultOption!: ProductAttributeOption | null;

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
