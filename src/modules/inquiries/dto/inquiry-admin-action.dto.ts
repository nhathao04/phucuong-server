import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import {
  InquiryStatus,
  InquirySalesStatus,
} from "../entities/inquiry.enums";

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
}
