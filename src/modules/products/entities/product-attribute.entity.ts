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

export enum ProductAttributeType {
  SELECT = "select",
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

@Entity({ name: "product_attributes" })
export class ProductAttribute {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  code!: string;

  @Column({ type: "varchar", length: 180 })
  name!: string;

  @Column({
    type: "enum",
    enum: ProductAttributeType,
    default: ProductAttributeType.SELECT,
  })
  type!: ProductAttributeType;

  @Column({ type: "varchar", length: 40, nullable: true })
  unit!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => ProductAttributeOption, (option) => option.attribute)
  options!: ProductAttributeOption[];

  @OneToMany(() => ProductAttributeMapping, (mapping) => mapping.attribute)
  productMappings!: ProductAttributeMapping[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
