import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { QuoteStatus } from "../entities/quote.entity";

export class QuoteItemResponseDto {
  @ApiProperty()
  id!: number;

  @ApiPropertyOptional()
  productId!: string | null;

  @ApiProperty()
  productName!: string;

  @ApiPropertyOptional()
  quantity!: string | null;

  @ApiPropertyOptional()
  unit!: string | null;

  @ApiPropertyOptional()
  unitPrice!: string | null;

  @ApiPropertyOptional()
  totalPrice!: string | null;

  @ApiPropertyOptional()
  specifications!: string | null;
}

export class QuoteCertificateResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  certificateId!: string;

  @ApiProperty()
  name!: string;
}

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
  containerType!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  // Quote Response
  @ApiProperty({ enum: QuoteStatus })
  status!: QuoteStatus;

  @ApiPropertyOptional()
  quotedPrice!: string | null;

  @ApiPropertyOptional()
  priceUnit!: string | null;

  @ApiPropertyOptional()
  validUntil!: Date | null;

  @ApiPropertyOptional()
  staffNotes!: string | null;

  // Staff
  @ApiPropertyOptional()
  assignedToId!: string | null;

  @ApiPropertyOptional()
  assignedToName!: string | null;

  @ApiPropertyOptional()
  quotedById!: string | null;

  @ApiPropertyOptional()
  quotedByName!: string | null;

  @ApiPropertyOptional()
  quotedAt!: Date | null;

  // Relations
  @ApiPropertyOptional({ type: [QuoteItemResponseDto] })
  items!: QuoteItemResponseDto[];

  @ApiPropertyOptional({ type: [QuoteCertificateResponseDto] })
  certificates!: QuoteCertificateResponseDto[];

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
