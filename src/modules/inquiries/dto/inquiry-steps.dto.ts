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

  @ApiPropertyOptional({ example: "Ben Tre, Vietnam" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  value?: string | null;
}

export class InquiryStep2Dto {
  @ApiProperty({ example: "uuid-of-inquiry-from-step-1" })
  @IsUUID()
  inquiryId!: string;

  @ApiProperty({ example: "uuid-of-product" })
  @IsUUID()
  productId!: string;

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
      "Product-specific attribute values for this inquiry. Attributes are loaded dynamically based on the selected product.",
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
// STEP 3 — Commercial Terms
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryStep3Dto {
  @ApiProperty({ example: "uuid-of-inquiry" })
  @IsUUID()
  inquiryId!: string;

  @ApiProperty({
    enum: InquiryTradeTerm,
    example: InquiryTradeTerm.FOB,
    description: "Incoterms trade term",
  })
  @IsEnum(InquiryTradeTerm)
  tradeTerm!: InquiryTradeTerm;

  @ApiPropertyOptional({ enum: InquiryPaymentTerm })
  @IsOptional()
  @IsEnum(InquiryPaymentTerm)
  paymentTerm?: InquiryPaymentTerm | null;

  @ApiPropertyOptional({ example: "2026-09-01" })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Requirements & Submit
// ─────────────────────────────────────────────────────────────────────────────

export class InquiryStep4Dto {
  @ApiProperty({ example: "uuid-of-inquiry" })
  @IsUUID()
  inquiryId!: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["uuid-of-cert-1", "uuid-of-cert-2"],
    description: "IDs of required certificates",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  certificateRequired?: string[];

  @ApiPropertyOptional({ example: "Need special packaging for retail distribution." })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalRequirements?: string | null;
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

export class InquiryStepSavedResponseDto extends InquiryCreatedResponseDto {
  @ApiProperty({ example: 2 })
  savedStep!: number;
}
