import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProductStatus } from "../entities/product.entity";

export class ProductAttributeMappingSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440001" })
  attributeId!: string;

  @ApiPropertyOptional({ example: "coconut_size" })
  attributeCode!: string | null;

  @ApiPropertyOptional({ example: "Coconut Size" })
  attributeName!: string | null;

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440002" })
  defaultOptionId!: string | null;

  @ApiPropertyOptional({ example: "Medium" })
  defaultOptionValue!: string | null;

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
  })
  metadata!: Record<string, unknown> | null;
}

export class ProductContainerConfigSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "20FT" })
  containerCode!: string;

  @ApiProperty({ example: "20ft Dry Container" })
  containerName!: string;

  @ApiProperty({ example: "12.00" })
  capacityMt!: string;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiPropertyOptional({ example: "Preferred for UAE market" })
  notes!: string | null;
}

export class ProductTradeTermSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: 1 })
  tradeTermId!: number;

  @ApiProperty({ example: "FOB" })
  code!: string;

  @ApiProperty({ example: "Free On Board" })
  name!: string;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;
}

export class ProductSummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Organic Cashew Nuts" })
  name!: string;

  @ApiProperty({ example: "organic-cashew-nuts" })
  slug!: string;

  @ApiPropertyOptional({ example: "PC-DRIED-001" })
  productCode!: string | null;

  @ApiPropertyOptional({ example: "category-uuid" })
  productCategoryId!: string | null;

  @ApiPropertyOptional({ example: "Organic Cashew Nuts | Export Supplier" })
  seoTitle!: string | null;

  @ApiPropertyOptional({
    example: "Premium export quality cashew nuts for B2B buyers.",
  })
  metaDescription!: string | null;

  @ApiPropertyOptional({ example: "organic cashew nuts" })
  focusKeyword!: string | null;

  @ApiPropertyOptional({
    example: "Premium cashew nuts for export",
  })
  description!: string | null;

  @ApiPropertyOptional({ example: "draft", enum: ProductStatus })
  status!: ProductStatus;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: false })
  isFeatured!: boolean;

  @ApiPropertyOptional({ example: "0801.32" })
  hsCode!: string | null;

  @ApiPropertyOptional({ example: "Ben Tre, Vietnam" })
  origin!: string | null;

  @ApiPropertyOptional({ example: "Cat Lai Port" })
  exportPort!: string | null;

  @ApiPropertyOptional({ example: "12 months" })
  shelfLife!: string | null;

  @ApiPropertyOptional({ example: "Store in a cool, dry place" })
  storageCondition!: string | null;

  @ApiProperty({ example: false })
  sampleAvailable!: boolean;

  @ApiProperty({ example: false })
  labReportAvailable!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  updatedAt!: Date;
}

export class ProductDetailDto extends ProductSummaryDto {
  @ApiProperty({ type: [ProductAttributeMappingSummaryDto] })
  attributeMappings!: ProductAttributeMappingSummaryDto[];

  @ApiProperty({ type: [ProductContainerConfigSummaryDto] })
  containerConfigs!: ProductContainerConfigSummaryDto[];

  @ApiProperty({ type: [ProductTradeTermSummaryDto] })
  tradeTerms!: ProductTradeTermSummaryDto[];
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
