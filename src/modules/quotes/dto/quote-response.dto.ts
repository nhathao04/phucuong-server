import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { QuoteStatus } from "../entities/quote.entity";

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

  @ApiPropertyOptional()
  productName!: string | null;

  @ApiPropertyOptional()
  quantity!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  // Quote Response
  @ApiProperty({ enum: QuoteStatus })
  status!: QuoteStatus;

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
  status!: QuoteStatus;

  @ApiProperty()
  message!: string;
}
