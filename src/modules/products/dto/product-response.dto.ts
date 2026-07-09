import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";
import { ProductStatus } from "../entities/product.entity";
import {
  ProductAttributeGroup,
  ProductAttributeType,
} from "../entities/product-attribute.entity";

export class ProductAttributeValueSummaryDto {
  @ApiProperty({ example: "origin" })
  code!: string;

  @ApiProperty({ example: "Origin" })
  name!: string;

  @ApiProperty({ enum: ProductAttributeGroup })
  groupKey!: ProductAttributeGroup;

  @ApiPropertyOptional({ example: "Ben Tre, Vietnam" })
  value!: string | null;

  @ApiPropertyOptional({
    example: "*Shelf life depends on proper storage...",
  })
  footnote!: string | null;
}

export class ProductAttributeValueResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 12 })
  attributeId!: number;

  @ApiProperty({ example: "shell_color" })
  code!: string;

  @ApiProperty({ example: "Shell color" })
  name!: string;

  @ApiProperty({ enum: ProductAttributeGroup })
  groupKey!: ProductAttributeGroup;

  @ApiProperty({ enum: ProductAttributeType })
  type!: ProductAttributeType;

  @ApiPropertyOptional({ example: "Product Overview" })
  sectionLabel!: string | null;

  @ApiPropertyOptional({ example: "Natural brown, fibrous" })
  value!: string | null;

  @ApiPropertyOptional({ example: "28.5" })
  valueNumber!: string | null;

  @ApiPropertyOptional({ example: "tonnes" })
  unit!: string | null;

  @ApiPropertyOptional({
    example: "*Shelf life depends on proper storage...",
  })
  footnote!: string | null;

  @ApiProperty({ example: false })
  required!: boolean;

  @ApiProperty({ example: 1 })
  sortOrder!: number;
}

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

export class ProductCategorySummaryDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: "Coconut Products" })
  name!: string;

  @ApiProperty({ example: "coconut-products" })
  slug!: string;
}

export class ProductCountrySummaryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440010" })
  id!: string;

  @ApiProperty({ example: "VN" })
  code!: string;

  @ApiProperty({ example: "Vietnam" })
  name!: string;
}

export class ProductCountryConfigSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: ProductCountrySummaryDto })
  country!: ProductCountrySummaryDto;

  @ApiPropertyOptional({ example: "20" })
  moqMt!: string | null;

  @ApiPropertyOptional({ example: "1 container" })
  moqLabel!: string | null;

  @ApiPropertyOptional({ example: 14 })
  leadTimeDays!: number | null;

  @ApiPropertyOptional({ example: "Organic Cashew Nuts for Vietnam" })
  seoTitle!: string | null;

  @ApiPropertyOptional({
    example: "Premium cashew nuts tailored for the Vietnam market.",
  })
  metaDescription!: string | null;

  @ApiPropertyOptional({ example: "viet-nam/cashew-nuts" })
  landingSlug!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;
}

export class ProductAttributeMappingSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 12 })
  attributeId!: number;

  @ApiPropertyOptional({ example: "coconut_size" })
  attributeCode!: string | null;

  @ApiPropertyOptional({ example: "Coconut Size" })
  attributeName!: string | null;

  @ApiPropertyOptional({ example: 34 })
  defaultOptionId!: number | null;

  @ApiPropertyOptional({ example: "Medium" })
  defaultOptionValue!: string | null;

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiProperty({
    example: true,
    description: "Whether this attribute is shown on the inquiry form.",
  })
  isInquiryField!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
  })
  metadata!: Record<string, unknown> | null;
}

export class ProductContainerConfigSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

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
  @ApiProperty({ example: 1 })
  id!: number;

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

export class ProductHeroStatDto {
  @ApiProperty({ example: "10+" })
  value!: string;

  @ApiProperty({ example: "Years export" })
  label!: string;
}

export class ProductHeroDto {
  @ApiPropertyOptional({ example: "Premium Export Quality" })
  eyebrow!: string | null;

  @ApiPropertyOptional({ example: "Whole Dried Coconut" })
  title!: string | null;

  @ApiPropertyOptional({
    example: "Vietnamese coconut products prepared for international buyers.",
  })
  subtitle!: string | null;

  @ApiPropertyOptional({ type: [ProductHeroStatDto] })
  @Type(() => ProductHeroStatDto)
  stats!: ProductHeroStatDto[];
}

export class ProductTechnicalSpecificationDto {
  @ApiProperty({ example: "Origin" })
  label!: string;

  @ApiProperty({ example: "Ben Tre, Vietnam" })
  value!: string;

  @ApiPropertyOptional({ example: "kg" })
  unit!: string | null;
}

export class ProductPackagingOptionDto {
  @ApiProperty({ example: "Export Carton" })
  title!: string;

  @ApiPropertyOptional({ example: "Strong carton packaging for sea freight." })
  description!: string | null;

  @ApiProperty({
    type: [String],
    example: ["Retail or bulk packing", "Palletized on request"],
  })
  details!: string[];
}

export class ProductTargetBuyerDto {
  @ApiProperty({ example: "Importers" })
  title!: string;

  @ApiPropertyOptional({ example: "Stable Vietnamese coconut supply." })
  description!: string | null;
}

export class ProductWhyChooseUsDto {
  @ApiProperty({ example: "Reliable Export Coordination" })
  title!: string;

  @ApiPropertyOptional({
    example: "Clear production, documentation, and shipment planning.",
  })
  description!: string | null;
}

export class ProductFaqSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "What is the MOQ?" })
  question!: string;

  @ApiProperty({ example: "The typical MOQ is 1 container." })
  answer!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;
}

export class ProductCertificateSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "ISO 9001:2015" })
  name!: string;

  @ApiPropertyOptional({ example: "available" })
  status!: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/certificates/iso-9001.pdf",
  })
  fileUrl!: string | null;
}

export class ProductQuoteConfigFieldDto {
  @ApiProperty({ example: "quantity" })
  key!: string;

  @ApiProperty({ example: "Quantity" })
  label!: string;

  @ApiProperty({ example: "number", enum: ["text", "number", "select", "textarea", "date"] })
  type!: "text" | "number" | "select" | "textarea" | "date";

  @ApiPropertyOptional({ example: "MT" })
  unit!: string | null;

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiPropertyOptional({
    type: "array",
    items: { type: "object" },
  })
  options!: Array<{ value: string; label: string }>;
}

export class ProductQuoteConfigDto {
  @ApiPropertyOptional({ example: "1 container" })
  moq!: string | null;

  @ApiProperty({ type: [String], example: ["FOB", "CNF", "CIF"] })
  tradeTerms!: string[];

  @ApiProperty({ type: [ProductQuoteConfigFieldDto] })
  @Type(() => ProductQuoteConfigFieldDto)
  fields!: ProductQuoteConfigFieldDto[];
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

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productCategoryId!: number | null;

  @ApiPropertyOptional({ type: ProductCategorySummaryDto })
  productCategory!: ProductCategorySummaryDto | null;

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

  @ApiPropertyOptional({ example: "Export-ready cashew nuts from Vietnam." })
  shortDescription!: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/products/cashew-thumb.webp",
  })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/products/cashew-hero.webp",
  })
  imageUrl!: string | null;

  @ApiPropertyOptional({
    type: [String],
    example: ["Export Ready", "FCL"],
  })
  badges!: string[];

  @ApiProperty({ type: [AssetSummaryDto] })
  @Type(() => AssetSummaryDto)
  images!: AssetSummaryDto[];

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: false })
  isFeatured!: boolean;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.PUBLISHED })
  status!: ProductStatus;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  updatedAt!: Date;
}

export class ProductListItemDto extends ProductSummaryDto {
  @ApiProperty({ type: [ProductCountryConfigSummaryDto] })
  countryConfigs!: ProductCountryConfigSummaryDto[];

  @ApiProperty({
    type: "object",
    description:
      "Attribute values grouped by groupKey (specifications / packing / ...). Only essential fields: code, name, groupKey, value, footnote.",
    additionalProperties: true,
  })
  attributeGrouped!: {
    [key in ProductAttributeGroup]?: ProductAttributeValueSummaryDto[];
  };
}

export class ProductDetailDto extends ProductSummaryDto {
  @ApiProperty({ type: [ProductCountryConfigSummaryDto] })
  countryConfigs!: ProductCountryConfigSummaryDto[];

  @ApiProperty({
    type: "object",
    description:
      "Attribute values grouped by groupKey (specifications / packing / ...).",
    additionalProperties: true,
  })
  attributeGrouped!: {
    [key in ProductAttributeGroup]?: ProductAttributeValueResponseDto[];
  };

  @ApiProperty({ type: [ProductAttributeMappingSummaryDto] })
  attributeMappings!: ProductAttributeMappingSummaryDto[];

  @ApiProperty({ type: [ProductContainerConfigSummaryDto] })
  containerConfigs!: ProductContainerConfigSummaryDto[];

  @ApiProperty({ type: [ProductTradeTermSummaryDto] })
  tradeTerms!: ProductTradeTermSummaryDto[];

  @ApiProperty({ type: ProductHeroDto })
  @Type(() => ProductHeroDto)
  hero!: ProductHeroDto | null;

  @ApiProperty({ type: [ProductTechnicalSpecificationDto] })
  @Type(() => ProductTechnicalSpecificationDto)
  technicalSpecifications!: ProductTechnicalSpecificationDto[];

  @ApiProperty({ type: [ProductPackagingOptionDto] })
  @Type(() => ProductPackagingOptionDto)
  packagingOptions!: ProductPackagingOptionDto[];

  @ApiProperty({ type: [ProductTargetBuyerDto] })
  @Type(() => ProductTargetBuyerDto)
  targetBuyers!: ProductTargetBuyerDto[];

  @ApiProperty({ type: [ProductWhyChooseUsDto] })
  @Type(() => ProductWhyChooseUsDto)
  whyChooseUs!: ProductWhyChooseUsDto[];

  @ApiProperty({ type: [ProductFaqSummaryDto] })
  faqs!: ProductFaqSummaryDto[];

  @ApiProperty({ type: [ProductCertificateSummaryDto] })
  certificates!: ProductCertificateSummaryDto[];

  @ApiProperty({ type: ProductQuoteConfigDto })
  @Type(() => ProductQuoteConfigDto)
  quoteConfig!: ProductQuoteConfigDto | null;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductListItemDto] })
  items!: ProductListItemDto[];

  @ApiProperty({ example: 24 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inquiry Order Config — bundles everything FE needs for Step 2 / Step 3 form.
// Returned by GET /products/:identifier/order-config and the staff equivalent.
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryOrderAttributeOptionDto {
  @ApiProperty({ example: 34 })
  id!: number;

  @ApiProperty({ example: "Medium" })
  value!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({
    example: false,
    description:
      "When true, picking this option reveals a free-form input on the FE — the buyer types their own value (sent to server as customValue alongside optionId).",
  })
  isCustomTrigger!: boolean;

  @ApiPropertyOptional({
    example: "Describe your preferred size (e.g. 14 cm)",
    description: "Placeholder text shown in the free-form input next to the Custom option.",
  })
  customPlaceholder!: string | null;
}

export class InquiryOrderAttributeMappingDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 12 })
  attributeId!: number;

  @ApiProperty({ example: "coconut_size" })
  code!: string;

  @ApiProperty({ example: "Coconut Size" })
  name!: string;

  @ApiProperty({
    enum: ProductAttributeGroup,
    description:
      "Use groupKey to group mappings into 'specifications' / 'packing' / etc. on the inquiry form.",
  })
  groupKey!: ProductAttributeGroup;

  @ApiProperty({ enum: ProductAttributeType })
  type!: ProductAttributeType;

  @ApiPropertyOptional({ example: "cm" })
  unit!: string | null;

  @ApiPropertyOptional({ example: "Medium" })
  defaultValue!: string | null;

  @ApiPropertyOptional({ example: "Choose size" })
  placeholder!: string | null;

  @ApiPropertyOptional()
  footnote!: string | null;

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiProperty({
    example: true,
    description:
      "When false, this attribute is hidden from the inquiry form (used only for catalog/listing). When true, FE renders the field in Step 2.",
  })
  isInquiryField!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiPropertyOptional({ example: 34 })
  defaultOptionId!: number | null;

  @ApiProperty({
    type: [InquiryOrderAttributeOptionDto],
    description: "All available options (for select-type attributes).",
  })
  @Type(() => InquiryOrderAttributeOptionDto)
  options!: InquiryOrderAttributeOptionDto[];
}

export class InquiryOrderContainerConfigDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "40HQ" })
  containerCode!: string;

  @ApiProperty({ example: "40' High Cube Dry Container" })
  containerName!: string;

  @ApiProperty({ example: "28.50" })
  capacityMt!: string;

  @ApiProperty({ example: true })
  isDefault!: boolean;
}

export class InquiryOrderCountryConfigDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440010" })
  countryId!: string;

  @ApiProperty({ example: "VN" })
  countryCode!: string;

  @ApiProperty({ example: "Vietnam" })
  countryName!: string;

  @ApiPropertyOptional({ example: "20" })
  moqMt!: string | null;

  @ApiPropertyOptional({ example: "1 x 40HQ" })
  moqLabel!: string | null;

  @ApiPropertyOptional({ example: 14 })
  leadTimeDays!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class InquiryOrderTradeTermDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "FOB" })
  code!: string;

  @ApiProperty({ example: "Free On Board" })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isDefault!: boolean;
}

export class ProductOrderConfigDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  productId!: string;

  @ApiProperty({ example: "Whole Dried Coconut" })
  productName!: string;

  @ApiProperty({ example: "whole-dried-coconut" })
  productSlug!: string;

  @ApiProperty({ example: "PC-DRIED-001" })
  productCode!: string | null;

  @ApiProperty({
    type: [InquiryOrderAttributeMappingDto],
    description:
      "Product-specific order attributes with full option lists. FE renders them in Step 2 grouped by groupKey.",
  })
  attributeMappings!: InquiryOrderAttributeMappingDto[];

  @ApiProperty({
    type: [InquiryOrderContainerConfigDto],
    description: "Container capacities used by the Container Qty auto-calculator.",
  })
  containerConfigs!: InquiryOrderContainerConfigDto[];

  @ApiProperty({
    type: [InquiryOrderCountryConfigDto],
    description:
      "Per-country MOQ + lead time. FE forwards destinationCountryId so the server can resolve MOQ in Step 2.",
  })
  countryConfigs!: InquiryOrderCountryConfigDto[];

  @ApiProperty({
    type: [InquiryOrderTradeTermDto],
    description: "Trade terms selectable in Step 3 (FOB / CNF / CIF …).",
  })
  tradeTerms!: InquiryOrderTradeTermDto[];
}
