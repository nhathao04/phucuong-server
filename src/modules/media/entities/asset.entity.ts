import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum AssetOwnerType {
  BLOG = "BLOG",
  PRODUCT = "PRODUCT",
  CATEGORY = "CATEGORY",
  TAG = "TAG",
  GENERAL = "GENERAL",
}

@Entity({ name: "assets" })
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", length: 500 })
  url!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional()
  @Column({ type: "varchar", length: 255, nullable: true })
  alt!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  caption!: string | null;

  @Column({ type: "integer", nullable: true })
  width!: number | null;

  @Column({ type: "integer", nullable: true })
  height!: number | null;

  @ApiPropertyOptional()
  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @Index()
  @Column({ type: "varchar", length: 60 })
  mimeType!: string;

  @Column({ type: "bigint", nullable: true })
  byteSize!: number | null;

  @Index()
  @Column({ type: "varchar", length: 500, nullable: true })
  originalName!: string | null;

  @Index()
  @Column({ type: "varchar", length: 60, nullable: true })
  storageKey!: string | null;

  @Index()
  @Column({
    type: "enum",
    enum: AssetOwnerType,
    default: AssetOwnerType.GENERAL,
  })
  ownerType!: AssetOwnerType;

  @Index()
  @Column({ type: "uuid", nullable: true })
  ownerId!: string | null;

  @Column({ type: "uuid", nullable: true })
  uploadedById!: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
