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
import { Country } from "../../geography/entities/country.entity";
import { Inquiry } from "../../inquiries/entities/inquiry.entity";

@Entity({ name: "customers" })
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 180 })
  fullName!: string;

  @Column({ type: "varchar", length: 220, nullable: true })
  companyName!: string | null;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 180 })
  email!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  whatsappNumber!: string | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  countryId!: string | null;

  @ManyToOne(() => Country, (country) => country.customers, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "countryId" })
  country!: Country | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  source!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmSource!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmMedium!: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  utmCampaign!: string | null;

  @Column({ type: "jsonb", nullable: true })
  notes!: Record<string, unknown> | null;

  @OneToMany(() => Inquiry, (inquiry) => inquiry.customer)
  inquiries!: Inquiry[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
