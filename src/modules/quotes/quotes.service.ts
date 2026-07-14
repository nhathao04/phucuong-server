import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Quote } from "./entities/quote.entity";
import { Product } from "../products/entities/product.entity";
import { TradeTerm } from "../products/entities/trade-term.entity";
import { User } from "../users/entities/user.entity";
import {
  CreateQuoteDto,
  ProductSource,
  UpdateQuoteDto,
} from "./dto/quote-request.dto";
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
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(TradeTerm)
    private readonly tradeTermRepo: Repository<TradeTerm>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Public: Customer submits a quote request
  // ─────────────────────────────────────────────────────────────────────────────

  async create(dto: CreateQuoteDto): Promise<QuotePublicResponseDto> {
    // Resolve productSource:
    //   - if FE sent it explicitly, trust it
    //   - otherwise infer from productId presence:
    //       productId non-empty → catalog
    //       productId empty/absent → others
    const effectiveSource: ProductSource =
      dto.productSource ??
      (dto.productId && dto.productId.length > 0
        ? ProductSource.CATALOG
        : ProductSource.OTHERS);

    let normalizedProductId: string | null = null;
    let normalizedProductName: string | null = null;

    if (effectiveSource === ProductSource.CATALOG) {
      if (!dto.productId) {
        throw new BadRequestException(
          "productId is required when productSource='catalog'",
        );
      }
      const productExists = await this.productRepo.exist({
        where: { id: dto.productId },
      });
      if (!productExists) {
        throw new BadRequestException(`Product ${dto.productId} not found`);
      }
      normalizedProductId = dto.productId;
      normalizedProductName = dto.productName?.trim() || null;
    } else {
      if (dto.productId) {
        throw new BadRequestException(
          "productId must be omitted when productSource='others'",
        );
      }
      if (!dto.productName || dto.productName.trim().length === 0) {
        throw new BadRequestException(
          "productName is required when productSource='others'",
        );
      }
      normalizedProductName = dto.productName.trim();
    }

    // Resolve preferred price terms into a single display value stored in
    // `tradeTermName`:
    //   - tradeTermId present  → validate FK exists & is active, persist
    //                            `TradeTerm.name`. Any free-form text sent
    //                            alongside is ignored.
    //   - tradeTermId absent + tradeTermName non-empty → persist the text
    //                            verbatim (e.g. "Not sure - need advise")
    //   - both absent → leave null (no preference declared)
    let normalizedTradeTermId: number | null = null;
    let normalizedTradeTermName: string | null = null;

    if (dto.tradeTermId !== undefined && dto.tradeTermId !== null) {
      const term = await this.tradeTermRepo.findOne({
        where: { id: dto.tradeTermId },
      });
      if (!term) {
        throw new BadRequestException(
          `Trade term ${dto.tradeTermId} not found`,
        );
      }
      if (term.isActive === false) {
        throw new BadRequestException(
          `Trade term '${term.name}' is inactive and cannot be selected`,
        );
      }
      normalizedTradeTermId = term.id;
      normalizedTradeTermName = term.name;
    } else if (
      dto.tradeTermName !== undefined &&
      dto.tradeTermName.trim().length > 0
    ) {
      normalizedTradeTermName = dto.tradeTermName.trim();
    }

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
      productSource: effectiveSource,
      productId: normalizedProductId,
      productName: normalizedProductName,
      quantity: dto.quantity ?? null,
      tradeTermId: normalizedTradeTermId,
      tradeTermName: normalizedTradeTermName,
      notes: dto.notes ?? null,
    });

    const saved = await this.quoteRepo.save(quote);

    return {
      id: saved.id,
      code: saved.code,
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
      message: quote.contacted
        ? "Our sales team has already reached out to you regarding this quote. Please check your email for the latest update."
        : "Your quote request is being reviewed. We will respond within 24 hours.",
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: List all quotes with pagination and filters
  // ─────────────────────────────────────────────────────────────────────────────

  async findAllStaff(params: {
    page?: number;
    limit?: number;
    search?: string;
    assignedToId?: string | null;
  }): Promise<QuoteListResponseDto> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.quoteRepo
      .createQueryBuilder("quote")
      .leftJoinAndSelect("quote.assignedTo", "assignedTo")
      .leftJoinAndSelect("quote.tradeTerm", "tradeTerm");

    if (params.assignedToId !== undefined && params.assignedToId !== null) {
      qb.andWhere("quote.assignedToId = :assignedToId", {
        assignedToId: params.assignedToId,
      });
    }

    if (params.search) {
      qb.andWhere("quote.customerName ILIKE :search", {
        search: `%${params.search}%`,
      });
    }

    qb.orderBy("quote.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    const [quotes, total] = await qb.getManyAndCount();

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
      relations: ["assignedTo", "tradeTerm"],
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return this.toResponseDto(quote);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Update quote (legacy generic update — kept for future-proofing)
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
  // Staff: Toggle contacted flag (true ↔ false)
  // ─────────────────────────────────────────────────────────────────────────────

  async toggleContacted(id: number): Promise<QuoteResponseDto> {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    quote.contacted = !quote.contacted;
    await this.quoteRepo.save(quote);

    return this.findOneStaff(id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Toggle assignment based on the caller's identity (from JWT)
  //   - assignedToId === null      → assign to caller
  //   - assignedToId === callerId  → unassign
  //   - assignedToId === otherId   → reassign to caller (claim)
  // ─────────────────────────────────────────────────────────────────────────────

  async toggleAssignment(
    id: number,
    callerId: string,
  ): Promise<QuoteResponseDto> {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Quote ${id} not found`);
    }

    let nextAssignee: string | null;
    if (quote.assignedToId === null) {
      nextAssignee = callerId;
    } else if (quote.assignedToId === callerId) {
      nextAssignee = null;
    } else {
      nextAssignee = callerId;
    }

    if (nextAssignee === null) {
      quote.assignedToId = null;
      quote.assignedTo = null;
    } else {
      const user = await this.userRepo.findOne({
        where: { id: nextAssignee },
      });
      if (!user || user.isActive === false) {
        throw new NotFoundException(
          `Staff user ${nextAssignee} not found or inactive`,
        );
      }
      quote.assignedToId = nextAssignee;
      quote.assignedTo = user;
    }

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
    // `tradeTermName` is the persisted display value — it already reflects
    // either the TradeTerm snapshot or the customer's free-form text. We
    // prefer the live TradeTerm.name when the relation is joined, so staff
    // UI shows renames immediately for current quotes, while the persisted
    // column keeps historical rows readable if the relation is gone.
    const tradeTermName: string | null =
      quote.tradeTerm?.name ?? quote.tradeTermName ?? null;

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
      productSource: quote.productSource,
      productName: quote.productName,
      quantity: quote.quantity,
      tradeTermId: quote.tradeTermId,
      tradeTermName,
      notes: quote.notes,
      contacted: quote.contacted,
      assignedToId: quote.assignedToId,
      assignedToName: quote.assignedTo?.fullName ?? null,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };
  }
}
