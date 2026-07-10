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
  @ApiPropertyOptional({
    description: "Asset UUID (if image was previously uploaded via media API)",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: "string",
    format: "uuid",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({
    description:
      "Cloudinary URL of the image. Asset will be auto-created in database.",
    example: "https://cdn.example.com/blog/export-flow.webp",
    type: "string",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: "Alt text for the image (for SEO and accessibility).",
    example: "Coconut export flow",
    type: "string",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @ApiPropertyOptional({
    description: "Caption text displayed below the image.",
    example: "Example export flow.",
    type: "string",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional({
    description: "Display order (lower numbers appear first).",
    example: 0,
    type: "integer",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class CreateBlogDto {
  @ApiProperty({
    example: "Export Guide for Coconut Product Buyers",
    description: "Blog post title",
  })
  @IsString()
  @MaxLength(220)
  title!: string;

  @ApiPropertyOptional({
    example: "export-guide-for-coconut-product-buyers",
    description: "Optional custom slug. Auto-generated from title if omitted.",
  })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({
    example:
      "https://cdn.example.com/blog/export-guide-thumb.webp",
    description:
      "Thumbnail image URL. Asset will be auto-created in database.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Asset UUID (alternative to thumbnailUrl).",
  })
  @IsOptional()
  @IsUUID()
  thumbnailAssetId?: string | null;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "Cover image Asset UUID.",
  })
  @IsOptional()
  @IsUUID()
  coverImageAssetId?: string | null;

  @ApiPropertyOptional({
    description:
      "Inline images used in the article content. URLs will be auto-created as assets.",
    type: [BlogAssetRefDto],
    example: [
      {
        url: "https://cdn.example.com/blog/export-flow.webp",
        alt: "Coconut export flow",
        caption: "Example export flow.",
        sortOrder: 0,
      },
      {
        url: "https://cdn.example.com/blog/packaging.webp",
        alt: "Product packaging",
        caption: "Packaging options.",
        sortOrder: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogAssetRefDto)
  assets?: BlogAssetRefDto[];

  @ApiPropertyOptional({
    example:
      "<h2>Start with the product use case</h2><p>Define application, grade, packaging, monthly volume, and destination market.</p><figure><img src=\"https://cdn.example.com/blog/export-flow.webp\" alt=\"Coconut export flow\"></figure>",
    description: "Sanitized HTML for frontend render.",
  })
  @IsOptional()
  @IsString()
  contentHtml?: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description:
      "ProseMirror/Tiptap JSON – source of truth for the editor.",
    example: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Start with the product use case" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Define application, grade, packaging clearly.",
              marks: [{ type: "bold" }],
            },
          ],
        },
        {
          type: "image",
          attrs: {
            src: "https://cdn.example.com/blog/export-flow.webp",
            alt: "Coconut export flow",
            caption: "Example export flow.",
            align: "center",
          },
        },
      ],
    },
  })
  @IsOptional()
  contentJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    example:
      "Start with the product use case. Define application, grade, packaging, monthly volume, and destination market.",
    description: "Plain text for search/SEO/excerpt fallback.",
  })
  @IsOptional()
  @IsString()
  contentText?: string | null;

  @ApiPropertyOptional({
    example: "Export Guide for Coconut Product Buyers",
    description: "SEO title (defaults to blog title if not provided).",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({
    example:
      "Learn how to prepare coconut product inquiries and shipment plans.",
    description: "Meta description for SEO.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({
    example: "coconut product export guide",
    description: "Primary keyword for SEO.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  focusKeyword?: string | null;

  @ApiPropertyOptional({
    enum: BlogStatus,
    example: BlogStatus.DRAFT,
    description: "Blog status. Defaults to DRAFT.",
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    example: false,
    description: "Featured blog flag.",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateBlogDto {
  @ApiPropertyOptional({
    example: "Export Guide for Coconut Product Buyers",
    description: "Updated blog post title.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string;

  @ApiPropertyOptional({
    example: "export-guide-for-coconut-product-buyers",
    description: "Custom slug.",
  })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({
    example:
      "<h2>Updated content</h2><p>New content goes here...</p>",
    description: "Updated HTML content.",
  })
  @IsOptional()
  @IsString()
  contentHtml?: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "ProseMirror/Tiptap JSON.",
    example: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Updated paragraph content." }],
        },
      ],
    },
  })
  @IsOptional()
  contentJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    example: "Updated plain text content for search.",
  })
  @IsOptional()
  @IsString()
  contentText?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/blog/new-thumbnail.webp",
    description: "New thumbnail URL. Asset will be auto-created.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Thumbnail Asset UUID.",
  })
  @IsOptional()
  @IsUUID()
  thumbnailAssetId?: string | null;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "Cover image Asset UUID.",
  })
  @IsOptional()
  @IsUUID()
  coverImageAssetId?: string | null;

  @ApiPropertyOptional({
    description: "Inline images. URLs will be auto-created as assets.",
    type: [BlogAssetRefDto],
    example: [
      {
        url: "https://cdn.example.com/blog/new-image.webp",
        alt: "New image alt",
        sortOrder: 0,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogAssetRefDto)
  assets?: BlogAssetRefDto[];

  @ApiPropertyOptional({
    example: "Updated SEO Title",
    description: "SEO title.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({
    example: "Updated meta description for SEO.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({
    example: "updated focus keyword",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  focusKeyword?: string | null;

  @ApiPropertyOptional({
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
    description: "Blog status. Set to PUBLISHED to publish.",
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    example: true,
    description: "Featured flag.",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;
}
