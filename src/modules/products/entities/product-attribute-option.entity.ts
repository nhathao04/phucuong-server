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
import { ProductAttribute } from "./product-attribute.entity";

@Entity({ name: "product_attribute_options" })
export class ProductAttributeOption {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "int" })
  attributeId!: number;

  @ManyToOne(() => ProductAttribute, (attribute) => attribute.options, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "attributeId" })
  attribute!: ProductAttribute;

  @Column({ type: "varchar", length: 180 })
  value!: string;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Index()
  @Column({ type: "boolean", default: false })
  isCustomTrigger!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  customPlaceholder!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
