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

/**
 * Convert a human label (e.g. "Destination Port") into a stable, URL-friendly
 * slug suitable for use as a JSON object key and an `attributeCode`.
 *
 *   "Destination Port"   -> "destinationPort"
 *   "Quantity (MT)"      -> "quantityMt"
 *   "Packing - Inner"    -> "packingInner"
 *   "Số lượng"           -> "sLng"   (non-ASCII is stripped; empty falls back
 *                                     to "field")
 *
 * The result is camelCase, lowercase-first, ASCII-only, and <= 80 chars.
 *
 * NOTE: also implemented as `ProductsService.slugifyFieldLabel` and called
 * server-side from the pre-save hook (`assignGeneratedQuoteFieldKeys`).
 * This export is kept only for unit-test parity and external helpers.
 */
export const slugifyFieldLabel = (label: string): string => {
  const ascii = label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-zA-Z0-9]+/g, " ") // non-alphanumerics → spaces
    .trim();

  if (!ascii) {
    return "field";
  }

  const words = ascii.split(/\s+/).filter(Boolean);
  const camel = words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");

  const safe = camel || "field";
  return safe.slice(0, 80);
};

/**
 * Walk the `fields` array and fill in any missing `key` based on the field's
 * `label`. Preserves explicit client-provided keys. Disambiguates duplicates
 * by suffixing the first occurrence with no suffix, the second with "2", etc.
 *
 * Pure function: returns a new array, never mutates input.
 *
 * NOTE: also implemented as `ProductsService.assignGeneratedFieldKeys` and
 * invoked server-side from the pre-save hook. This export is kept only for
 * unit-test parity and external helpers; the request DTO does NOT run a
 * `@Transform` here because that would strip class-validator metadata on
 * each field instance and break nested validation.
 */
export const assignGeneratedFieldKeys = <
  T extends { key?: string | null; label?: string | null },
>(
  fields: T[],
): T[] => {
  const used = new Set<string>();
  return fields.map((f) => {
    const existing = (f.key ?? "").toString().trim();
    if (existing) {
      used.add(existing);
      return f;
    }

    const base = slugifyFieldLabel(String(f.label ?? ""));
    let candidate = base;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${base}${n}`;
      n += 1;
    }
    used.add(candidate);
    return { ...f, key: candidate };
  });
};

export class ProductAttributeMappingOptionInputDto {
  @ApiPropertyOptional({ example: 17 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  optionId?: number | null;

  @ApiProperty({ example: "Medium" })
  @IsString()
  @MaxLength(180)
  value!: string;

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

  @ApiPropertyOptional({
    example: false,
    description:
      "When true, selecting this option reveals a free-text field on the " +
      "inquiry form (e.g. 'Other (please specify)').",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isCustomTrigger?: boolean;

  @ApiPropertyOptional({
    example: "Please specify",
    description: "Placeholder for the custom value input when this option is selected.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customPlaceholder?: string | null;
}

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

  @ApiPropertyOptional({
    type: "array",
    description:
      "Options for select-type attributes. Each item is upserted into " +
      "`product_attribute_options` and matched by `attributeId + LOWER(value)`. " +
      "Items missing `value` are ignored. `sortOrder` defaults to the array " +
      "index. Existing options not present in this array are kept (no delete).",
    example: [
      { value: "Small", sortOrder: 0 },
      { value: "Medium", sortOrder: 1 },
      { value: "Large", sortOrder: 2 },
    ],
  })
  @IsOptional()
  @IsArray()
  options?: ProductAttributeMappingOptionInputDto[];

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
    description: "Whether the certificate is active. Defaults to true when creating by name.",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isActive?: boolean;

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

export class ProductQuoteConfigFieldOptionInputDto {
  @ApiProperty({ example: "PP Bag" })
  @IsString()
  @MaxLength(180)
  value!: string;

  @ApiPropertyOptional({ example: "PP Bag" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  label?: string;

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

  @ApiPropertyOptional({
    example: false,
    description:
      "When true, selecting this option reveals a free-text field on the " +
      "inquiry form (e.g. 'Other (please specify)').",
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  isCustomTrigger?: boolean;

  @ApiPropertyOptional({
    example: "Describe your preferred option",
    description:
      "Placeholder for the custom value input when this option is selected.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customPlaceholder?: string | null;
}

export class ProductQuoteConfigFieldInputDto {
  @ApiPropertyOptional({
    example: "quantity",
    description:
      "Stable key used as the JSON property name and as the attributeCode " +
      "in attribute_mappings. Optional — when omitted, the server auto-" +
      "generates it from `label` (slugified to camelCase, ASCII-only). " +
      "Duplicate keys within the same request are disambiguated with " +
      "suffixes '2', '3', … Explicit keys are preserved as-is.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  key?: string;

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

  @ApiPropertyOptional({
    type: [ProductQuoteConfigFieldOptionInputDto],
    description:
      "Options for select-type fields. Each item must include `value`. " +
      "`sortOrder` defaults to the array index. `isActive` defaults to true. " +
      "`isCustomTrigger` and `customPlaceholder` mirror the " +
      "attribute-option semantics: when set, the inquiry form shows a " +
      "free-text input next to the selected option.",
    example: [
      { value: "PP Bag", sortOrder: 0, isActive: true },
      { value: "Bulk Loading", sortOrder: 1, isActive: true },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductQuoteConfigFieldOptionInputDto)
  options?: ProductQuoteConfigFieldOptionInputDto[];
}

export class ProductQuoteConfigInputDto {
  @ApiPropertyOptional({
    example: "1 container",
    description:
      "Minimum Order Quantity label.\n\n" +
      "OPTIONAL: if you also send attributeValues with code 'moq' (e.g. { attributeCode: 'moq', value: '1 x 40ft containers' }), " +
      "this field is AUTO-DERIVED when omitted and normalized to the parser-friendly form '<N> x <CODE>' " +
      "(e.g. '1 x 40RF').\n\n" +
      "Explicit values here always win over auto-derivation. Format expected by auto-calc: '<count> x <containerCode>' " +
      "where 'containerCode' matches an entry in containerConfigs.",
  })
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
    description:
      "Inquiry form fields shown to the customer. `key` is optional — when " +
      "omitted, it is auto-generated by the server from `label` (camelCase, " +
      "ASCII-only). Duplicate keys within the same request are " +
      "disambiguated with `2`, `3`, … suffixes. Explicit keys are " +
      "preserved as-is.",
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
    description:
      "Container capacity configurations used by inquiry auto-calculation (estimatedContainers, MOQ validation).\n\n" +
      "OPTIONAL: if you also send `attributeValues` with codes `container_load` and `container_type`, this field is AUTO-DERIVED when omitted. " +
      "Example: `attributeValues: [{ attributeCode: 'container_load', value: '~27 tonnes per 40ft container' }, { attributeCode: 'container_type', value: '40ft refrigerated (reefer)' }]` " +
      "auto-creates `{ containerCode: '40RF', containerName: '40ft refrigerated (reefer)', capacityMt: 27, isDefault: true }`.\n\n" +
      "Explicit values here always win over auto-derivation.",
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

/**
 * Swagger example — minimal payload that RELIES ON AUTO-DERIVATION.
 *
 * Sends only `attributeValues` with the well-known codes
 * (`container_load`, `container_type`, `moq`). The server auto-creates
 * matching `containerConfigs` and `quoteConfig.moq`. Useful for FE when
 * staff only fills the single "specifications + packing" form.
 */
export const CREATE_PRODUCT_AUTO_DERIVE_SWAGGER_EXAMPLE: CreateProductDto = {
  name: "Frozen Coconut Water",
  slug: "frozen-coconut-water",
  productCode: "PC-FCW-001",
  productCategorySlug: "coconut-products",
  shortDescription:
    "Fresh-frozen coconut water from Ben Tre, Vietnam — exporter grade.",
  description:
    "Frozen coconut water cubes/packs ready for beverage manufacturers.",
  status: ProductStatus.PUBLISHED,
  isActive: true,
  quoteConfig: {
    // moq OMITTED on purpose — will be auto-derived from attributeValues below
    tradeTerms: ["FOB", "CNF", "CIF"],
  },
  attributeValues: [
    // SPECIFICATIONS
    { attributeCode: "product_type",      groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Frozen coconut water",         sectionLabel: "Product Overview", sortOrder: 1 },
    { attributeCode: "origin",            groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Ben Tre, Vietnam",              sectionLabel: "Product Overview", sortOrder: 2 },
    { attributeCode: "composition",       groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "100% pure coconut water - no added water, sugar, or preservatives", sectionLabel: "Specifications", sortOrder: 3 },
    { attributeCode: "processing",        groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Fresh-frozen (raw frozen)",    sectionLabel: "Specifications", sortOrder: 4 },
    { attributeCode: "storage_conditions", groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "−18°C or below",                sectionLabel: "Specifications", sortOrder: 5 },
    { attributeCode: "shelf_life",        groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "24 months",                     sectionLabel: "Specifications", sortOrder: 6 },
    { attributeCode: "harvest_season",    groupKey: ProductAttributeGroup.SPECIFICATIONS, value: "Year-round",                    sectionLabel: "Specifications", sortOrder: 7 },

    // PACKING — these 3 trigger auto-derivation ↓
    { attributeCode: "packaging",     groupKey: ProductAttributeGroup.PACKING, value: "20kg/carton",                          sectionLabel: "Packing", sortOrder: 1 },
    { attributeCode: "container_load", groupKey: ProductAttributeGroup.PACKING, value: "~27 tonnes per 40ft container",       sectionLabel: "Packing", sortOrder: 2 },
    { attributeCode: "container_type", groupKey: ProductAttributeGroup.PACKING, value: "40ft refrigerated (reefer)",         sectionLabel: "Packing", sortOrder: 3 },
    { attributeCode: "moq",           groupKey: ProductAttributeGroup.PACKING, value: "1 x 40ft containers",                 sectionLabel: "Packing", sortOrder: 4 },
    // containerConfigs & quoteConfig.moq OMITTED on purpose.
    // ↑ After this request, server creates:
    //   containerConfigs: [{ containerCode: "40RF", containerName: "40ft refrigerated (reefer)", capacityMt: 27, isDefault: true }]
    //   quoteConfig.moq: "1 x 40RF"
  ],
  // tradeTerms only — containerConfigs OMITTED on purpose
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
