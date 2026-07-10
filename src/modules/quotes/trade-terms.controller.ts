import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ApiProperty } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TradeTerm } from "../products/entities/trade-term.entity";

export class TradeTermResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;
}

@ApiTags("Quotes")
@Controller("api/trade-terms")
export class TradeTermsController {
  constructor(
    @InjectRepository(TradeTerm)
    private readonly tradeTermRepo: Repository<TradeTerm>,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all trade terms (public)" })
  @ApiQuery({
    name: "activeOnly",
    required: false,
    type: Boolean,
    description: "Filter only active trade terms",
  })
  @ApiResponse({ status: 200, type: [TradeTermResponseDto] })
  async findAll(
    @Query("activeOnly") activeOnly?: string,
  ): Promise<TradeTermResponseDto[]> {
    const where: any = {};
    if (activeOnly === "true" || activeOnly === "1") {
      where.isActive = true;
    }

    const terms = await this.tradeTermRepo.find({
      where,
      order: { sortOrder: "ASC", name: "ASC" },
    });

    return terms.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      isActive: t.isActive,
      sortOrder: t.sortOrder,
    }));
  }
}
