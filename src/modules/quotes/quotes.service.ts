import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In } from "typeorm";
import { Quote, QuoteStatus } from "./entities/quote.entity";
import { QuoteItem } from "./entities/quote-item.entity";
import { QuoteCertificate } from "./entities/quote-certificate.entity";
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
    @InjectRepository(QuoteItem)
    private readonly quoteItemRepo: Repository<QuoteItem>,
    @InjectRepository(QuoteCertificate)
    private readonly quoteCertRepo: Repository<QuoteCertificate>,
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
      containerType: dto.containerType ?? null,
      notes: dto.notes ?? null,
      status: QuoteStatus.PENDING,
    });

    const saved = await this.quoteRepo.save(quote);

    // Save quote items if provided
    if (dto.items && dto.items.length > 0) {
      await this.saveQuoteItems(saved.id, dto.items);
    }

    // Save certificates if provided
    if (dto.certificateIds && dto.certificateIds.length > 0) {
      await this.saveQuoteCertificates(saved.id, dto.certificateIds);
    }

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
      relations: ["items", "certificates", "certificates.certificate", "assignedTo"],
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
      relations: [
        "items",
        "certificates",
        "certificates.certificate",
        "assignedTo",
        "quotedBy",
      ],
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return this.toResponseDto(quote);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Staff: Update quote (add quote price, assign staff, change status)
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

    // Update fields
    if (dto.status) {
      quote.status = dto.status as QuoteStatus;
    }

    if (dto.quotedPrice !== undefined) {
      quote.quotedPrice = dto.quotedPrice?.toString() ?? null;
    }

    if (dto.priceUnit) {
      quote.priceUnit = dto.priceUnit;
    }

    if (dto.validUntil) {
      quote.validUntil = new Date(dto.validUntil);
    }

    if (dto.staffNotes) {
      quote.staffNotes = dto.staffNotes;
    }

    // Update items
    if (dto.items) {
      await this.quoteItemRepo.delete({ quoteId: id });
      if (dto.items.length > 0) {
        await this.saveQuoteItems(id, dto.items);
      }
    }

    // If status changes to QUOTED, set quotedBy and quotedAt
    if (dto.status === QuoteStatus.QUOTED && quote.status !== QuoteStatus.QUOTED) {
      quote.quotedById = staffId;
      quote.quotedAt = new Date();
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

  private async saveQuoteItems(
    quoteId: number,
    items: Array<{
      productId?: string;
      productName: string;
      quantity?: string;
      unit?: string;
      unitPrice?: number;
      specifications?: string;
    }>,
  ): Promise<void> {
    for (const item of items) {
      const quoteItem = this.quoteItemRepo.create({
        quoteId,
        productId: item.productId ?? null,
        productName: item.productName,
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        unitPrice: item.unitPrice?.toString() ?? null,
        totalPrice: item.unitPrice && item.quantity
          ? (item.unitPrice * parseFloat(item.quantity)).toString()
          : null,
        specifications: item.specifications ?? null,
      });
      await this.quoteItemRepo.save(quoteItem);
    }
  }

  private async saveQuoteCertificates(
    quoteId: number,
    certificateIds: string[],
  ): Promise<void> {
    for (const certId of certificateIds) {
      const qc = this.quoteCertRepo.create({
        quoteId,
        certificateId: certId,
      });
      await this.quoteCertRepo.save(qc);
    }
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
      containerType: quote.containerType,
      notes: quote.notes,
      status: quote.status,
      quotedPrice: quote.quotedPrice,
      priceUnit: quote.priceUnit,
      validUntil: quote.validUntil,
      staffNotes: quote.staffNotes,
      assignedToId: quote.assignedToId,
      assignedToName: quote.assignedTo?.fullName ?? null,
      quotedById: quote.quotedById,
      quotedByName: quote.quotedBy?.fullName ?? null,
      quotedAt: quote.quotedAt,
      items: (quote.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specifications: item.specifications,
      })),
      certificates: (quote.certificates ?? []).map((qc) => ({
        id: qc.id,
        certificateId: qc.certificateId,
        name: qc.certificate?.name ?? "",
      })),
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
