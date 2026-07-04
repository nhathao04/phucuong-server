import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Asset } from "../../media/entities/asset.entity";
import { Product } from "./product.entity";

@Entity({ name: "product_images" })
@Index("UQ_product_images_productId_assetId", ["productId", "assetId"], {
  unique: true,
})
export class ProductImage {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Index()
  @Column({ type: "uuid" })
  assetId!: string;

  @ManyToOne(() => Asset, { onDelete: "CASCADE" })
  @JoinColumn({ name: "assetId" })
  asset!: Asset;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
