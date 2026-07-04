import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ProductStatus } from "../entities/product.entity";

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "n"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return undefined;
};

export class ProductAttributeMappingInputDto {
  @ApiPropertyOptional({
    example: 12,
    description:
      "Attribute ID from product_attributes table. Use this or attributeCode.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  attributeId?: number;

  @ApiPropertyOptional({
    example: "coconut_size",
    description:
      "Attribute code from product_attributes table. Use this or attributeId.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  attributeCode?: string;

  @ApiPropertyOptional({
    example: 34,
    description: "Default option ID from product_attribute_options.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  defaultOptionId?: number | null;

  @ApiPropertyOptional({
    example: "Medium",
    description:
      "Default option value. If provided, API resolves option by attribute + value when defaultOptionId is not sent.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  defaultOptionValue?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    example: { allowCustom: false },
  })
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}

export class ProductContainerConfigInputDto {
  @ApiProperty({ example: "20FT", description: "Container code." })
  @IsString()
  @MaxLength(20)
  containerCode!: string;

  @ApiProperty({
    example: "20ft Dry Container",
    description: "Display name for container type.",
  })
  @IsString()
  @MaxLength(120)
  containerName!: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsNumber()
  capacityMt!: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: "Preferred for UAE market" })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class ProductCountryConfigInputDto {
  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440010",
    description: "Country ID from countries table. Use this or countryCode.",
  })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiPropertyOptional({
    example: "VN",
    description: "Country code from countries table. Use this or countryId.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryCode?: string;

  @ApiPropertyOptional({ example: "20" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  moqMt?: string | null;

  @ApiPropertyOptional({ example: "1 container" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  moqLabel?: string | null;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  leadTimeDays?: number | null;

  @ApiPropertyOptional({ example: "Organic Cashew Nuts for Vietnam" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({
    example: "Premium cashew nuts tailored for the Vietnam market.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({ example: "viet-nam/cashew-nuts" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  landingSlug?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductTradeTermInputDto {
  @ApiPropertyOptional({
    example: 1,
    description:
      "Trade term ID from trade_terms table. Use this or tradeTermCode.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tradeTermId?: number;

  @ApiPropertyOptional({
    example: "FOB",
    description: "Trade term code (FOB/CNF/CIF...). Use this or tradeTermId.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tradeTermCode?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductHeroInputDto {
  @ApiPropertyOptional({ example: "Premium Export Quality" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  eyebrow?: string | null;

  @ApiPropertyOptional({ example: "Whole Dried Coconut" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string | null;

  @ApiPropertyOptional({
    example: "Vietnamese coconut products prepared for international buyers.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string | null;

  @ApiPropertyOptional({
    type: "array",
    items: {
      type: "object",
      properties: {
        value: { type: "string" },
        label: { type: "string" },
      },
    },
  })
  @IsOptional()
  @IsArray()
  stats?: Array<{ value: string; label: string }>;
}

export class ProductImageRefDto {
  @ApiProperty({ example: "asset-uuid" })
  @IsUUID()
  assetId!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductTechnicalSpecificationInputDto {
  @ApiProperty({ example: "Origin" })
  @IsString()
  @MaxLength(255)
  label!: string;

  @ApiProperty({ example: "Ben Tre, Vietnam" })
  @IsString()
  @MaxLength(2000)
  value!: string;

  @ApiPropertyOptional({ example: "kg" })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  unit?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductPackagingOptionInputDto {
  @ApiProperty({ example: "Export Carton" })
  @IsString()
  @MaxLength(180)
  title!: string;

  @ApiPropertyOptional({ example: "Strong carton packaging for sea freight." })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    type: [String],
    example: ["Retail or bulk packing", "Palletized on request"],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(32)
  details?: string[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductTargetBuyerInputDto {
  @ApiProperty({ example: "Importers" })
  @IsString()
  @MaxLength(180)
  title!: string;

  @ApiPropertyOptional({ example: "Stable Vietnamese coconut supply." })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductWhyChooseUsInputDto {
  @ApiProperty({ example: "Reliable Export Coordination" })
  @IsString()
  @MaxLength(180)
  title!: string;

  @ApiPropertyOptional({
    example: "Clear production, documentation, and shipment planning.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductQuoteConfigFieldInputDto {
  @ApiProperty({ example: "quantity" })
  @IsString()
  @MaxLength(80)
  key!: string;

  @ApiProperty({ example: "Quantity" })
  @IsString()
  @MaxLength(180)
  label!: string;

  @ApiProperty({
    example: "number",
    enum: ["text", "number", "select", "textarea", "date"],
  })
  @IsString()
  @MaxLength(20)
  type!: "text" | "number" | "select" | "textarea" | "date";

  @ApiPropertyOptional({ example: "MT" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ type: "array" })
  @IsOptional()
  @IsArray()
  options?: Array<{ value: string; label: string }>;
}

export class ProductQuoteConfigInputDto {
  @ApiPropertyOptional({ example: "1 container" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  moq?: string | null;

  @ApiPropertyOptional({ type: [String], example: ["FOB", "CNF", "CIF"] })
  @IsOptional()
  @IsArray()
  tradeTerms?: string[];

  @ApiPropertyOptional({
    type: [ProductQuoteConfigFieldInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductQuoteConfigFieldInputDto)
  fields?: ProductQuoteConfigFieldInputDto[];
}

export class CreateProductDto {
  @ApiProperty({ example: "Organic Cashew Nuts" })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    example: "organic-cashew-nuts",
    description: "Optional custom slug. If omitted, it is generated from name.",
  })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({ example: "PC-DRIED-001" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productCode?: string | null;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productCategoryId?: number | null;

  @ApiPropertyOptional({
    example: "coconut-products",
    description: "Category slug if staff does not know the UUID.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  productCategorySlug?: string | null;

  @ApiPropertyOptional({
    example: "Coconut Products",
    description: "Category name if staff does not know the UUID or slug.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  productCategoryName?: string | null;

  @ApiPropertyOptional({ example: "Organic Cashew Nuts | Export Supplier" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({
    example: "Premium export quality cashew nuts for B2B buyers.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({ example: "organic cashew nuts" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  focusKeyword?: string | null;

  @ApiPropertyOptional({ example: "0801.32" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  hsCode?: string | null;

  @ApiPropertyOptional({ example: "Ben Tre, Vietnam" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  origin?: string | null;

  @ApiPropertyOptional({ example: "Cat Lai Port" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  exportPort?: string | null;

  @ApiPropertyOptional({ example: "12 months" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  shelfLife?: string | null;

  @ApiPropertyOptional({ example: "Store in a cool, dry place" })
  @IsOptional()
  @IsString()
  storageCondition?: string | null;

  @ApiPropertyOptional({ example: "Premium cashew nuts for export" })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: "Export-ready cashew nuts from Vietnam." })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  shortDescription?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: "Whether product is visible in staff/client flows",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  sampleAvailable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  labReportAvailable?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ["Export Ready", "FCL", "Certified"],
    description: "Small labels rendered on the product card.",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(16)
  @Transform(({ value }) => normalizeStringArray(value))
  badges?: string[];

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ""
      ? undefined
      : Number(value),
  )
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: ProductHeroInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductHeroInputDto)
  hero?: ProductHeroInputDto | null;

  @ApiPropertyOptional({ type: ProductQuoteConfigInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductQuoteConfigInputDto)
  quoteConfig?: ProductQuoteConfigInputDto | null;

  @ApiPropertyOptional({
    type: [ProductCountryConfigInputDto],
    description:
      "Country-specific MOQ, SEO title, landing slug, and lead time configs.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCountryConfigInputDto)
  countryConfigs?: ProductCountryConfigInputDto[];

  @ApiPropertyOptional({
    type: [ProductAttributeMappingInputDto],
    description: "Attribute mappings for this product.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeMappingInputDto)
  attributeMappings?: ProductAttributeMappingInputDto[];

  @ApiPropertyOptional({
    type: [ProductContainerConfigInputDto],
    description: "Container capacity configurations for this product.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductContainerConfigInputDto)
  containerConfigs?: ProductContainerConfigInputDto[];

  @ApiPropertyOptional({
    type: [ProductTradeTermInputDto],
    description: "Supported trade terms for this product.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTradeTermInputDto)
  tradeTerms?: ProductTradeTermInputDto[];

  @ApiPropertyOptional({
    type: [ProductTechnicalSpecificationInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTechnicalSpecificationInputDto)
  technicalSpecifications?: ProductTechnicalSpecificationInputDto[];

  @ApiPropertyOptional({ type: [ProductPackagingOptionInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPackagingOptionInputDto)
  packagingOptions?: ProductPackagingOptionInputDto[];

  @ApiPropertyOptional({ type: [ProductTargetBuyerInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTargetBuyerInputDto)
  targetBuyers?: ProductTargetBuyerInputDto[];

  @ApiPropertyOptional({ type: [ProductWhyChooseUsInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductWhyChooseUsInputDto)
  whyChooseUs?: ProductWhyChooseUsInputDto[];

  @ApiPropertyOptional({ type: [ProductImageRefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageRefDto)
  images?: ProductImageRefDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: "Organic Cashew Nuts" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: "PC-DRIED-001" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productCode?: string | null;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productCategoryId?: number | null;

  @ApiPropertyOptional({ example: "coconut-products" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  productCategorySlug?: string | null;

  @ApiPropertyOptional({ example: "Coconut Products" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  productCategoryName?: string | null;

  @ApiPropertyOptional({ example: "Organic Cashew Nuts | Export Supplier" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  seoTitle?: string | null;

  @ApiPropertyOptional({
    example: "Premium export quality cashew nuts for B2B buyers.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @ApiPropertyOptional({ example: "organic cashew nuts" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  focusKeyword?: string | null;

  @ApiPropertyOptional({ example: "0801.32" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  hsCode?: string | null;

  @ApiPropertyOptional({ example: "Ben Tre, Vietnam" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  origin?: string | null;

  @ApiPropertyOptional({ example: "Cat Lai Port" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  exportPort?: string | null;

  @ApiPropertyOptional({ example: "12 months" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  shelfLife?: string | null;

  @ApiPropertyOptional({ example: "Store in a cool, dry place" })
  @IsOptional()
  @IsString()
  storageCondition?: string | null;

  @ApiPropertyOptional({ example: "organic-cashew-nuts" })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({ example: "Premium cashew nuts for export" })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: "Export-ready cashew nuts from Vietnam." })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  shortDescription?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  sampleAvailable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  labReportAvailable?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ["Export Ready", "FCL", "Certified"],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(16)
  @Transform(({ value }) => normalizeStringArray(value))
  badges?: string[];

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ""
      ? undefined
      : Number(value),
  )
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: ProductHeroInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductHeroInputDto)
  hero?: ProductHeroInputDto | null;

  @ApiPropertyOptional({ type: ProductQuoteConfigInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductQuoteConfigInputDto)
  quoteConfig?: ProductQuoteConfigInputDto | null;

  @ApiPropertyOptional({
    type: [ProductCountryConfigInputDto],
    description:
      "Replace country-specific configs for this product. Send empty array to clear country configs.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCountryConfigInputDto)
  countryConfigs?: ProductCountryConfigInputDto[];

  @ApiPropertyOptional({
    type: [ProductAttributeMappingInputDto],
    description:
      "Replace attribute mappings for this product. Send empty array to clear mappings.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeMappingInputDto)
  attributeMappings?: ProductAttributeMappingInputDto[];

  @ApiPropertyOptional({
    type: [ProductContainerConfigInputDto],
    description:
      "Replace container configs for this product. Send empty array to clear configs.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductContainerConfigInputDto)
  containerConfigs?: ProductContainerConfigInputDto[];

  @ApiPropertyOptional({
    type: [ProductTradeTermInputDto],
    description:
      "Replace trade terms for this product. Send empty array to clear trade terms.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTradeTermInputDto)
  tradeTerms?: ProductTradeTermInputDto[];

  @ApiPropertyOptional({
    type: [ProductTechnicalSpecificationInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTechnicalSpecificationInputDto)
  technicalSpecifications?: ProductTechnicalSpecificationInputDto[];

  @ApiPropertyOptional({
    type: [ProductPackagingOptionInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPackagingOptionInputDto)
  packagingOptions?: ProductPackagingOptionInputDto[];

  @ApiPropertyOptional({
    type: [ProductTargetBuyerInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTargetBuyerInputDto)
  targetBuyers?: ProductTargetBuyerInputDto[];

  @ApiPropertyOptional({
    type: [ProductWhyChooseUsInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductWhyChooseUsInputDto)
  whyChooseUs?: ProductWhyChooseUsInputDto[];

  @ApiPropertyOptional({ type: [ProductImageRefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageRefDto)
  images?: ProductImageRefDto[];
}

export const CREATE_PRODUCT_SWAGGER_EXAMPLE: CreateProductDto = {
  name: "Whole Dried Coconut",
  slug: "whole-dried-coconut",
  productCode: "PC-WDC-001",
  productCategorySlug: "coconut-products",
  seoTitle: "Whole Dried Coconut Export Supplier",
  metaDescription:
    "Premium whole dried coconut from Vietnam for B2B importers.",
  focusKeyword: "whole dried coconut",
  description: "Export-grade whole dried coconut for wholesale markets.",
  shortDescription: "Export-ready whole dried coconut from Vietnam.",
  hsCode: "0801.19",
  origin: "Ben Tre, Vietnam",
  exportPort: "Cat Lai Port",
  shelfLife: "12 months",
  storageCondition: "Store in dry and cool place",
  badges: ["Export Ready", "FCL", "Certified"],
  isActive: true,
  sampleAvailable: true,
  labReportAvailable: false,
  status: ProductStatus.PUBLISHED,
  sortOrder: 1,
  isFeatured: true,
  hero: {
    eyebrow: "Premium Export Quality",
    title: "Whole Dried Coconut",
    subtitle: "Vietnamese coconut products prepared for international buyers.",
    stats: [
      { value: "10+", label: "Years export" },
      { value: "30+", label: "Export markets" },
      { value: "FCL", label: "Shipment ready" },
    ],
  },
  quoteConfig: {
    moq: "1 container",
    tradeTerms: ["FOB", "CNF", "CIF"],
    fields: [
      { key: "quantity", label: "Quantity", type: "number", unit: "MT", required: true },
      { key: "destinationPort", label: "Destination Port", type: "text", required: true },
    ],
  },
  technicalSpecifications: [
    { label: "Origin", value: "Ben Tre, Vietnam", sortOrder: 0 },
    { label: "HS Code", value: "0801.19", sortOrder: 1 },
  ],
  packagingOptions: [
    {
      title: "Export Carton",
      description: "Strong carton packaging for sea freight.",
      details: ["Retail or bulk packing", "Palletized on request"],
      sortOrder: 0,
    },
  ],
  targetBuyers: [
    { title: "Importers", description: "Stable Vietnamese coconut supply.", sortOrder: 0 },
  ],
  whyChooseUs: [
    {
      title: "Reliable Export Coordination",
      description: "Clear production, documentation, and shipment planning.",
      sortOrder: 0,
    },
  ],
  containerConfigs: [
    {
      containerCode: "20FT",
      containerName: "20ft Dry Container",
      capacityMt: 12,
      isDefault: true,
    },
    {
      containerCode: "40HQ",
      containerName: "40ft High Cube",
      capacityMt: 28.5,
      isDefault: false,
    },
  ],
  tradeTerms: [
    { tradeTermCode: "FOB", isDefault: true, sortOrder: 1 },
    { tradeTermCode: "CNF", isDefault: false, sortOrder: 2 },
    { tradeTermCode: "CIF", isDefault: false, sortOrder: 3 },
  ],
};

export const UPDATE_PRODUCT_REPLACE_CONFIGS_SWAGGER_EXAMPLE: UpdateProductDto =
  {
    seoTitle: "Whole Dried Coconut Export Supplier - Updated",
    metaDescription: "Updated SEO content for campaign Q3.",
    sortOrder: 2,
    isFeatured: true,
    badges: ["Export Ready", "FCL"],
    countryConfigs: [
      {
        countryCode: "VN",
        moqMt: "18",
        moqLabel: "1 container",
        leadTimeDays: 12,
        seoTitle: "Whole Dried Coconut for Vietnam",
        metaDescription: "Localized landing page for Vietnam market.",
        landingSlug: "viet-nam/whole-dried-coconut",
        isActive: true,
        sortOrder: 1,
      },
    ],
    attributeMappings: [
      {
        attributeCode: "coconut_size",
        defaultOptionValue: "Large",
        required: true,
        sortOrder: 1,
      },
      {
        attributeCode: "packaging",
        defaultOptionValue: "PP Bag",
        required: false,
        sortOrder: 2,
        metadata: { allowCustom: true },
      },
    ],
    containerConfigs: [
      {
        containerCode: "20FT",
        containerName: "20ft Dry Container",
        capacityMt: 12,
        isDefault: true,
      },
      {
        containerCode: "40HQ",
        containerName: "40ft High Cube",
        capacityMt: 28.5,
        isDefault: false,
      },
    ],
    tradeTerms: [
      { tradeTermCode: "FOB", isDefault: true, sortOrder: 1 },
      { tradeTermCode: "CIF", isDefault: false, sortOrder: 2 },
    ],
  };

export const UPDATE_PRODUCT_PARTIAL_SWAGGER_EXAMPLE: UpdateProductDto = {
  description: "Updated product content only.",
  isActive: true,
  status: ProductStatus.PUBLISHED,
};
