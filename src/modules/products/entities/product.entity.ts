import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Inquiry } from "../../inquiries/entities/inquiry.entity";
import { ProductCategory } from "./product-category.entity";
import { ProductAttributeMapping } from "./product-attribute-mapping.entity";
import { ProductContainerConfig } from "./product-container-config.entity";
import { ProductCountryConfig } from "./product-country-config.entity";
import { ProductFaq } from "./product-faq.entity";
import { ProductCertificate } from "./product-certificate.entity";
import { ProductTradeTerm } from "./product-trade-term.entity";

export enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  HIDDEN = "hidden",
}

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 220 })
  slug!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  productCode!: string | null;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 120, nullable: true })
  sku!: string | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  productCategoryId!: string | null;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "productCategoryId" })
  productCategory!: ProductCategory | null;

  @Column({ type: "varchar", length: 220, nullable: true })
  seoTitle!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  metaDescription!: string | null;

  @Column({ type: "varchar", length: 220, nullable: true })
  focusKeyword!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 400, nullable: true })
  shortDescription!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  hsCode!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  origin!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  exportPort!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  shelfLife!: string | null;

  @Column({ type: "text", nullable: true })
  storageCondition!: string | null;

  @Column({ type: "boolean", default: false })
  sampleAvailable!: boolean;

  @Column({ type: "boolean", default: false })
  labReportAvailable!: boolean;

  @Index()
  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Inquiry, (inquiry) => inquiry.product)
  inquiries!: Inquiry[];

  @OneToMany(() => ProductAttributeMapping, (mapping) => mapping.product)
  attributeMappings!: ProductAttributeMapping[];

  @OneToMany(() => ProductContainerConfig, (config) => config.product)
  containerConfigs!: ProductContainerConfig[];

  @OneToMany(() => ProductCountryConfig, (config) => config.product)
  countryConfigs!: ProductCountryConfig[];

  @OneToMany(() => ProductFaq, (faq) => faq.product)
  faqs!: ProductFaq[];

  @OneToMany(() => ProductCertificate, (certificate) => certificate.product)
  certificates!: ProductCertificate[];

  @OneToMany(() => ProductTradeTerm, (tradeTerm) => tradeTerm.product)
  tradeTerms!: ProductTradeTerm[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
