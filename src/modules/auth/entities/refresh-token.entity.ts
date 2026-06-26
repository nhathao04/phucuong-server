import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity({ name: "refresh_tokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  tokenHash!: string;

  @Column({ type: "timestamp with time zone" })
  expiresAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
