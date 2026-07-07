import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import {
  InquiryFormStatus,
  InquirySalesStatus,
  InquiryStatus,
} from "../entities/inquiry.enums";

export class InquiryListQueryDto {
  @ApiPropertyOptional({ description: "Page number (1-based)", example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Free-text search across code, customer name, email, company" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: InquiryStatus, description: "Filter by lifecycle status" })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @ApiPropertyOptional({ enum: InquiryFormStatus, description: "Filter by form-step status" })
  @IsOptional()
  @IsEnum(InquiryFormStatus)
  formStatus?: InquiryFormStatus;

  @ApiPropertyOptional({ enum: InquirySalesStatus, description: "Filter by sales pipeline status" })
  @IsOptional()
  @IsEnum(InquirySalesStatus)
  salesStatus?: InquirySalesStatus;

  @ApiPropertyOptional({ description: "Filter by current step", minimum: 1, maximum: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  currentStep?: number;

  @ApiPropertyOptional({ description: "Only submitted inquiries" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSubmitted?: boolean;

  @ApiPropertyOptional({ description: "Only inquiries with lead captured" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasLead?: boolean;

  @ApiPropertyOptional({ description: "Filter by destination country (UUID)" })
  @IsOptional()
  @IsUUID()
  destinationCountryId?: string;

  @ApiPropertyOptional({ description: "Filter by product (UUID)" })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: "Filter by customer (UUID)" })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: "Filter by UTM source" })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ description: "Created at >= this ISO timestamp" })
  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @ApiPropertyOptional({ description: "Created at <= this ISO timestamp" })
  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    enum: ["createdAt", "updatedAt", "code", "leadCapturedAt", "submittedAt"],
  })
  @IsOptional()
  @IsIn(["createdAt", "updatedAt", "code", "leadCapturedAt", "submittedAt"])
  sortBy?: "createdAt" | "updatedAt" | "code" | "leadCapturedAt" | "submittedAt" = "createdAt";

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], description: "Sort direction" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortDir?: "ASC" | "DESC" = "DESC";
}
