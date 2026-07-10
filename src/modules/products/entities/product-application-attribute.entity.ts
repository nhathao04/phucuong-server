import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductApplication } from "./product-application.entity";

@Entity({ name: "product_application_attributes" })
export class ProductApplicationAttribute {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  productApplicationId!: string;

  @ManyToOne(
    () => ProductApplication,
    (app) => app.attributes,
    { onDelete: "CASCADE" },
  )
  application!: ProductApplication;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  value!: string | null;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
