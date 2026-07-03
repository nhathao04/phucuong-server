import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";
import { BlogsService } from "./blogs.service";
import { CreateBlogDto, UpdateBlogDto } from "./dto/blog.dto";
import { BlogListQueryDto } from "./dto/blog-list-query.dto";
import { BlogDetailDto, BlogListResponseDto } from "./dto/blog-response.dto";

// ──────────────────────── Staff ────────────────────────

@ApiTags("staff-blogs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/blogs")
export class StaffBlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: "List all blogs for staff (all statuses)" })
  @ApiResponse({ status: 200, type: BlogListResponseDto })
  list(@Query() query: BlogListQueryDto): Promise<BlogListResponseDto> {
    return this.blogsService.staffList(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get blog detail for staff (by UUID or slug)" })
  @ApiParam({ name: "id", description: "Blog UUID or slug" })
  @ApiResponse({ status: 200, type: BlogDetailDto })
  detail(@Param("id") id: string): Promise<BlogDetailDto> {
    return this.blogsService.staffDetail(id);
  }

  @Post()
  @ApiOperation({
    summary: "Create blog",
    description: "New blogs are created with status=draft by default.",
  })
  @ApiResponse({ status: 201, type: BlogDetailDto })
  create(
    @Body() dto: CreateBlogDto,
    @Request() req: { user: { sub: string } },
  ): Promise<BlogDetailDto> {
    return this.blogsService.create(dto, req.user.sub);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update blog content or metadata" })
  @ApiParam({ name: "id", description: "Blog UUID" })
  @ApiResponse({ status: 200, type: BlogDetailDto })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogDto,
  ): Promise<BlogDetailDto> {
    return this.blogsService.update(id, dto);
  }

  @Patch(":id/publish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Publish a blog (status → published)" })
  @ApiParam({ name: "id", description: "Blog UUID" })
  @ApiResponse({ status: 200, type: BlogDetailDto })
  publish(@Param("id", ParseUUIDPipe) id: string): Promise<BlogDetailDto> {
    return this.blogsService.publish(id);
  }

  @Patch(":id/unpublish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unpublish a blog (status → hidden)" })
  @ApiParam({ name: "id", description: "Blog UUID" })
  @ApiResponse({ status: 200, type: BlogDetailDto })
  unpublish(@Param("id", ParseUUIDPipe) id: string): Promise<BlogDetailDto> {
    return this.blogsService.unpublish(id);
  }
}

// ──────────────────────── Public ────────────────────────

@ApiTags("public-blogs")
@Controller("blogs")
export class PublicBlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: "List published blogs (public)" })
  @ApiResponse({ status: 200, type: BlogListResponseDto })
  list(@Query() query: BlogListQueryDto): Promise<BlogListResponseDto> {
    return this.blogsService.publicList(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get blog detail by slug (public)" })
  @ApiParam({ name: "slug", example: "top-5-benefits-of-organic-cashew-nuts" })
  @ApiResponse({ status: 200, type: BlogDetailDto })
  detail(@Param("slug") slug: string): Promise<BlogDetailDto> {
    return this.blogsService.publicDetail(slug);
  }
}
