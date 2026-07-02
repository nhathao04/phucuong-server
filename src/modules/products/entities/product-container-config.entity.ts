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

@Entity({ name: "product_container_configs" })
export class ProductContainerConfig {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.containerConfigs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column({ type: "varchar", length: 20 })
  containerCode!: string;

  @Column({ type: "varchar", length: 120 })
  containerName!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  capacityMt!: string;

  @Column({ type: "boolean", default: false })
  isDefault!: boolean;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
