import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
}
