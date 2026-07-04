import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { AssetSummaryDto } from "./asset.dto";

export class AssetDto extends AssetSummaryDto {}

export class AssetListResponseDto {
  @ApiProperty({ type: [AssetSummaryDto] })
  @Type(() => AssetSummaryDto)
  items!: AssetSummaryDto[];

  @ApiProperty({ example: 24 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 24 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}
