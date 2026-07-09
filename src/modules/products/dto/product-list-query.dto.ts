import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class ProductListQueryDto {
  @ApiPropertyOptional({
    example: "coffee",
    description: "Search by product name, slug, or description",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === "" ? undefined : value,
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "y"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "no", "n"].includes(normalized)) {
        return false;
      }
    }

    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
