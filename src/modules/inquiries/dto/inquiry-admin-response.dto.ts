import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InquiryListItemDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() code!: string | null;
  @ApiPropertyOptional() customerName!: string | null;
  @ApiPropertyOptional() companyName!: string | null;
  @ApiPropertyOptional() email!: string | null;
  @ApiPropertyOptional() productId!: string | null;
  @ApiPropertyOptional() productName!: string | null;
  @ApiPropertyOptional() destinationCountryId!: string | null;
  @ApiPropertyOptional() destinationCountry!: string | null;
  @ApiPropertyOptional() tradeTerm!: string | null;
  @ApiPropertyOptional() quantity!: string | null;
  @ApiPropertyOptional() quantityUnit!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() formStatus!: string;
  @ApiPropertyOptional() salesStatus!: string | null;
  @ApiProperty() currentStep!: number;
  @ApiProperty() isCompleted!: boolean;
  @ApiProperty() internalEmailSent!: boolean;
  @ApiProperty() customerEmailSent!: boolean;
  @ApiPropertyOptional() leadCapturedAt!: Date | null;
  @ApiPropertyOptional() submittedAt!: Date | null;
  @ApiPropertyOptional() utmSource!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class InquiryListResponseDto {
  @ApiProperty({ type: () => [InquiryListItemDto] }) items!: InquiryListItemDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}

export class InquiryDetailDto extends InquiryListItemDto {
  @ApiPropertyOptional() phone!: string | null;
  @ApiPropertyOptional() whatsapp!: string | null;
  @ApiPropertyOptional() ipAddress!: string | null;
  @ApiPropertyOptional() userAgent!: string | null;
  @ApiPropertyOptional() referrerUrl!: string | null;
  @ApiPropertyOptional() landingPageUrl!: string | null;
  @ApiPropertyOptional() notes!: string | null;
  @ApiPropertyOptional() internalNotes!: string | null;
  @ApiPropertyOptional() utmMedium!: string | null;
  @ApiPropertyOptional() utmCampaign!: string | null;
  @ApiPropertyOptional() internalEmailSentAt!: Date | null;
  @ApiPropertyOptional() customerEmailSentAt!: Date | null;
  @ApiPropertyOptional() lastStepSavedAt!: Date | null;
  @ApiPropertyOptional() step1CompletedAt!: Date | null;
  @ApiPropertyOptional() step2CompletedAt!: Date | null;
  @ApiPropertyOptional() step3CompletedAt!: Date | null;
  @ApiPropertyOptional() step4CompletedAt!: Date | null;
  @ApiProperty({ type: () => [InquiryActivityItemDto] }) activities!: InquiryActivityItemDto[];
  @ApiProperty({ type: () => [InquiryAssignmentItemDto] }) assignments!: InquiryAssignmentItemDto[];
}

export class InquiryActivityItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() action!: string;
  @ApiProperty() description!: string;
  @ApiPropertyOptional() createdByUserId!: string | null;
  @ApiProperty() createdAt!: Date;
}

export class InquiryAssignmentItemDto {
  @ApiProperty() id!: number;
  @ApiProperty() staffUserId!: string;
  @ApiPropertyOptional() staffName!: string | null;
  @ApiPropertyOptional() staffEmail!: string | null;
  @ApiProperty() role!: string;
  @ApiProperty() assignedAt!: Date;
  @ApiPropertyOptional() unassignedAt!: Date | null;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export class InquiryStatsCountsDto {
  @ApiProperty() total!: number;
  @ApiProperty() leads!: number;
  @ApiProperty() drafts!: number;
  @ApiProperty() submitted!: number;
  @ApiProperty() completed!: number;
  @ApiProperty() inProgress!: number;
  @ApiProperty() closed!: number;
  @ApiProperty() cancelled!: number;
}

export class InquiryFunnelStepDto {
  @ApiProperty() step!: number;
  @ApiProperty() reached!: number;
  @ApiProperty() convertedToNext!: number;
  @ApiProperty() conversionRate!: number;
}

export class InquiryStatsFunnelDto {
  @ApiProperty({ type: () => [InquiryFunnelStepDto] }) steps!: InquiryFunnelStepDto[];
  @ApiProperty() overallConversion!: number;
}

export class InquiryStatsByDayDto {
  @ApiProperty() date!: string;
  @ApiProperty() leads!: number;
  @ApiProperty() submitted!: number;
}

export class InquiryStatsByCountryDto {
  @ApiPropertyOptional() countryId!: string | null;
  @ApiProperty() countryName!: string;
  @ApiProperty() count!: number;
}

export class InquiryStatsByProductDto {
  @ApiProperty() productId!: string;
  @ApiProperty() productName!: string;
  @ApiProperty() count!: number;
}

export class InquiryStatsByStaffDto {
  @ApiProperty() staffUserId!: string;
  @ApiProperty() staffName!: string | null;
  @ApiProperty() assignedCount!: number;
  @ApiProperty() closedCount!: number;
}

export class InquiryStatsEmailDto {
  @ApiProperty() customerSent!: number;
  @ApiProperty() customerFailed!: number;
  @ApiProperty() internalSent!: number;
  @ApiProperty() internalFailed!: number;
  @ApiProperty() pendingOutbox!: number;
  @ApiProperty() failedOutbox!: number;
}

export class InquiryStatsDto {
  @ApiProperty({ type: () => InquiryStatsCountsDto }) counts!: InquiryStatsCountsDto;
  @ApiProperty({ type: () => InquiryStatsFunnelDto }) funnel!: InquiryStatsFunnelDto;
  @ApiProperty({ type: () => [InquiryStatsByDayDto] }) byDay!: InquiryStatsByDayDto[];
  @ApiProperty({ type: () => [InquiryStatsByCountryDto] }) topCountries!: InquiryStatsByCountryDto[];
  @ApiProperty({ type: () => [InquiryStatsByProductDto] }) topProducts!: InquiryStatsByProductDto[];
  @ApiProperty({ type: () => [InquiryStatsByStaffDto] }) byStaff!: InquiryStatsByStaffDto[];
  @ApiProperty({ type: () => InquiryStatsEmailDto }) emails!: InquiryStatsEmailDto;
  @ApiPropertyOptional() generatedAt?: Date;
}
