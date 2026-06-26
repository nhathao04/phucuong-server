import { Exclude } from "class-transformer";
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
import { EmailVerificationToken } from "../../auth/entities/email-verification-token.entity";
import { PasswordResetToken } from "../../auth/entities/password-reset-token.entity";
import { RefreshToken } from "../../auth/entities/refresh-token.entity";
import { Role } from "./role.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  @Exclude()
  password!: string;

  @Column({ type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "uuid", nullable: true })
  roleId!: string | null;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: true,
    onDelete: "SET NULL",
    eager: true,
  })
  @JoinColumn({ name: "roleId" })
  role!: Role | null;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(
    () => PasswordResetToken,
    (passwordResetToken) => passwordResetToken.user,
  )
  passwordResetTokens!: PasswordResetToken[];

  @OneToMany(
    () => EmailVerificationToken,
    (emailVerificationToken) => emailVerificationToken.user,
  )
  emailVerificationTokens!: EmailVerificationToken[];

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
