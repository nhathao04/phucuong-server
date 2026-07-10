import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ProductApplicationAttributeInputDto {
  @ApiPropertyOptional({ example: "Beverage production" })
  @IsOptional()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: "Coconut water drinks, blends, and smoothies",
  })
  @IsOptional()
  @IsString()
  value!: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  sortOrder?: number;
}

export class ProductApplicationInputDto {
  @ApiPropertyOptional({
    example: "A clean and versatile base for beverage and food production.",
  })
  @IsOptional()
  introLine?: string;

  @ApiPropertyOptional({ type: [ProductApplicationAttributeInputDto] })
  @IsOptional()
  attributes?: ProductApplicationAttributeInputDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  sortOrder?: number;
}
