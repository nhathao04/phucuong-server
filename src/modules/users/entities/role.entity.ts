import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "roles" })
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string | null;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
