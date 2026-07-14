import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QuoteResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  code!: string;

  // Customer Information
  @ApiProperty()
  customerName!: string;

  @ApiPropertyOptional()
  companyName!: string | null;

  @ApiProperty()
  country!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone!: string | null;

  @ApiPropertyOptional()
  whatsapp!: string | null;

  // Product Information
  @ApiPropertyOptional()
  productId!: string | null;

  @ApiPropertyOptional({
    description: "Where the product comes from. 'catalog' → productId is the source of truth. 'others' → productName was free-text.",
    enum: ["catalog", "others"],
  })
  productSource!: "catalog" | "others" | null;

  @ApiPropertyOptional()
  productName!: string | null;

  @ApiPropertyOptional()
  quantity!: string | null;

  // Preferred price terms
  @ApiPropertyOptional({
    description: "FK to a TradeTerm row when the customer picked from the BE list.",
  })
  tradeTermId!: number | null;

  @ApiPropertyOptional({
    description:
      "Display value for the price-terms preference. Resolved at write time " +
      "from TradeTerm.name (if id was set) or the customer's free-form text. " +
      "Stays readable even if the underlying TradeTerm is later renamed.",
  })
  tradeTermName!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  // Quote Response
  @ApiProperty()
  contacted!: boolean;

  // Staff
  @ApiPropertyOptional()
  assignedToId!: string | null;

  @ApiPropertyOptional()
  assignedToName!: string | null;

  // Timestamps
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class QuoteListResponseDto {
  @ApiProperty({ type: [QuoteResponseDto] })
  data!: QuoteResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class QuotePublicResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;
}
