import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Inquiry } from "../../inquiries/entities/inquiry.entity";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 220 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true })
  image!: string | null;

  @Column({ type: "text", nullable: true })
  specification!: string | null;

  @Column({ type: "text", nullable: true })
  packing!: string | null;

  @Column({ type: "text", nullable: true })
  applications!: string | null;

  @Column({ type: "jsonb", nullable: true })
  documents!: Record<string, unknown> | null;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  containerCapacity!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  containerType!: string | null;

  @OneToMany(() => Inquiry, (inquiry) => inquiry.product)
  inquiries!: Inquiry[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
