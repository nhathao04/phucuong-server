import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  IsInt,
  Min,
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

/**
 * Coerce an incoming `tradeTermId` value into a positive integer.
 *
 * Frontends sometimes send numeric IDs as JSON strings (e.g. `"1"`,
 * form-encoded, query-string derivations). `class-transformer` runs
 * `@Transform` BEFORE `@IsInt`, so we accept number / numeric string here
 * and reject anything else via the validator chain.
 *
 *   - number  → passed through (NaN-safe via Number.isFinite)
 *   - "123"   → 123 (parsed with parseInt radix 10)
 *   - "  3 "  → 3
 *   - "abc"   → NaN → validator will reject
 *   - null/undefined → undefined (lets @IsOptional fire)
 *   - ""      → undefined (whitespace was already trimmed by emptyToUndefined,
 *               so the empty-string branch is unreachable here but kept for
 *               safety)
 */
const coerceTradeTermIdToInt = ({ value }: { value: unknown }): number | undefined => {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

/**
 * FE has historically sent `productSource` under several labels even though
 * the BE only recognises two semantic variants:
 *
 *   - "catalog" → customer picked a real product from the FE dropdown
 *   - "others"  → customer typed a free-text product name (anything not in
 *                 the catalog; includes "Custom", "Not listed", etc.)
 *
 * FE-observed aliases we currently accept and map to the canonical value:
 *
 *   "custom"     → "others"   (early FE built with a Custom-card option)
 *
 * Anything else still trips `@IsIn` so we don't silently accept garbage.
 */
const normalizeProductSource = ({ value }: { value: unknown }): unknown => {
  const trimmed = emptyToUndefined({ value });
  if (trimmed === undefined) return undefined;
  if (typeof trimmed !== "string") return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower === "custom") return ProductSource.OTHERS;
  return lower;
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
  // FE has historically sent `productSource` as "custom" even though the
  // BE canonical set is {catalog, others}. The DTO transformer accepts the
  // legacy alias so older FEs don't get 400'd.
  @ApiProperty({
    example: ProductSource.CATALOG,
    enum: Object.values(ProductSource),
    required: false,
    description:
      "Where the product comes from. Use 'catalog' for an existing productId, " +
      "'others' for a custom/free-text product request. The legacy alias " +
      "'custom' is also accepted and treated as 'others'. " +
      "Case-insensitive. Optional — inferred from productId when omitted.",
  })
  @IsOptional()
  @Transform(normalizeProductSource)
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

  // Preferred price terms
  // FE has two ways to convey a preference:
  //   1. Pick from the BE-managed list (loaded via GET /api/trade-terms) →
  //      send `tradeTermId`. Server validates FK + activity, persists the
  //      TradeTerm.name into `tradeTermName`.
  //   2. Type a custom string (e.g. "Not sure - need advise") → send
  //      `tradeTermName` verbatim.
  // `tradeTermId` wins if both are sent. Both fields are optional — a quote
  // is allowed to have no price-term preference.
  @ApiPropertyOptional({
    example: 1,
    description:
      "FK to a TradeTerm row (FOB, CIF, EXW, …). Send this when the customer picked an option from the FE dropdown.",
  })
  @IsOptional()
  @Transform(coerceTradeTermIdToInt)
  @IsInt()
  @Min(1)
  tradeTermId?: number;

  @ApiPropertyOptional({
    example: "Not sure - need advise",
    description:
      "Free-form text for the customer's preferred price terms. Used when the customer types a value not in the BE list, or selects the 'Not sure' option. If `tradeTermId` is also sent, it takes precedence and this field is ignored.",
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(255)
  tradeTermName?: string;

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
