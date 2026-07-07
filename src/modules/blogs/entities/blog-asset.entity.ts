import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Asset } from "../../media/entities/asset.entity";
import { Blog } from "./blog.entity";

@Entity({ name: "blog_assets" })
@Index("UQ_blog_assets_blogId_assetId", ["blogId", "assetId"], { unique: true })
export class BlogAsset {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  blogId!: string;

  @ManyToOne(() => Blog, (blog) => blog.assets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blogId" })
  blog!: Blog;

  @Index()
  @Column({ type: "uuid" })
  assetId!: string;

  @ManyToOne(() => Asset, { onDelete: "CASCADE" })
  @JoinColumn({ name: "assetId" })
  asset!: Asset;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
