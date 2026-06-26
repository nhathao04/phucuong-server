import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "secret123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "Nguyen Van A" })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({
    example: "7b8d7f12-4f86-4b5d-9c8f-2a1d4f4a9d11",
    description:
      "Role ID to assign to the new account. Defaults to user role when omitted.",
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: "moderator", description: "Unique role name" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: "Can manage content but cannot access admin settings",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
