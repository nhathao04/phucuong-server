import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { BlogStatus } from "../entities/blog.entity";

export class BlogListQueryDto {
  @ApiPropertyOptional({
    example: "cashew",
    description: "Search by title, slug, or excerpt",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      if (["true", "1", "yes", "y"].includes(v)) return true;
      if (["false", "0", "no", "n"].includes(v)) return false;
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
