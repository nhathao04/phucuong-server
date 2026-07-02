import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "../../customers/entities/customer.entity";
import { Port } from "./port.entity";

@Entity({ name: "countries" })
export class Country {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 3 })
  code!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  region!: string | null;

  @Column({ type: "boolean", default: false })
  isPriorityMarket!: boolean;

  @Column({ type: "integer", nullable: true })
  priorityOrder!: number | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Port, (port) => port.country)
  ports!: Port[];

  @OneToMany(() => Customer, (customer) => customer.country)
  customers!: Customer[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
