import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { BlogStatus } from "../entities/blog.entity";

export class AssetSummaryDto {
  @ApiProperty({ example: "asset-uuid" })
  id!: string;

  @ApiProperty({ example: "https://cdn.example.com/uploads/image.webp" })
  url!: string;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/uploads/image-thumb.webp",
  })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional({ example: "SEO image alt text" })
  alt!: string | null;

  @ApiPropertyOptional({ example: "Optional caption" })
  caption!: string | null;

  @ApiPropertyOptional({ example: 1600 })
  width!: number | null;

  @ApiPropertyOptional({ example: 1000 })
  height!: number | null;

  @ApiPropertyOptional({ example: 0 })
  sortOrder!: number;
}

export class BlogAuthorDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Nguyen Van A" })
  fullName!: string;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/authors/nguyen-van-a.webp",
  })
  avatarUrl!: string | null;
}

export class BlogCategoryDto {
  @ApiProperty({ example: "cat-export-guide" })
  id!: string;

  @ApiProperty({ example: "Export Guide" })
  name!: string;

  @ApiProperty({ example: "export-guide" })
  slug!: string;
}

export class BlogTagDto {
  @ApiProperty({ example: "tag-b2b" })
  id!: string;

  @ApiProperty({ example: "B2B" })
  name!: string;

  @ApiProperty({ example: "b2b" })
  slug!: string;
}

export class BlogTableOfContentsItemDto {
  @ApiProperty({ example: "h2-1" })
  id!: string;

  @ApiProperty({ example: 2 })
  level!: number;

  @ApiProperty({ example: "Start with the product use case" })
  text!: string;
}

export class BlogSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Export Guide for Coconut Product Buyers" })
  title!: string;

  @ApiProperty({ example: "export-guide-for-coconut-product-buyers" })
  slug!: string;

  @ApiPropertyOptional({
    example: "Practical notes to prepare better inquiries.",
  })
  excerpt!: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/blog/export-guide-thumb.webp",
    description: "Legacy string thumbnail URL for backward compatibility.",
  })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional({ type: AssetSummaryDto })
  thumbnail!: AssetSummaryDto | null;

  @ApiPropertyOptional({ type: BlogCategoryDto })
  category!: BlogCategoryDto | null;

  @ApiPropertyOptional({ type: [BlogTagDto] })
  tags!: BlogTagDto[];

  @ApiPropertyOptional({ example: 5 })
  readTimeMinutes!: number | null;

  @ApiProperty({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  status!: BlogStatus;

  @ApiProperty({ example: false })
  isFeatured!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: "2026-07-03T10:00:00.000Z" })
  publishedAt!: Date | null;

  @ApiPropertyOptional({ type: BlogAuthorDto })
  author!: BlogAuthorDto | null;

  @ApiPropertyOptional({ example: "Export Guide for Coconut Product Buyers" })
  seoTitle!: string | null;

  @ApiPropertyOptional({
    example: "Learn how to prepare coconut product inquiries.",
  })
  metaDescription!: string | null;

  @ApiPropertyOptional({ example: "coconut product export guide" })
  focusKeyword!: string | null;

  @ApiProperty({ example: "2026-07-03T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-03T10:00:00.000Z" })
  updatedAt!: Date;
}

export class BlogDetailDto extends BlogSummaryDto {
  @ApiPropertyOptional({
    example: "https://cdn.example.com/blog/export-guide-cover.webp",
    description: "Legacy cover image URL string.",
  })
  coverImageUrl!: string | null;

  @ApiPropertyOptional({ type: AssetSummaryDto })
  coverImage!: AssetSummaryDto | null;

  @ApiPropertyOptional({ type: [AssetSummaryDto] })
  @Type(() => AssetSummaryDto)
  assets!: AssetSummaryDto[];

  @ApiPropertyOptional({
    type: [BlogTableOfContentsItemDto],
    description: "Optional TOC generated from contentJson headings.",
  })
  @Type(() => BlogTableOfContentsItemDto)
  tableOfContents!: BlogTableOfContentsItemDto[];

  @ApiPropertyOptional({
    example: "<h2>Start with the product use case</h2><p>...</p>",
  })
  contentHtml!: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "ProseMirror/Tiptap JSON – source of truth for the editor.",
  })
  contentJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    example:
      "Start with the product use case. Define application and packaging clearly.",
  })
  contentText!: string | null;
}

export class BlogListResponseDto {
  @ApiProperty({ type: [BlogSummaryDto] })
  items!: BlogSummaryDto[];

  @ApiProperty({ example: 24 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
