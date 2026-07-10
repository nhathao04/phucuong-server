import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Quote } from "./quote.entity";

@Entity({ name: "quote_items" })
export class QuoteItem {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "int" })
  quoteId!: number;

  @ManyToOne(() => Quote, (quote) => quote.items, { onDelete: "CASCADE" })
  quote!: Quote;

  @Column({ type: "uuid", nullable: true })
  productId!: string | null;

  @Column({ type: "varchar", length: 255 })
  productName!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  quantity!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  unit!: string | null;

  @Column({ type: "decimal", precision: 14, scale: 2, nullable: true })
  unitPrice!: string | null;

  @Column({ type: "decimal", precision: 14, scale: 2, nullable: true })
  totalPrice!: string | null;

  @Column({ type: "text", nullable: true })
  specifications!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
