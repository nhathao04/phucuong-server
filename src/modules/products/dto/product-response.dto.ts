import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProductSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Organic Cashew Nuts" })
  name!: string;

  @ApiProperty({ example: "organic-cashew-nuts" })
  slug!: string;

  @ApiPropertyOptional({ example: "Premium cashew nuts for export" })
  description!: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/products/cashew.jpg",
  })
  image!: string | null;

  @ApiPropertyOptional({ example: "20kg" })
  containerCapacity!: string | null;

  @ApiPropertyOptional({ example: "20FT" })
  containerType!: string | null;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  updatedAt!: Date;
}

export class ProductDetailDto extends ProductSummaryDto {
  @ApiPropertyOptional({ example: "Full specification content" })
  specification!: string | null;

  @ApiPropertyOptional({ example: "Packing details content" })
  packing!: string | null;

  @ApiPropertyOptional({ example: "Applications content" })
  applications!: string | null;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    example: {
      brochure: "https://cdn.example.com/documents/brochure.pdf",
    },
  })
  documents!: Record<string, unknown> | null;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductSummaryDto] })
  items!: ProductSummaryDto[];

  @ApiProperty({ example: 24 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
