import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import {
  ProductAttributeGroup,
  ProductAttributeType,
} from "../entities/product-attribute.entity";

export class ProductAttributeOptionInputDto {
  @ApiPropertyOptional({ example: "Small" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  value?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ProductAttributeOptionDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Small" })
  value!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class CreateProductAttributeDto {
  @ApiProperty({ example: "shell_color" })
  @IsString()
  @MaxLength(100)
  code!: string;

  @ApiProperty({ example: "Shell color" })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({
    enum: ProductAttributeGroup,
    example: ProductAttributeGroup.SPECIFICATIONS,
  })
  @IsEnum(ProductAttributeGroup)
  groupKey!: ProductAttributeGroup;

  @ApiProperty({
    enum: ProductAttributeType,
    example: ProductAttributeType.TEXT,
  })
  @IsEnum(ProductAttributeType)
  type!: ProductAttributeType;

  @ApiPropertyOptional({ example: "kg" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string | null;

  @ApiPropertyOptional({ example: "Natural brown" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultValue?: string | null;

  @ApiPropertyOptional({ example: "Enter shell color" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeholder?: string | null;

  @ApiPropertyOptional({
    example: "*Shelf life depends on proper storage...",
  })
  @IsOptional()
  @IsString()
  footnote?: string | null;

  @ApiPropertyOptional({ example: "Product Overview" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  sectionLabel?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [ProductAttributeOptionInputDto],
    description: "Options for select-type attributes.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeOptionInputDto)
  options?: ProductAttributeOptionInputDto[];
}

export class UpdateProductAttributeDto {
  @ApiPropertyOptional({ example: "Shell color" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @ApiPropertyOptional({ enum: ProductAttributeGroup })
  @IsOptional()
  @IsEnum(ProductAttributeGroup)
  groupKey?: ProductAttributeGroup;

  @ApiPropertyOptional({ enum: ProductAttributeType })
  @IsOptional()
  @IsEnum(ProductAttributeType)
  type?: ProductAttributeType;

  @ApiPropertyOptional({ example: "kg" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string | null;

  @ApiPropertyOptional({ example: "Natural brown" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultValue?: string | null;

  @ApiPropertyOptional({ example: "Enter shell color" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeholder?: string | null;

  @ApiPropertyOptional({ example: "*Shelf life depends on..." })
  @IsOptional()
  @IsString()
  footnote?: string | null;

  @ApiPropertyOptional({ example: "Product Overview" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  sectionLabel?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductAttributeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "shell_color" })
  code!: string;

  @ApiProperty({ example: "Shell color" })
  name!: string;

  @ApiProperty({ enum: ProductAttributeGroup })
  groupKey!: ProductAttributeGroup;

  @ApiProperty({ enum: ProductAttributeType })
  type!: ProductAttributeType;

  @ApiPropertyOptional({ example: "kg" })
  unit!: string | null;

  @ApiPropertyOptional({ example: "Natural brown" })
  defaultValue!: string | null;

  @ApiPropertyOptional({ example: "Enter shell color" })
  placeholder!: string | null;

  @ApiPropertyOptional({ example: "*Shelf life depends on..." })
  footnote!: string | null;

  @ApiPropertyOptional({ example: "Product Overview" })
  sectionLabel!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: [ProductAttributeOptionDto] })
  options!: ProductAttributeOptionDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProductAttributeListQueryDto {
  @ApiPropertyOptional({ enum: ProductAttributeGroup })
  @IsOptional()
  @IsEnum(ProductAttributeGroup)
  groupKey?: ProductAttributeGroup;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AddAttributeOptionDto {
  @ApiProperty({ example: "W450" })
  @IsString()
  @MaxLength(180)
  value!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateAttributeOptionDto {
  @ApiPropertyOptional({ example: "W450" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  value?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}