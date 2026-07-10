import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class QuoteItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  productName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specifications?: string;
}

export class CreateQuoteDto {
  // Customer Information
  @ApiProperty({ example: "John Smith" })
  @IsString()
  @MaxLength(255)
  customerName!: string;

  @ApiPropertyOptional({ example: "ABC Import Co." })
  @IsOptional()
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
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: "+1 234 567 890" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  whatsapp?: string;

  // Product Information
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: "Semi-Husked Coconut" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productName?: string;

  @ApiPropertyOptional({ example: "28 MT" })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({ example: "40ft Container" })
  @IsOptional()
  @IsString()
  containerType?: string;

  // Additional Requirements
  @ApiPropertyOptional({ example: "Please provide FOB and CIF pricing" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificateIds?: string[];

  // Form Fields from image (inquiry attributes)
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsArray()
  formFields?: Array<{ label: string; value: string }>;

  // Shipping Information
  @ApiPropertyOptional({ example: "Los Angeles" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  destinationPort?: string;

  @ApiPropertyOptional({ example: "Ho Chi Minh City" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  loadingPort?: string;

  // Trade Terms
  @ApiPropertyOptional({ example: ["FOB", "CIF"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTradeTerms?: string[];

  // Quantity Options
  @ApiPropertyOptional({ example: "Full Container Load (FCL)" })
  @IsOptional()
  @IsString()
  containerPreference?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  sampleRequired?: boolean;

  // Quote items (for staff to add pricing later)
  @ApiPropertyOptional({ type: [QuoteItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items?: QuoteItemDto[];
}

export class UpdateQuoteDto {
  @ApiPropertyOptional({ enum: ["pending", "quoted", "rejected", "expired"] })
  @IsOptional()
  @IsEnum(["pending", "quoted", "rejected", "expired"])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quotedPrice?: number;

  @ApiPropertyOptional({ example: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  priceUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  validUntil?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staffNotes?: string;

  @ApiPropertyOptional({ type: [QuoteItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items?: QuoteItemDto[];
}
