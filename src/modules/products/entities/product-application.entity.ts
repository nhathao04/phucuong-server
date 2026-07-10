import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity";
import { ProductApplicationAttribute } from "./product-application-attribute.entity";

@Entity({ name: "product_applications" })
export class ProductApplication {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.applications, {
    onDelete: "CASCADE",
  })
  product!: Product;

  @Column({ type: "text", nullable: true })
  introLine!: string | null;

  @OneToMany(
    () => ProductApplicationAttribute,
    (attr) => attr.application,
    { cascade: true },
  )
  attributes!: ProductApplicationAttribute[];

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
