import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class CreateProductCategoryDto {
  @ApiProperty({
    example: "Coconut Products",
    description: "Display name. Slug is auto-generated from this value.",
    maxLength: 180,
  })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({
    example: "Coconut-based products for export.",
    description: "Optional human-readable description shown on category pages.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the category is active and publicly listable.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductCategoryDto {
  @ApiPropertyOptional({
    example: "Updated display name.",
    maxLength: 180,
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @ApiPropertyOptional({
    example: "coconut-products",
    description:
      "Optional custom slug (kebab-case, lowercase, alphanumerics + dashes). Auto-generated from name when omitted.",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  })
  @IsOptional()
  @IsString()
  @Length(2, 220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be kebab-case (lowercase letters, digits, single dashes)",
  })
  slug?: string;

  @ApiPropertyOptional({
    example: "Coconut-based products for export.",
    description: "Updated description. Pass empty string or null to clear.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: "Toggle active state.",
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}