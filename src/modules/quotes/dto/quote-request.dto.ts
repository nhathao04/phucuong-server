import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

export enum ProductSource {
  CATALOG = "catalog",
  OTHERS = "others",
}

/**
 * Coerce empty/whitespace-only strings into `undefined` so that
 * `@IsOptional` and `@IsDefined` validators behave correctly.
 *
 * Without this, FE sending `productId: ""` would pass `@IsString()` and
 * silently be persisted as an empty string instead of NULL.
 */
const emptyToUndefined = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;
  const v = value.trim();
  return v === "" ? undefined : v;
};

const normalizeSource = ({ value }: { value: unknown }) => {
  const out = emptyToUndefined({ value });
  if (typeof out !== "string") return out;
  return out.toLowerCase();
};

export class CreateQuoteDto {
  // Customer Information
  @ApiProperty({ example: "John Smith" })
  @IsString()
  @MaxLength(255)
  customerName!: string;

  @ApiPropertyOptional({ example: "ABC Import Co." })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiProperty({ example: "United States" })
  @IsString()
  @MaxLength(100)
  country!: string;

  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: "+1 234 567 890" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: "+1 234 567 890" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(50)
  whatsapp?: string;

  // Product Information
  // `productSource` tells the server whether the customer picked a real catalog
  // product (`catalog` → productId required) or a free-text custom request
  // (`others` → productName required, productId must be omitted).
  //
  // FE may also omit this field entirely and let the server infer it from
  // `productId`:
  //   - productId present (non-empty) → "catalog"
  //   - productId absent / empty      → "others"
  @ApiProperty({
    example: ProductSource.CATALOG,
    enum: ProductSource,
    required: false,
    description:
      "Where the product comes from. Use 'catalog' for an existing productId, " +
      "'others' for a custom/free-text product request. Case-insensitive. " +
      "Optional — inferred from productId when omitted.",
  })
  @IsOptional()
  @Transform(normalizeSource)
  @IsIn(Object.values(ProductSource), {
    message: `productSource must be one of: ${Object.values(ProductSource).join(", ")}`,
  })
  productSource?: ProductSource;

  @ApiPropertyOptional({
    example: "c5f5e7e0-0000-0000-0000-000000000000",
    description: "Required when productSource = 'catalog'. Must be omitted when productSource = 'others'.",
  })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    example: "Semi-Husked Coconut",
    description: "Required when productSource = 'others'. Optional but recommended when productSource = 'catalog' for display.",
  })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productName?: string;

  @ApiPropertyOptional({ example: "28 MT" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  quantity?: string;

  // Additional Requirements
  @ApiPropertyOptional({ example: "Please provide FOB and CIF pricing" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  notes?: string;

  // Form Fields from image (inquiry attributes)
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  formFields?: Record<string, string>;
}

export class UpdateQuoteDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  contacted?: boolean;
}
