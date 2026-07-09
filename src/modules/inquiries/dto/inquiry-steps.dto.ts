import {
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { InquiryTradeTerm, InquiryPaymentTerm } from "../entities/inquiry.enums";
import { InquiryQuantityUnit } from "../entities/inquiry.enums";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Customer Information (REQUIRED from the start)
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryStep1Dto {
  @ApiProperty({ example: "Nguyen Van A" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @ApiPropertyOptional({ example: "ABC Import Co., Ltd." })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  companyName?: string | null;

  @ApiProperty({ example: "contact@abcimport.com" })
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @ApiPropertyOptional({ example: "+84 28 1234 5678" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string | null;

  @ApiPropertyOptional({ example: "+84 90 123 4567" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  whatsappNumber?: string | null;

  @ApiProperty({
    example: "uuid-of-product",
    description:
      "Product the buyer is interested in. Required at Step 1 so the inquiry is " +
      "bound to a single product from the start — Step 2 then only collects " +
      "quantity, sample request and product-specific attributes for this product.",
  })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ example: "uuid-of-destination-country" })
  @IsOptional()
  @IsUUID()
  destinationCountryId?: string | null;

  @ApiPropertyOptional({ example: "uuid-of-destination-port" })
  @IsOptional()
  @IsUUID()
  destinationPortId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Product Selection
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryAttributeValueDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  attributeId?: number;

  @ApiPropertyOptional({ example: "origin" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  attributeCode?: string;

  @ApiPropertyOptional({
    example: 34,
    description:
      "ID of the option the buyer picked. When the option has isCustomTrigger=true, customValue becomes required.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  optionId?: number | null;

  @ApiPropertyOptional({
    example: "Ben Tre, Vietnam",
    description:
      "Display value — either the option's value (resolved server-side from optionId) or a free-form string for text-type attributes.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  value?: string | null;

  @ApiPropertyOptional({
    example: "14 cm diameter",
    description:
      "Buyer-supplied custom text. Required when the selected option has isCustomTrigger=true; otherwise ignored.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customValue?: string | null;
}

export class InquiryStep2Dto {
  @ApiProperty({
    example: "uuid-of-inquiry-from-step-1",
    description:
      "The product is bound to the inquiry at Step 1 — Step 2 only needs the " +
      "inquiryId so the server can look up which product to validate against.",
  })
  @IsUUID()
  inquiryId!: string;

  @ApiProperty({ example: 20, description: "Quantity in MT" })
  @IsNumber()
  quantity!: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  sampleRequest?: boolean;

  @ApiPropertyOptional({
    type: [InquiryAttributeValueDto],
    description:
      "Product-specific attribute values for this inquiry. Attributes are loaded dynamically based on the product selected in Step 1.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InquiryAttributeValueDto)
  attributes?: InquiryAttributeValueDto[];

  @ApiPropertyOptional({ example: "uuid-of-destination-country" })
  @IsOptional()
  @IsUUID()
  destinationCountryId?: string | null;

  @ApiPropertyOptional({ example: "uuid-of-destination-port" })
  @IsOptional()
  @IsUUID()
  destinationPortId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Commercial Terms + Requirements (certificates + free text)
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryStep3Dto {
  @ApiProperty({ example: "uuid-of-inquiry" })
  @IsUUID()
  inquiryId!: string;

  @ApiPropertyOptional({
    enum: InquiryTradeTerm,
    example: InquiryTradeTerm.FOB,
    description: "Incoterms trade term (optional)",
  })
  @IsOptional()
  @IsEnum(InquiryTradeTerm)
  tradeTerm?: InquiryTradeTerm | null;

  @ApiPropertyOptional({ enum: InquiryPaymentTerm })
  @IsOptional()
  @IsEnum(InquiryPaymentTerm)
  paymentTerm?: InquiryPaymentTerm | null;

  @ApiPropertyOptional({ example: "2026-09-01" })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string | null;

  @ApiPropertyOptional({
    type: [String],
    example: ["uuid-of-cert-1", "uuid-of-cert-2"],
    description:
      "Certificate IDs the buyer requires (FDA, HACCP, Organic, …). " +
      "Stored in inquiry_certificates when present. Optional.",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  certificateRequired?: string[] | null;

  @ApiPropertyOptional({
    type: [String],
    example: ["Phytosanitary Certificate", "Certificate of Origin"],
    description: "List of other required documents (free-text). Stored in inquiry_certificates.otherText.",
  })
  @IsOptional()
  @IsArray()
  @IsString()
  @MaxLength(200, { each: true })
  otherDocuments?: string[] | null;

  @ApiPropertyOptional({
    example: "Need special packaging for retail distribution.",
    description:
      "Any extra notes — labelling, retail kitting, private-label brand, " +
      "shipping marks. Stored on the requirement record and copied to inquiry.notes.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalRequirements?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Review & Submit (no fields, server finalises the inquiry)
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryStep4Dto {
  @ApiProperty({
    example: "uuid-of-inquiry",
    description:
      "ID of the inquiry to submit. Step 4 is review-only — the buyer has " +
      "already filled everything in Steps 1-3; calling this endpoint finalises " +
      "the inquiry and triggers customer + internal emails.",
  })
  @IsUUID()
  inquiryId!: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response types
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryProductSummaryDto {
  @ApiProperty({ example: "uuid-of-product" })
  productId!: string;

  @ApiProperty({ example: "Semi-Husked Coconut" })
  productName!: string;

  @ApiPropertyOptional({ example: "20" })
  quantityMt!: string | null;

  @ApiProperty({ example: false })
  sampleRequest!: boolean;

  @ApiProperty({ example: 1 })
  step!: number;
}

export class InquiryStepSummaryDto {
  @ApiProperty({ example: 1 })
  step!: number;

  @ApiProperty({ example: "STEP_1" })
  status!: string;

  @ApiPropertyOptional()
  completedAt!: Date | null;
}

export class InquiryProgressDto {
  @ApiProperty({ example: "uuid" })
  inquiryId!: string;

  @ApiProperty({ example: 3 })
  currentStep!: number;

  @ApiProperty({ example: "draft_step_3" })
  formStatus!: string;

  @ApiProperty({ type: [InquiryStepSummaryDto] })
  steps!: InquiryStepSummaryDto[];

  @ApiProperty({ example: false })
  isCompleted!: boolean;

  @ApiPropertyOptional()
  completedAt!: Date | null;
}

export class InquiryCreatedResponseDto {
  @ApiProperty({ example: "uuid" })
  inquiryId!: string;

  @ApiProperty({ example: 1 })
  currentStep!: number;

  @ApiProperty({ example: "draft_step_1" })
  formStatus!: string;

  @ApiProperty({ example: "INQ-20260707-0001" })
  inquiryCode!: string | null;

  @ApiProperty({ example: false })
  customerEmailSent!: boolean;

  @ApiProperty({ example: true })
  internalEmailSent!: boolean;
}

export class InquiryCalculationDto {
  @ApiPropertyOptional({
    example: 2,
    description: "Number of containers required (ceil(quantity / containerCapacity))",
  })
  estimatedContainers!: number | null;

  @ApiPropertyOptional({ example: "40HQ" })
  containerCode!: string | null;

  @ApiPropertyOptional({ example: "40' High Cube Dry Container" })
  containerName!: string | null;

  @ApiPropertyOptional({ example: 28.5, description: "Capacity of the chosen container (MT)" })
  containerCapacityMt!: number | null;

  @ApiPropertyOptional({ example: 20, description: "Minimum order quantity (MT)" })
  moqMt!: number | null;

  @ApiPropertyOptional({ example: "20 MT", description: "Human-readable MOQ label from CMS" })
  moqLabel!: string | null;

  @ApiProperty({
    enum: ["ok", "below_moq", "no_moq_config"],
    example: "ok",
    description:
      "ok = quantity >= MOQ, below_moq = quantity < MOQ, no_moq_config = MOQ not configured for this product/country",
  })
  moqStatus!: "ok" | "below_moq" | "no_moq_config";

  @ApiProperty({
    example: true,
    description: "True when MOQ status is not 'below_moq'",
  })
  isValid!: boolean;
}

export class InquiryStepSavedResponseDto extends InquiryCreatedResponseDto {
  @ApiProperty({ example: 2 })
  savedStep!: number;

  @ApiPropertyOptional({
    description:
      "Auto-computed product calculation (Container Qty + MOQ Status) returned on Step 2.",
    type: InquiryCalculationDto,
  })
  calculation?: InquiryCalculationDto | null;
}
