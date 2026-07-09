import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateRoleDto, CreateUserDto } from "./dto/create-user.dto";
import {
  ActivateUserDto,
  CreateStaffDto,
  UpdateUserDto,
  UserListResponseDto,
  UserResponseDto,
} from "./dto/user-admin.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Public endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  @Post("users")
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto) as Promise<UserResponseDto>;
  }

  @Post("users/roles")
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "Role created successfully" })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.usersService.createRole(
      createRoleDto.name,
      createRoleDto.description,
    );
  }

  @Get("users/:id")
  @ApiOperation({ summary: "Get a user by id" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findById(@Param("id") id: string): Promise<UserResponseDto> {
    return this.usersService.findByIdWithRole(id) as Promise<UserResponseDto>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Admin endpoints (protected)
  // ─────────────────────────────────────────────────────────────────────────────

  @Get("admin/users")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all users (admin)" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "role", required: false })
  @ApiQuery({ name: "isActive", required: false })
  @ApiResponse({ status: 200, type: UserListResponseDto })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("isActive") isActive?: string,
  ): Promise<UserListResponseDto> {
    const isActiveBool = isActive !== undefined
      ? isActive === "true"
      : undefined;

    return this.usersService.findAllAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      role,
      isActive: isActiveBool,
    });
  }

  @Post("admin/users")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create staff account (admin)" })
  @ApiResponse({ status: 201, type: UserResponseDto })
  createStaff(@Body() dto: CreateStaffDto): Promise<UserResponseDto> {
    return this.usersService.createStaff(dto) as Promise<UserResponseDto>;
  }

  @Put("admin/users/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user info (admin)" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, dto) as Promise<UserResponseDto>;
  }

  @Put("admin/users/:id/activate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Activate/Deactivate user (admin)" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  setActive(
    @Param("id") id: string,
    @Body() dto: ActivateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.setUserActive(id, dto.isActive) as Promise<UserResponseDto>;
  }
}
