import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { QuotesService } from "./quotes.service";
import { CreateQuoteDto, UpdateQuoteDto } from "./dto/quote-request.dto";
import {
  QuoteResponseDto,
  QuoteListResponseDto,
  QuotePublicResponseDto,
} from "./dto/quote-response.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";

@ApiTags("Quotes")
@Controller()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Public endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  @Post("quotes")
  @ApiOperation({ summary: "Submit a quote request" })
  @ApiResponse({ status: 201, type: QuotePublicResponseDto })
  async create(@Body() dto: CreateQuoteDto): Promise<QuotePublicResponseDto> {
    return this.quotesService.create(dto);
  }

  @Get("quotes/:code")
  @ApiOperation({ summary: "Get quote status by code" })
  @ApiParam({ name: "code", example: "QT-2026-00001" })
  @ApiResponse({ status: 200, type: QuotePublicResponseDto })
  async getByCode(@Param("code") code: string): Promise<QuotePublicResponseDto> {
    return this.quotesService.getByCode(code);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff endpoints (protected)
  // ─────────────────────────────────────────────────────────────────────────────

  @Get("staff/quotes")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all quotes (staff)" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "assignedToId", required: false, type: String })
  @ApiQuery({
    name: "mine",
    required: false,
    type: Boolean,
    description: "When true, restricts results to quotes assigned to the caller.",
  })
  @ApiResponse({ status: 200, type: QuoteListResponseDto })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("assignedToId") assignedToId?: string,
    @Query("mine") mine?: string,
    @Request() req?: any,
  ): Promise<QuoteListResponseDto> {
    const callerId = req?.user?.sub as string | undefined;
    const isMine =
      mine === "true" || mine === "1" || mine === "yes";

    // Priority: explicit assignedToId wins over `mine`.
    // If `mine=true` and no explicit assignedToId, filter by caller.
    let resolvedAssignedToId: string | null | undefined;
    if (assignedToId !== undefined && assignedToId !== null && assignedToId !== "") {
      resolvedAssignedToId = assignedToId;
    } else if (isMine) {
      resolvedAssignedToId = callerId ?? null;
      if (!resolvedAssignedToId) {
        throw new UnauthorizedException(
          "Cannot resolve caller from token",
        );
      }
    }

    return this.quotesService.findAllStaff({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      assignedToId: resolvedAssignedToId,
    });
  }

  @Get("staff/quotes/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get quote details (staff)" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<QuoteResponseDto> {
    return this.quotesService.findOneStaff(id);
  }

  @Put("staff/quotes/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update quote (staff)" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteDto,
    @Request() req: any,
  ): Promise<QuoteResponseDto> {
    const staffId = req.user?.id ?? "system";
    return this.quotesService.updateStaff(id, dto, staffId);
  }

  @Put("staff/quotes/:id/contacted")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Toggle contacted flag (true ↔ false) on a quote",
  })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  async toggleContacted(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<QuoteResponseDto> {
    return this.quotesService.toggleContacted(id);
  }

  @Put("staff/quotes/:id/assign")
  @UseGuards(JwtAuthGuard, StaffRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Toggle assignment for the calling staff: assigns to self if not yet assigned, unassigns if currently assigned to self. If assigned to another staff, it is claimed (reassigned to the caller).",
  })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  @ApiResponse({ status: 401, description: "Missing or invalid token" })
  @ApiResponse({ status: 403, description: "Caller is not staff/admin" })
  @ApiResponse({ status: 404, description: "Quote not found" })
  async assign(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<QuoteResponseDto> {
    const callerId = req.user?.sub;
    if (!callerId) {
      throw new UnauthorizedException("Invalid token: missing subject");
    }

    return this.quotesService.toggleAssignment(id, callerId);
  }

  @Delete("staff/quotes/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete quote (staff)" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 204 })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.quotesService.delete(id);
  }
}
