import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BlogStatus } from "../entities/blog.entity";

export class BlogAuthorDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Nguyen Van A" })
  fullName!: string;
}

export class BlogSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Top 5 Benefits of Organic Cashew Nuts" })
  title!: string;

  @ApiProperty({ example: "top-5-benefits-of-organic-cashew-nuts" })
  slug!: string;

  @ApiPropertyOptional({
    example: "Discover the top benefits of organic cashew nuts for B2B buyers.",
  })
  excerpt!: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/images/cashew-blog.jpg",
  })
  thumbnailUrl!: string | null;

  @ApiProperty({ enum: BlogStatus, example: BlogStatus.DRAFT })
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

  @ApiProperty({ example: "2026-07-03T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-03T10:00:00.000Z" })
  updatedAt!: Date;
}

export class BlogDetailDto extends BlogSummaryDto {
  @ApiPropertyOptional({ example: "<p>Full article content...</p>" })
  content!: string | null;

  @ApiPropertyOptional({
    example: "Top 5 Benefits of Organic Cashew Nuts | Blog",
  })
  seoTitle!: string | null;

  @ApiPropertyOptional({
    example:
      "Learn about the health and business benefits of organic cashew nuts.",
  })
  metaDescription!: string | null;

  @ApiPropertyOptional({ example: "organic cashew nuts benefits" })
  focusKeyword!: string | null;
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
