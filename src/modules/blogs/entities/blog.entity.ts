import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Asset } from "../../media/entities/asset.entity";
import { User } from "../../users/entities/user.entity";
import { BlogAsset } from "./blog-asset.entity";
import { BlogCategory } from "./blog-category.entity";
import { BlogTag } from "./blog-tag.entity";

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
  contentHtml!: string | null;

  @Column({ type: "jsonb", nullable: true })
  contentJson!: Record<string, unknown> | null;

  @Column({ type: "text", nullable: true })
  contentText!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  coverImageUrl!: string | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  thumbnailAssetId!: string | null;

  @ManyToOne(() => Asset, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "thumbnailAssetId" })
  thumbnailAsset!: Asset | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  coverImageAssetId!: string | null;

  @ManyToOne(() => Asset, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "coverImageAssetId" })
  coverImage!: Asset | null;

  @OneToMany(() => BlogAsset, (blogAsset) => blogAsset.blog)
  assets!: BlogAsset[];

  @Column({ type: "integer", nullable: true })
  readTimeMinutes!: number | null;

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

  @Index()
  @Column({ type: "uuid", nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => BlogCategory, (cat) => cat.blogs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category!: BlogCategory | null;

  @ManyToMany(() => BlogTag, (tag) => tag.blogs, { cascade: true })
  @JoinTable({
    name: "blog_tag_map",
    joinColumn: { name: "blogId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tagId", referencedColumnName: "id" },
  })
  tags!: BlogTag[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
