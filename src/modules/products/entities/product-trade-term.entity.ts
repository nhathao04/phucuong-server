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
import { TradeTerm } from "./trade-term.entity";

@Entity({ name: "product_trade_terms" })
export class ProductTradeTerm {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.tradeTerms, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Index()
  @Column({ type: "integer" })
  tradeTermId!: number;

  @ManyToOne(() => TradeTerm, (tradeTerm) => tradeTerm.productTradeTerms, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "tradeTermId" })
  tradeTerm!: TradeTerm;

  @Column({ type: "boolean", default: false })
  isDefault!: boolean;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
