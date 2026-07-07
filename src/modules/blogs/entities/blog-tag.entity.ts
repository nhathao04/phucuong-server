import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Blog } from "./blog.entity";

@Entity({ name: "blog_tags" })
export class BlogTag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 80 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  slug!: string;

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs!: Blog[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
