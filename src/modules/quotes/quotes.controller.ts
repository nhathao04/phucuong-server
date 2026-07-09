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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { QuotesService } from "./quotes.service";
import { CreateQuoteDto, UpdateQuoteDto } from "./dto/quote-request.dto";
import {
  QuoteResponseDto,
  QuoteListResponseDto,
  QuotePublicResponseDto,
} from "./dto/quote-response.dto";
import { QuoteStatus } from "./entities/quote.entity";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

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
  @ApiResponse({ status: 200, type: QuoteListResponseDto })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("status") status?: QuoteStatus,
    @Query("search") search?: string,
    @Query("assignedToId") assignedToId?: string,
  ): Promise<QuoteListResponseDto> {
    return this.quotesService.findAllStaff({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      search,
      assignedToId,
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

  @Put("staff/quotes/:id/assign")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign quote to staff" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  async assign(
    @Param("id", ParseIntPipe) id: number,
    @Body("assignedToId") assignedToId: string,
  ): Promise<QuoteResponseDto> {
    return this.quotesService.assignQuote(id, assignedToId);
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
