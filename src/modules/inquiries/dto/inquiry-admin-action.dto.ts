import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  InquiryStatus,
  InquirySalesStatus,
} from "../entities/inquiry.enums";

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(v)) return true;
    if (["false", "0", "no", "n"].includes(v)) return false;
  }
  return undefined;
};

export class UpdateInquiryStatusDto {
  @ApiProperty({ enum: InquiryStatus, description: "New lifecycle status for the inquiry" })
  @IsEnum(InquiryStatus)
  status!: InquiryStatus;

  @ApiPropertyOptional({ enum: InquirySalesStatus, description: "Optional sales pipeline status" })
  @IsOptional()
  @IsEnum(InquirySalesStatus)
  salesStatus?: InquirySalesStatus;

  @ApiPropertyOptional({ description: "Reason / note about status change (stored in activity log)" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateInquiryNotesDto {
  @ApiPropertyOptional({ description: "Internal notes visible only to staff" })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: "Optional activity log description" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  activityDescription?: string;
}

export class AssignStaffDto {
  @ApiProperty({ description: "Staff user UUID to assign" })
  @IsUUID()
  staffUserId!: string;

  @ApiPropertyOptional({ description: "Optional comment about the assignment" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @ApiPropertyOptional({
    description:
      "Set `true` to take over an inquiry currently held by another staff. " +
      "This closes their active assignment and creates yours. Without `force`, " +
      "assigning to an already-held inquiry returns 409 Conflict.",
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => normalizeBoolean(value))
  @IsBoolean()
  force?: boolean;
}
