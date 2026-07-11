import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateCertificateDto {
  @ApiProperty({
    example: "ISO 9001:2015",
    description: "Display name. Must be unique.",
  })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    example: true,
    description:
      "Whether the certificate is active and publicly listable. Defaults to true.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/certificates/iso-9001.pdf",
    description: "Link to the certificate file (PDF or image).",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string | null;
}

export class UpdateCertificateDto {
  @ApiPropertyOptional({ example: "ISO 9001:2015" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/certificates/iso-9001.pdf",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string | null;
}

export class CertificateListQueryDto {
  @ApiPropertyOptional({
    example: "iso",
    description: "Case-insensitive substring match on `name`.",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === "" ? undefined : value,
  )
  @IsString()
  @MaxLength(150)
  search?: string;
}

export class CertificateResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440099" })
  id!: string;

  @ApiProperty({ example: "ISO 9001:2015" })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/certificates/iso-9001.pdf",
  })
  fileUrl!: string | null;

  @ApiProperty({ example: 3 })
  productCount!: number;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  createdAt!: Date;
}

export class CertificateUsageCountDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440099" })
  id!: string;

  @ApiProperty({ example: 3 })
  productCount!: number;
}