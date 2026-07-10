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
    description: "Search by title or slug",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === "" ? undefined : value,
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === "" ? undefined : value,
  )
  @IsEnum(BlogStatus)
  status?: BlogStatus;

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
