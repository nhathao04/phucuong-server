import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLWhlcmUiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIn0...",
  })
  accessToken!: string;

  @ApiProperty({
    example: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "admin@example.com",
      fullName: "Admin User",
      role: { id: "uuid", name: "admin" },
      isActive: true,
    },
  })
  user!: {
    id: string;
    email: string;
    fullName: string;
    role: { id: string; name: string } | null;
    isActive: boolean;
  };
}
