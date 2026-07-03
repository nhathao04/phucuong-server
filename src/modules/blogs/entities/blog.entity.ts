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
import { User } from "../../users/entities/user.entity";

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  HIDDEN = "HIDDEN",
}

@Entity({ name: "blogs" })
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 220 })
  title!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 220 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  excerpt!: string | null;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "varchar", length: 220, nullable: true })
  seoTitle!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  metaDescription!: string | null;

  @Column({ type: "varchar", length: 220, nullable: true })
  focusKeyword!: string | null;

  @Index()
  @Column({
    type: "enum",
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  publishedAt!: Date | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  authorId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "authorId" })
  author!: User | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
