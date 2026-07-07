import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductAttributeOption } from "./product-attribute-option.entity";
import { ProductAttributeMapping } from "./product-attribute-mapping.entity";
import { ProductAttributeValue } from "./product-attribute-value.entity";

export enum ProductAttributeGroup {
  SPECIFICATIONS = "specifications",
  PACKING = "packing",
  DOCUMENTS = "documents",
  LOGISTICS = "logistics",
  OTHER = "other",
}

export enum ProductAttributeType {
  SELECT = "select",
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
  RANGE = "range",
  RICH_TEXT = "rich_text",
}

@Entity({ name: "product_attributes" })
export class ProductAttribute {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  code!: string;

  @Column({ type: "varchar", length: 180 })
  name!: string;

  @Index()
  @Column({
    type: "enum",
    enum: ProductAttributeGroup,
    default: ProductAttributeGroup.OTHER,
  })
  groupKey!: ProductAttributeGroup;

  @Index()
  @Column({
    type: "enum",
    enum: ProductAttributeType,
    default: ProductAttributeType.SELECT,
  })
  type!: ProductAttributeType;

  @Column({ type: "varchar", length: 40, nullable: true })
  unit!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  defaultValue!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  placeholder!: string | null;

  @Column({ type: "text", nullable: true })
  footnote!: string | null;

  @Column({ type: "varchar", length: 180, nullable: true })
  sectionLabel!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => ProductAttributeOption, (option) => option.attribute)
  options!: ProductAttributeOption[];

  @OneToMany(() => ProductAttributeMapping, (mapping) => mapping.attribute)
  productMappings!: ProductAttributeMapping[];

  @OneToMany(() => ProductAttributeValue, (value) => value.attribute)
  productValues!: ProductAttributeValue[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}