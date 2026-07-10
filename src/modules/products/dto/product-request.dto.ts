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
import { ProductAttributeGroup, ProductAttributeType } from "../entities/product-attribute.entity";
import {
  ProductApplicationInputDto,
  ProductApplicationAttributeInputDto,
} from "./product-application.dto";

export {
  ProductApplicationInputDto,
  ProductApplicationAttributeInputDto,
};

export class ProductAttributeValueInputDto {
  @ApiPropertyOptional({
    example: 12,
    description: "Attribute ID. Use this OR attributeCode.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  attributeId?: number;

  @ApiPropertyOptional({
    example: "shell_color",
    description: "Attribute code. Use this OR attributeId.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  attributeCode?: string;

  @ApiPropertyOptional({ enum: ProductAttributeGroup })
  @IsOptional()
  @IsEnum(ProductAttributeGroup)
  groupKey?: ProductAttributeGroup;

  @ApiPropertyOptional({
    example: "Shell color",
    description:
      "Name of the attribute master (used when attributeCode is new and the master attribute doesn't exist yet).",
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  attributeName?: string;

  @ApiPropertyOptional({
    enum: ProductAttributeType,
    example: ProductAttributeType.TEXT,
    description:
      "Type of the attribute master (used when attributeCode is new). Defaults to 'text'.",
  })
  @IsOptional()
  @IsEnum(ProductAttributeType)
  attributeType?: ProductAttributeType;

  @ApiPropertyOptional({
    example: "Natural brown, fibrous, dry surface",
    description: "Text/rich-text value (free form).",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  value?: string | null;

  @ApiPropertyOptional({
    example: 28.5,
    description: "Numeric value (number/range).",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valueNumber?: number | null;

  @ApiPropertyOptional({
    example: "tonnes",
    description: "Override unit (e.g. 'kg', 'tonnes', '%').",
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string | null;

  @ApiPropertyOptional({
    example: "*Shelf life depends on proper storage...",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  footnote?: string | null;

  @ApiPropertyOptional({ example: "Product Overview" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  sectionLabel?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
  })
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}

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

  @ApiPropertyOptional({
    example: true,
    description:
      "When true, this attribute appears in the inquiry form for this product.",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isInquiryField?: boolean;

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
  @ApiPropertyOptional({
    description: "Cloudinary URL of the image (e.g. https://res.cloudinary.com/xxx/image/upload/...)",
    example: "https://res.cloudinary.com/xxx/image/upload/v1/products/coconut.jpg",
    type: "string",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  url?: string;

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
    description: "Alt text for the image",
    example: "Fresh coconut product",
    type: "string",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @ApiPropertyOptional({
    description: "Optional caption displayed alongside the image",
    example: "Workers sorting cashews at the Binh Duong facility",
    type: "string",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string | null;

  @ApiPropertyOptional({
    description: "Display order (lower = first)",
    example: 0,
    type: "integer",
  })
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

export class ProductFaqInputDto {
  @ApiPropertyOptional({
    description: "Existing FAQ id. Omit when creating a new FAQ.",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiProperty({ example: "What is the MOQ?" })
  @IsString()
  @MaxLength(500)
  question!: string;

  @ApiProperty({ example: "The typical MOQ is 1 container." })
  @IsString()
  answer!: string;

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

export class ProductCertificateInputDto {
  @ApiPropertyOptional({
    description: "Existing product-certificate mapping id. Omit when adding a new mapping.",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({
    description: "Certificate UUID (preferred). Use this OR name.",
    example: "550e8400-e29b-41d4-a716-446655440020",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  certificateId?: string;

  @ApiPropertyOptional({
    description: "Certificate name. Used to look up (or create) the certificate by name when certificateId is not provided.",
    example: "ISO 9001:2015",
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    description: "Certificate status (e.g. 'active', 'available'). Required when creating by name.",
    example: "active",
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  status?: string | null;

  @ApiPropertyOptional({
    description: "Certificate file URL (e.g. Cloudinary PDF). Optional when creating by name.",
    example: "https://cdn.example.com/certificates/iso-9001.pdf",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isRequired?: boolean;

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

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

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
    example: "https://cdn.example.com/products/cashew-thumb.webp",
    description: "Optional explicit thumbnail URL. If omitted, derived from images[0].",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/products/cashew-hero.webp",
    description: "Optional explicit hero image URL. If omitted, derived from images[0].",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: "Whether product is visible in staff/client flows",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;

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

  @ApiPropertyOptional({
    type: [ProductAttributeValueInputDto],
    description:
      "Per-product attribute values (Specifications / Packing). Accepts attributeId or attributeCode. Sending empty array clears values.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueInputDto)
  attributeValues?: ProductAttributeValueInputDto[];

  @ApiPropertyOptional({
    type: [ProductFaqInputDto],
    description: "Replace product FAQs. Sending empty array clears FAQs.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFaqInputDto)
  faqs?: ProductFaqInputDto[];

  @ApiPropertyOptional({
    type: [ProductCertificateInputDto],
    description:
      "Replace product certificate mappings. Provide certificateId or name. Sending empty array clears certificates.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCertificateInputDto)
  certificates?: ProductCertificateInputDto[];

  @ApiPropertyOptional({
    type: [ProductApplicationInputDto],
    description: "Applications for this product.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductApplicationInputDto)
  applications?: ProductApplicationInputDto[];
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

  @ApiPropertyOptional({
    example: "https://cdn.example.com/products/cashew-thumb.webp",
    description: "Optional explicit thumbnail URL. If omitted, derived from images[0].",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/products/cashew-hero.webp",
    description: "Optional explicit hero image URL. If omitted, derived from images[0].",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [String], example: ["Export Ready", "FCL", "Certified"] })
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

  @ApiPropertyOptional({
    type: [ProductAttributeValueInputDto],
    description:
      "Per-product attribute values (Specifications / Packing). Accepts attributeId or attributeCode. Sending empty array clears values.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueInputDto)
  attributeValues?: ProductAttributeValueInputDto[];

  @ApiPropertyOptional({
    type: [ProductFaqInputDto],
    description: "Replace product FAQs. Sending empty array clears FAQs.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFaqInputDto)
  faqs?: ProductFaqInputDto[];

  @ApiPropertyOptional({
    type: [ProductCertificateInputDto],
    description:
      "Replace product certificate mappings. Provide certificateId or name. Sending empty array clears certificates.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCertificateInputDto)
  certificates?: ProductCertificateInputDto[];

  @ApiPropertyOptional({
    type: [ProductApplicationInputDto],
    description: "Applications for this product.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductApplicationInputDto)
  applications?: ProductApplicationInputDto[];
}

export const CREATE_PRODUCT_SWAGGER_EXAMPLE: CreateProductDto = {
  name: "Semi-Husked Coconut",
  slug: "semi-husked-coconut",
  productCode: "PC-SHC-001",
  productCategorySlug: "coconut-products",
  seoTitle: "Semi-Husked Coconut Export Supplier",
  metaDescription:
    "Premium semi-husked mature coconuts from Vietnam for B2B importers.",
  focusKeyword: "semi-husked coconut",
  description:
    "Export-grade semi-husked mature coconuts from Ben Tre, Vietnam.",
  shortDescription: "Export-ready semi-husked coconuts from Vietnam.",
  badges: ["Export Ready", "FCL"],
  isActive: true,
  status: ProductStatus.PUBLISHED,
  sortOrder: 1,
  isFeatured: true,
  hero: {
    eyebrow: "Premium Export Quality",
    title: "Semi-Husked Coconut",
    subtitle: "Vietnamese coconuts prepared for international buyers.",
    stats: [
      { value: "10+", label: "Years export" },
      { value: "30+", label: "Export markets" },
      { value: "FCL", label: "Shipment ready" },
    ],
  },
  quoteConfig: {
    moq: "1 x 40ft container",
    tradeTerms: ["FOB", "CNF", "CIF"],
    fields: [
      { key: "quantity", label: "Quantity", type: "number", unit: "MT", required: true },
      { key: "destinationPort", label: "Destination Port", type: "text", required: true },
    ],
  },
  attributeValues: [
    { attributeCode: "product_type",  groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Semi-husked mature coconut",         sectionLabel: "Product Overview", sortOrder: 1 },
    { attributeCode: "origin",        groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Ben Tre, Vietnam",                      sectionLabel: "Product Overview", sortOrder: 2 },
    { attributeCode: "husking",      groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Semi-husked; 60-70% husk removed",     sectionLabel: "Specifications",   sortOrder: 3 },
    { attributeCode: "shell",        groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Natural brown, fibrous, dry surface",  sectionLabel: "Specifications",   sortOrder: 4 },
    { attributeCode: "kernel",       groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Thick, firm, off-white",              sectionLabel: "Specifications",   sortOrder: 5 },
    { attributeCode: "size",         groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "600~1000g per nut", unit: "g",        sectionLabel: "Specifications",   sortOrder: 6 },
    { attributeCode: "shelf_life",   groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Up to 90 days",
      footnote: "Shelf life depends on proper storage and handling conditions after delivery.",
      sectionLabel: "Specifications",   sortOrder: 7 },
    { attributeCode: "harvest_season", groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Year-round",                         sectionLabel: "Specifications",   sortOrder: 8 },
    { attributeCode: "packaging",    groupKey: ProductAttributeGroup.PACKING,        value: "PP mesh bags, ~30kg per bag",         sectionLabel: "Packing",          sortOrder: 1 },
    { attributeCode: "container_load", groupKey: ProductAttributeGroup.PACKING,        value: "~28 tonnes per 40ft container",       sectionLabel: "Packing",          sortOrder: 2 },
    { attributeCode: "container_type", groupKey: ProductAttributeGroup.PACKING,        value: "Standard dry container",              sectionLabel: "Packing",          sortOrder: 3 },
    { attributeCode: "moq",          groupKey: ProductAttributeGroup.PACKING,         value: "1 x 40ft containers",                  sectionLabel: "Packing",          sortOrder: 4 },
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
