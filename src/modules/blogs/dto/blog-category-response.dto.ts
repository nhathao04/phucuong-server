import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BlogCategoryResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Export Guide" })
  name!: string;

  @ApiProperty({ example: "export-guide" })
  slug!: string;

  @ApiPropertyOptional({ example: "Notes about this category." })
  description!: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "2026-07-03T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-03T10:00:00.000Z" })
  updatedAt!: Date;
}
