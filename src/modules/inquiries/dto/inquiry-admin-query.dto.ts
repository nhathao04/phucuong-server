import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
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
  InquiryContactStatus,
  InquiryFormStatus,
  InquirySalesStatus,
  InquiryStatus,
} from "../entities/inquiry.enums";

// Treat empty strings (and whitespace-only) coming from query strings
// (?status=&formStatus=) as `undefined` so optional filters are skipped
// instead of failing @IsEnum / @IsIn validators.
const emptyToUndefined = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

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
  @Transform(emptyToUndefined)
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: InquiryStatus, description: "Filter by lifecycle status" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @ApiPropertyOptional({ enum: InquiryFormStatus, description: "Filter by form-step status" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(InquiryFormStatus)
  formStatus?: InquiryFormStatus;

  @ApiPropertyOptional({ enum: InquirySalesStatus, description: "Filter by sales pipeline status" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(InquirySalesStatus)
  salesStatus?: InquirySalesStatus;

  @ApiPropertyOptional({ description: "Filter by current step", minimum: 1, maximum: 4 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === "" ? undefined : value,
  )
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
  @Transform(emptyToUndefined)
  @IsUUID()
  destinationCountryId?: string;

  @ApiPropertyOptional({ description: "Filter by product (UUID)" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: "Filter by customer (UUID)" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    description: "Filter by the primary staff currently assigned to handle the inquiry (UUID)",
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({
    enum: InquiryContactStatus,
    description: "Filter by contact workflow status",
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(InquiryContactStatus)
  contactStatus?: InquiryContactStatus;

  @ApiPropertyOptional({ description: "Filter by UTM source" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ description: "Created at >= this ISO timestamp" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsISO8601()
  createdFrom?: string;

  @ApiPropertyOptional({ description: "Created at <= this ISO timestamp" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsISO8601()
  createdTo?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    enum: ["createdAt", "updatedAt", "code", "leadCapturedAt", "submittedAt"],
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIn(["createdAt", "updatedAt", "code", "leadCapturedAt", "submittedAt"])
  sortBy?: "createdAt" | "updatedAt" | "code" | "leadCapturedAt" | "submittedAt" = "createdAt";

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], description: "Sort direction" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIn(["ASC", "DESC"])
  sortDir?: "ASC" | "DESC" = "DESC";
}
