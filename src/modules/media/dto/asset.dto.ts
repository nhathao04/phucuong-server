import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Asset } from "../entities/asset.entity";

export class AssetSummaryDto {
  @ApiProperty({ example: "asset-uuid" })
  id!: string;

  @ApiProperty({ example: "https://cdn.example.com/uploads/image.webp" })
  url!: string;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/uploads/image-thumb.webp",
  })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional({ example: "SEO image alt text" })
  alt!: string | null;

  @ApiPropertyOptional({ example: "Optional caption" })
  caption!: string | null;

  @ApiPropertyOptional({ example: 1600 })
  width!: number | null;

  @ApiPropertyOptional({ example: 1000 })
  height!: number | null;

  @ApiPropertyOptional({ example: 0 })
  sortOrder!: number;
}

export const toAssetSummary = (
  asset: Asset | null | undefined,
): AssetSummaryDto | null => {
  if (!asset) return null;
  return {
    id: asset.id,
    url: asset.url,
    thumbnailUrl: asset.thumbnailUrl,
    alt: asset.alt,
    caption: asset.caption,
    width: asset.width,
    height: asset.height,
    sortOrder: asset.sortOrder,
  };
};
