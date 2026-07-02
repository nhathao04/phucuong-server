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
import { InquiryProduct } from "./inquiry-product.entity";
import { ProductAttribute } from "../../products/entities/product-attribute.entity";
import { ProductAttributeOption } from "../../products/entities/product-attribute-option.entity";

@Entity({ name: "inquiry_product_attributes" })
export class InquiryProductAttribute {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryProductId!: string;

  @ManyToOne(
    () => InquiryProduct,
    (inquiryProduct) => inquiryProduct.attributes,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "inquiryProductId" })
  inquiryProduct!: InquiryProduct;

  @Index()
  @Column({ type: "uuid" })
  attributeId!: string;

  @ManyToOne(() => ProductAttribute, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "attributeId" })
  attribute!: ProductAttribute;

  @Column({ type: "uuid", nullable: true })
  optionId!: string | null;

  @ManyToOne(() => ProductAttributeOption, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "optionId" })
  option!: ProductAttributeOption | null;

  @Column({ type: "text", nullable: true })
  valueText!: string | null;

  @Column({ type: "jsonb", nullable: true })
  valueJson!: Record<string, unknown> | null;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
