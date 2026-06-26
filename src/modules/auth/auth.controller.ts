import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Login with email and password (customer)" })
  @ApiResponse({
    status: 200,
    description: "Returns JWT access token and user info",
    type: LoginResponseDto,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("admin/login")
  @ApiOperation({ summary: "Login for admin or staff users" })
  @ApiResponse({
    status: 200,
    description: "Returns JWT access token and user info for admin/staff",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "User does not have admin or staff role",
  })
  loginAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginAdminOrStaff(loginDto);
  }
}
