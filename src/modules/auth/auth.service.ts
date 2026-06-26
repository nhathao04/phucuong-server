import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_SECRET", "change-me"),
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN", "1d"),
    });
  }

  private buildLoginResponse(
    user: User,
    accessToken: string,
  ): LoginResponseDto {
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role ? { id: user.role.id, name: user.role.name } : null,
        isActive: user.isActive,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailWithRole(loginDto.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is inactive");
    }

    await this.usersService.updateLastLogin(user.id);

    const accessToken = await this.generateToken(user);
    return this.buildLoginResponse(user, accessToken);
  }

  async loginAdminOrStaff(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailWithRole(loginDto.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is inactive");
    }

    const hasAdminOrStaffRole =
      await this.usersService.hasAdminOrStaffRole(user);
    if (!hasAdminOrStaffRole) {
      throw new ForbiddenException("Only admin or staff can access");
    }

    await this.usersService.updateLastLogin(user.id);

    const accessToken = await this.generateToken(user);
    return this.buildLoginResponse(user, accessToken);
  }
}
