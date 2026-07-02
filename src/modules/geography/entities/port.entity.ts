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
import { Country } from "./country.entity";
import { Inquiry } from "../../inquiries/entities/inquiry.entity";

@Entity({ name: "ports" })
export class Port {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  countryId!: string;

  @ManyToOne(() => Country, (country) => country.ports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "countryId" })
  country!: Country;

  @Column({ type: "varchar", length: 20, nullable: true })
  code!: string | null;

  @Column({ type: "varchar", length: 180 })
  name!: string;

  @Column({ type: "boolean", default: false })
  isMajor!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Inquiry, (inquiry) => inquiry.destinationPortRelation)
  inquiries!: Inquiry[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
