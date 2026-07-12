import { ApiProperty } from "@nestjs/swagger";

export class DashboardCountCardDto {
  @ApiProperty({ example: 13, description: "Total products in catalog." })
  products!: number;

  @ApiProperty({ example: 27, description: "Total inquiries (all statuses)." })
  inquiries!: number;

  @ApiProperty({
    example: 7,
    description:
      "Open tasks — count of inquiries not yet CLOSED / CANCELLED.",
  })
  tasks!: number;

  @ApiProperty({
    example: 5,
    description: "Team members — count of users with isActive = true.",
  })
  teamMembers!: number;
}

export class DashboardProductStatusSliceDto {
  @ApiProperty({ example: 9, description: "isActive = true AND status = 'published'." })
  active!: number;

  @ApiProperty({ example: 3, description: "status = 'draft'." })
  draft!: number;

  @ApiProperty({ example: 1, description: "status = 'hidden' (catalog-archived)." })
  archived!: number;
}

export class DashboardInquiryStatusSliceDto {
  @ApiProperty({
    example: 4,
    description: "InquirySalesStatus.NEW or InquiryStatus.DRAFT (in progress, not yet submitted).",
  })
  draft!: number;

  @ApiProperty({
    example: 18,
    description:
      "InquiryFormStatus.SUBMITTED / InquirySalesStatus beyond NEW (sales pipeline past submission).",
  })
  submitted!: number;
}

export class DashboardInquiryTrendPointDto {
  @ApiProperty({ example: "2026-01" })
  month!: string;

  @ApiProperty({ example: 5, description: "Inquiries created in this month." })
  newCount!: number;

  @ApiProperty({
    example: 3,
    description: "Inquiries that reached SUBMITTED in this month.",
  })
  completedCount!: number;
}

export class DashboardTopProductDto {
  @ApiProperty({ example: "5e4e65c3-ca11-4224-b064-33b963e58a67" })
  productId!: string;

  @ApiProperty({ example: "Semi-Husked Coconut" })
  productName!: string;

  @ApiProperty({ example: "semi-husked-coconut" })
  productSlug!: string;

  @ApiProperty({ example: 12, description: "Number of inquiries referencing this product." })
  inquiryCount!: number;
}

export class DashboardRecentActivityDto {
  @ApiProperty({ example: "9f3e8a2c-…" })
  id!: string;

  @ApiProperty({
    example: "step_completed",
    description: "InquiryActivityAction enum value.",
  })
  action!: string;

  @ApiProperty({
    example: "Customer completed step 2 (commercial terms).",
  })
  description!: string;

  @ApiProperty({ example: 2, nullable: true, description: "Step number when applicable." })
  stepNo!: number | null;

  @ApiProperty({
    example: "9c2d2f0a-…",
    nullable: true,
    description: "User id of actor (null = system/auto-save).",
  })
  actorUserId!: string | null;

  @ApiProperty({
    example: "Lê Hạo",
    nullable: true,
    description: "Actor full name joined from users table.",
  })
  actorFullName!: string | null;

  @ApiProperty({
    example: "https://cdn.example.com/avatars/hao.webp",
    nullable: true,
  })
  actorAvatarUrl!: string | null;

  @ApiProperty({
    example: "5e4e65c3-ca11-4224-b064-33b963e58a67",
    nullable: true,
    description: "Related inquiry id (activities are scoped to inquiries).",
  })
  inquiryId!: string | null;

  @ApiProperty({ example: "SHC-20260711-0001", nullable: true })
  inquiryCode!: string | null;

  @ApiProperty({ example: "2026-07-11T14:23:11.000Z" })
  occurredAt!: Date;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: DashboardCountCardDto })
  counts!: DashboardCountCardDto;

  @ApiProperty({ type: DashboardProductStatusSliceDto })
  productStatus!: DashboardProductStatusSliceDto;

  @ApiProperty({ type: DashboardInquiryStatusSliceDto })
  inquiryStatus!: DashboardInquiryStatusSliceDto;

  @ApiProperty({
    type: [DashboardInquiryTrendPointDto],
    description: "12 monthly buckets, oldest first.",
  })
  inquiryTrends!: DashboardInquiryTrendPointDto[];

  @ApiProperty({
    type: [DashboardTopProductDto],
    description: "Top 5 products by inquiry count, descending.",
  })
  topProducts!: DashboardTopProductDto[];

  @ApiProperty({
    type: [DashboardRecentActivityDto],
    description: "Latest 10 inquiry activities across all staff/admin actions.",
  })
  recentActivities!: DashboardRecentActivityDto[];
}