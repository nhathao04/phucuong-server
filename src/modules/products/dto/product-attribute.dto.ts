import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
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

  @ApiProperty({ example: false })
  isCustomTrigger!: boolean;

  @ApiPropertyOptional({
    example: "Describe your preferred size",
  })
  customPlaceholder!: string | null;
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
    example: true,
    description:
      "When true (default), this attribute is shown on the public inquiry form (Step 2). When false, it stays in the catalog/listing/admin only and is hidden from buyers. Useful for internal notes, packaging details only used by ops, etc.",
  })
  @IsOptional()
  @IsBoolean()
  isInquiryField?: boolean;

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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isInquiryField?: boolean;
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

  @ApiProperty({
    example: true,
    description:
      "Whether this attribute is shown on the public inquiry form (Step 2). False = hidden from buyers, visible only in catalog/listing.",
  })
  isInquiryField!: boolean;

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
  @Transform(({ value }) =>
    value === undefined || value === null || value === "" ? undefined : value,
  )
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

  @ApiPropertyOptional({
    example: false,
    description:
      "When true, picking this option on the inquiry form reveals a free-form input. The buyer types their own value (sent as customValue alongside optionId).",
  })
  @IsOptional()
  @IsBoolean()
  isCustomTrigger?: boolean;

  @ApiPropertyOptional({
    example: "Describe your preferred size (e.g. 14 cm)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customPlaceholder?: string;
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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCustomTrigger?: boolean;

  @ApiPropertyOptional({
    example: "Describe your preferred size (e.g. 14 cm)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customPlaceholder?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog Attribute DTOs - Simple attribute for product display only
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCatalogAttributeDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsString()
  productId!: string;

  @ApiProperty({ example: "Origin Country" })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({
    enum: ProductAttributeGroup,
    example: ProductAttributeGroup.SPECIFICATIONS,
  })
  @IsEnum(ProductAttributeGroup)
  groupKey!: ProductAttributeGroup;

  @ApiPropertyOptional({ example: "Country of origin: Vietnam" })
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inquiry Attribute DTOs - Complex attribute for inquiry form
// ─────────────────────────────────────────────────────────────────────────────

export class CreateInquiryAttributeDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsString()
  productId!: string;

  @ApiProperty({ example: "Shell Color" })
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
    example: ProductAttributeType.SELECT,
    description: "Type of inquiry field: text, number, select",
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

  @ApiPropertyOptional({ example: "Select shell color" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeholder?: string | null;

  @ApiPropertyOptional({
    example: "*Shelf life depends on proper storage...",
  })
  @IsOptional()
  @IsString()
  note?: string | null;

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
    description: "Options for select-type attributes",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeOptionInputDto)
  options?: ProductAttributeOptionInputDto[];
}