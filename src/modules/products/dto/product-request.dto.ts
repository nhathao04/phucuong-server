import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Matches,
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

export class ProductAttributeMappingInputDto {
  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description:
      "Attribute ID from product_attributes table. Use this or attributeCode.",
  })
  @IsOptional()
  @IsUUID()
  attributeId?: string;

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
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "Default option ID from product_attribute_options.",
  })
  @IsOptional()
  @IsUUID()
  defaultOptionId?: string | null;

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

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  productCategoryId?: string | null;

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

  @ApiPropertyOptional({
    type: [ProductCountryConfigInputDto],
    description:
      "Country-specific MOQ, SEO title, landing slug, and lead time configs.",
    example: [
      {
        countryCode: "VN",
        moqMt: "20",
        moqLabel: "1 container",
        leadTimeDays: 14,
        seoTitle: "Organic Cashew Nuts for Vietnam",
        metaDescription: "Premium cashew nuts tailored for the Vietnam market.",
        landingSlug: "viet-nam/cashew-nuts",
        isActive: true,
        sortOrder: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCountryConfigInputDto)
  countryConfigs?: ProductCountryConfigInputDto[];

  @ApiPropertyOptional({
    type: [ProductAttributeMappingInputDto],
    description: "Attribute mappings for this product.",
    example: [
      {
        attributeCode: "coconut_size",
        defaultOptionValue: "Medium",
        required: true,
        sortOrder: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeMappingInputDto)
  attributeMappings?: ProductAttributeMappingInputDto[];

  @ApiPropertyOptional({
    type: [ProductContainerConfigInputDto],
    description: "Container capacity configurations for this product.",
    example: [
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
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductContainerConfigInputDto)
  containerConfigs?: ProductContainerConfigInputDto[];

  @ApiPropertyOptional({
    type: [ProductTradeTermInputDto],
    description: "Supported trade terms for this product.",
    example: [
      { tradeTermCode: "FOB", isDefault: true, sortOrder: 1 },
      { tradeTermCode: "CNF", isDefault: false, sortOrder: 2 },
      { tradeTermCode: "CIF", isDefault: false, sortOrder: 3 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTradeTermInputDto)
  tradeTerms?: ProductTradeTermInputDto[];
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

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  productCategoryId?: string | null;

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
  hsCode: "0801.19",
  origin: "Ben Tre, Vietnam",
  exportPort: "Cat Lai Port",
  shelfLife: "12 months",
  storageCondition: "Store in dry and cool place",
  isActive: true,
  sampleAvailable: true,
  labReportAvailable: false,
  status: ProductStatus.DRAFT,
  sortOrder: 1,
  isFeatured: false,
  countryConfigs: [
    {
      countryCode: "VN",
      moqMt: "20",
      moqLabel: "1 container",
      leadTimeDays: 14,
      seoTitle: "Organic Cashew Nuts for Vietnam",
      metaDescription: "Premium cashew nuts tailored for the Vietnam market.",
      landingSlug: "viet-nam/cashew-nuts",
      isActive: true,
      sortOrder: 1,
    },
  ],
  attributeMappings: [
    {
      attributeCode: "coconut_size",
      defaultOptionValue: "Medium",
      required: true,
      sortOrder: 1,
    },
    {
      attributeCode: "husk_type",
      defaultOptionValue: "Semi Husked",
      required: true,
      sortOrder: 2,
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

export const UPDATE_PRODUCT_REPLACE_CONFIGS_SWAGGER_EXAMPLE: UpdateProductDto = {
  seoTitle: "Whole Dried Coconut Export Supplier - Updated",
  metaDescription: "Updated SEO content for campaign Q3.",
  sortOrder: 2,
  isFeatured: true,
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
