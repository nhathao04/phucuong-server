import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

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

  // Additional Requirements
  @ApiPropertyOptional({ example: "Please provide FOB and CIF pricing" })
  @IsOptional()
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
