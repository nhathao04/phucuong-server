import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { AssetOwnerType } from "../entities/asset.entity";

export class CreateAssetDto {
  @ApiPropertyOptional({
    example: "https://cdn.example.com/uploads/image.webp",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/uploads/image-thumb.webp",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: "SEO image alt text" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string | null;

  @ApiPropertyOptional({ example: "Optional caption" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string | null;

  @ApiPropertyOptional({ example: 1600 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width?: number | null;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height?: number | null;

  @ApiPropertyOptional({ example: "image/webp" })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  mimeType?: string;

  @ApiPropertyOptional({ example: "image-original.webp" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  originalName?: string | null;

  @ApiPropertyOptional({ example: "uploads/2026/07/image-original.webp" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  storageKey?: string | null;

  @ApiPropertyOptional({ example: 482112 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  byteSize?: number | null;

  @ApiPropertyOptional({ enum: AssetOwnerType, example: AssetOwnerType.BLOG })
  @IsOptional()
  @IsEnum(AssetOwnerType)
  ownerType?: AssetOwnerType;

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  ownerId?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class BulkCreateAssetsDto {
  @ApiPropertyOptional({ type: [CreateAssetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetDto)
  items?: CreateAssetDto[];
}

export class ListAssetsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 24, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 24;

  @ApiPropertyOptional({ enum: AssetOwnerType, example: AssetOwnerType.BLOG })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsEnum(AssetOwnerType)
  ownerType?: AssetOwnerType;

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
