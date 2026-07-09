import {
  Injectable,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Quote, QuoteStatus } from "./entities/quote.entity";
import { User } from "../users/entities/user.entity";
import { CreateQuoteDto, UpdateQuoteDto } from "./dto/quote-request.dto";
import {
  QuoteResponseDto,
  QuoteListResponseDto,
  QuotePublicResponseDto,
} from "./dto/quote-response.dto";

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepo: Repository<Quote>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Public: Customer submits a quote request
  // ─────────────────────────────────────────────────────────────────────────────

  async create(dto: CreateQuoteDto): Promise<QuotePublicResponseDto> {
    // Generate unique quote code
    const code = await this.generateQuoteCode();

    // Create quote
    const quote = this.quoteRepo.create({
      code,
      customerName: dto.customerName,
      companyName: dto.companyName ?? null,
      country: dto.country,
      email: dto.email,
      phone: dto.phone ?? null,
      whatsapp: dto.whatsapp ?? null,
      productId: dto.productId ?? null,
      productName: dto.productName ?? null,
      quantity: dto.quantity ?? null,
      notes: dto.notes ?? null,
      status: QuoteStatus.PENDING,
    });

    const saved = await this.quoteRepo.save(quote);

    return {
      id: saved.id,
      code: saved.code,
      status: saved.status,
      message: `Quote request ${saved.code} submitted successfully. We will respond within 24 hours.`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public: Get quote by code
  // ─────────────────────────────────────────────────────────────────────────────

  async getByCode(code: string): Promise<QuotePublicResponseDto> {
    const quote = await this.quoteRepo.findOne({ where: { code } });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return {
      id: quote.id,
      code: quote.code,
      status: quote.status,
      message: this.getStatusMessage(quote),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: List all quotes with pagination and filters
  // ─────────────────────────────────────────────────────────────────────────────

  async findAllStaff(params: {
    page?: number;
    limit?: number;
    status?: QuoteStatus;
    search?: string;
    assignedToId?: string;
  }): Promise<QuoteListResponseDto> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.assignedToId) {
      where.assignedToId = params.assignedToId;
    }

    if (params.search) {
      where.customerName = Like(`%${params.search}%`);
    }

    const [quotes, total] = await this.quoteRepo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
      relations: ["assignedTo"],
    });

    return {
      data: quotes.map((q) => this.toResponseDto(q)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Get single quote by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findOneStaff(id: number): Promise<QuoteResponseDto> {
    const quote = await this.quoteRepo.findOne({
      where: { id },
      relations: ["assignedTo"],
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return this.toResponseDto(quote);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Update quote (mark as contacted)
  // ─────────────────────────────────────────────────────────────────────────────

  async updateStaff(
    id: number,
    dto: UpdateQuoteDto,
    staffId: string,
  ): Promise<QuoteResponseDto> {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    if (dto.contacted !== undefined) {
      quote.contacted = dto.contacted;
    }

    await this.quoteRepo.save(quote);

    return this.findOneStaff(id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Assign quote to a staff member
  // ─────────────────────────────────────────────────────────────────────────────

  async assignQuote(id: number, assignedToId: string): Promise<QuoteResponseDto> {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    const user = await this.userRepo.findOne({ where: { id: assignedToId } });
    if (!user) {
      throw new NotFoundException("Staff user not found");
    }

    quote.assignedToId = assignedToId;
    await this.quoteRepo.save(quote);

    return this.findOneStaff(id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Delete quote
  // ─────────────────────────────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    await this.quoteRepo.remove(quote);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateQuoteCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QT-${year}-`;

    // Find highest existing number for this year
    const lastQuote = await this.quoteRepo
      .createQueryBuilder("quote")
      .where("quote.code LIKE :prefix", { prefix: `${prefix}%` })
      .orderBy("quote.id", "DESC")
      .getOne();

    let nextNum = 1;
    if (lastQuote) {
      const lastNum = parseInt(lastQuote.code.replace(prefix, ""), 10);
      nextNum = lastNum + 1;
    }

    return `${prefix}${nextNum.toString().padStart(5, "0")}`;
  }

  private toResponseDto(quote: Quote): QuoteResponseDto {
    return {
      id: quote.id,
      code: quote.code,
      customerName: quote.customerName,
      companyName: quote.companyName,
      country: quote.country,
      email: quote.email,
      phone: quote.phone,
      whatsapp: quote.whatsapp,
      productId: quote.productId,
      productName: quote.productName,
      quantity: quote.quantity,
      notes: quote.notes,
      status: quote.status,
      contacted: quote.contacted,
      assignedToId: quote.assignedToId,
      assignedToName: quote.assignedTo?.fullName ?? null,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };
  }

  private getStatusMessage(quote: Quote): string {
    switch (quote.status) {
      case QuoteStatus.PENDING:
        return "Your quote request is being reviewed. We will respond within 24 hours.";
      case QuoteStatus.QUOTED:
        return "Your quote has been prepared. Check your email for details.";
      case QuoteStatus.REJECTED:
        return "Unfortunately, we cannot process this quote at this time.";
      case QuoteStatus.EXPIRED:
        return "This quote has expired. Please submit a new request.";
      default:
        return "";
    }
  }
}
