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
import { Country } from "../../geography/entities/country.entity";
import { Product } from "./product.entity";

@Entity({ name: "product_country_configs" })
export class ProductCountryConfig {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.countryConfigs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Index()
  @Column({ type: "uuid" })
  countryId!: string;

  @ManyToOne(() => Country, { onDelete: "CASCADE" })
  @JoinColumn({ name: "countryId" })
  country!: Country;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  moqMt!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  moqLabel!: string | null;

  @Column({ type: "integer", nullable: true })
  leadTimeDays!: number | null;

  @Column({ type: "varchar", length: 220, nullable: true })
  seoTitle!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  metaDescription!: string | null;

  @Column({ type: "varchar", length: 220, nullable: true })
  landingSlug!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
