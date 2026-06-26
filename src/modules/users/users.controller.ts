import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by id" })
  @ApiResponse({ status: 200, description: "User detail" })
  findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}
