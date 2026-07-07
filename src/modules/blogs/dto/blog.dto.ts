import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { BlogStatus } from "../entities/blog.entity";

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(v)) return true;
    if (["false", "0", "no", "n"].includes(v)) return false;
  }

  return undefined;
};

export class BlogAssetRefDto {
  @ApiProperty({ example: "asset-uuid" })
  @IsUUID()
  assetId!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class CreateBlogDto {
  @ApiProperty({ example: "Top 5 Benefits of Organic Cashew Nuts" })
  @IsString()
  @MaxLength(220)
  title!: string;

  @ApiPropertyOptional({
    example: "top-5-benefits-of-organic-cashew-nuts",
    description: "Optional custom slug. Auto-generated from title if omitted.",
  })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({
    example: "Discover the top benefits of organic cashew nuts for B2B buyers.",
  })
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiPropertyOptional({
    example: "<p>Full article content goes here...</p>",
  })
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/images/cashew-blog.jpg",
    description: "Legacy thumbnail URL. Prefer thumbnailAssetId.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    example: "asset-thumbnail-uuid",
    description: "Asset object stored in /api/media.",
  })
  @IsOptional()
  @IsUUID()
  thumbnailAssetId?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/images/cashew-blog-cover.jpg",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ example: "asset-cover-uuid" })
  @IsOptional()
  @IsUUID()
  coverImageAssetId?: string | null;

  @ApiPropertyOptional({ type: [BlogAssetRefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogAssetRefDto)
  assets?: BlogAssetRefDto[];

  @ApiPropertyOptional({
    example: "<h2>Start with the product use case</h2><p>...</p>",
    description: "Sanitized HTML for frontend render.",
  })
  @IsOptional()
  @IsString()
  contentHtml?: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "ProseMirror/Tiptap JSON – source of truth for the editor.",
  })
  @IsOptional()
  contentJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    example:
      "Start with the product use case. Define application and packaging clearly.",
    description: "Plain text for search/SEO/excerpt fallback.",
  })
  @IsOptional()
  @IsString()
  contentText?: string | null;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readTimeMinutes?: number | null;

  @ApiPropertyOptional({
    example: "Top 5 Benefits of Organic Cashew Nuts | Blog",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({
    example:
      "Learn about the health and business benefits of organic cashew nuts.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({ example: "organic cashew nuts benefits" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  focusKeyword?: string | null;

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBlogDto {
  @ApiPropertyOptional({ example: "Top 5 Benefits of Organic Cashew Nuts" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string;

  @ApiPropertyOptional({ example: "top-5-benefits-of-organic-cashew-nuts" })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({ example: "Discover the top benefits..." })
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiPropertyOptional({ example: "<h2>Updated content</h2><p>...</p>" })
  @IsOptional()
  @IsString()
  contentHtml?: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "ProseMirror/Tiptap JSON.",
  })
  @IsOptional()
  contentJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({ example: "Updated plain text content." })
  @IsOptional()
  @IsString()
  contentText?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/images/updated.jpg",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: "asset-thumbnail-uuid" })
  @IsOptional()
  @IsUUID()
  thumbnailAssetId?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/images/updated-cover.jpg",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ example: "asset-cover-uuid" })
  @IsOptional()
  @IsUUID()
  coverImageAssetId?: string | null;

  @ApiPropertyOptional({ type: [BlogAssetRefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogAssetRefDto)
  assets?: BlogAssetRefDto[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readTimeMinutes?: number | null;

  @ApiPropertyOptional({ example: "Updated SEO Title" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: "Updated meta description." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({ example: "cashew nuts" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  focusKeyword?: string | null;

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
