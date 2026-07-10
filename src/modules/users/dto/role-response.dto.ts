import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "admin" })
  name!: string;

  @ApiProperty({ example: "Administrator with full access" })
  description!: string | null;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-06-28T10:00:00.000Z" })
  updatedAt!: Date;
}
