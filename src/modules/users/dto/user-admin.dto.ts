import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MinLength, MaxLength } from "class-validator";

export class CreateStaffDto {
  @ApiProperty({ example: "staff@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "secret123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "Nguyen Van A" })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({ example: "staff", description: "Role name: admin or staff" })
  @IsOptional()
  @IsString()
  roleName?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Nguyen Van B" })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: "staff" })
  @IsOptional()
  @IsString()
  roleName?: string;
}

export class ActivateUserDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class RoleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional()
  avatarUrl!: string | null;

  @ApiProperty()
  roleId!: string | null;

  @ApiPropertyOptional({ type: RoleResponseDto })
  role!: RoleResponseDto | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  lastLoginAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class UserListResponseDto {
  @ApiProperty({ type: () => [UserResponseDto] })
  data!: UserResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
