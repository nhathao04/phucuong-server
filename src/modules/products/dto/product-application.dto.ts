import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";

export class ProductApplicationAttributeInputDto {
  @ApiProperty({ example: "Beverage production", description: "Attribute name (required)." })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: "Coconut water drinks, blends, and smoothies",
    description: "Attribute value (optional).",
  })
  @IsOptional()
  @IsString()
  value?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class ProductApplicationInputDto {
  @ApiPropertyOptional({
    example: "A clean and versatile base for beverage and food production.",
  })
  @IsOptional()
  @IsString()
  introLine?: string;

  @ApiPropertyOptional({ type: [ProductApplicationAttributeInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductApplicationAttributeInputDto)
  attributes?: ProductApplicationAttributeInputDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
