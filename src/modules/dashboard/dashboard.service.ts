import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Product, ProductStatus } from "../products/entities/product.entity";
import { Inquiry } from "../inquiries/entities/inquiry.entity";
import { InquiryFormStatus, InquiryStatus } from "../inquiries/entities/inquiry.enums";
import { InquiryActivity } from "../inquiries/entities/inquiry-activity.entity";
import { User } from "../users/entities/user.entity";

import {
  DashboardCountCardDto,
  DashboardInquiryStatusSliceDto,
  DashboardInquiryTrendPointDto,
  DashboardProductStatusSliceDto,
  DashboardRecentActivityDto,
  DashboardSummaryDto,
  DashboardTopProductDto,
} from "./dto/dashboard-response.dto";

const TREND_MONTHS = 12;
const TOP_PRODUCTS_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 10;
const TASKS_TERMINAL_STATUSES = [
  InquiryStatus.CLOSED,
  InquiryStatus.CANCELLED,
];

type StatusGroup = "draft" | "submitted";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Inquiry)
    private readonly inquiriesRepository: Repository<Inquiry>,
    @InjectRepository(InquiryActivity)
    private readonly activitiesRepository: Repository<InquiryActivity>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const [
      counts,
      productStatus,
      inquiryStatus,
      inquiryTrends,
      topProducts,
      recentActivities,
    ] = await Promise.all([
      this.loadCounts(),
      this.loadProductStatus(),
      this.loadInquiryStatus(),
      this.loadInquiryTrends(),
      this.loadTopProducts(),
      this.loadRecentActivities(),
    ]);

    return {
      counts,
      productStatus,
      inquiryStatus,
      inquiryTrends,
      topProducts,
      recentActivities,
    };
  }

  private async loadCounts(): Promise<DashboardCountCardDto> {
    const productsCount = await this.productsRepository.count();
    const inquiriesCount = await this.inquiriesRepository.count();

    const tasksCount = await this.inquiriesRepository
      .createQueryBuilder("inquiry")
      .where("inquiry.status NOT IN (:...terminals)", {
        terminals: TASKS_TERMINAL_STATUSES,
      })
      .getCount();

    const teamMembersCount = await this.usersRepository.count({
      where: { isActive: true },
    });

    return {
      products: productsCount,
      inquiries: inquiriesCount,
      tasks: tasksCount,
      teamMembers: teamMembersCount,
    };
  }

  private async loadProductStatus(): Promise<DashboardProductStatusSliceDto> {
    const rows = await this.productsRepository
      .createQueryBuilder("product")
      .select("product.status", "status")
      .addSelect("product.isActive", "isActive")
      .addSelect("COUNT(*)", "count")
      .groupBy("product.status")
      .addGroupBy("product.isActive")
      .getRawMany<{
        status: ProductStatus;
        isActive: boolean;
        count: string;
      }>();

    let active = 0;
    let draft = 0;
    let archived = 0;

    for (const row of rows) {
      const count = Number(row.count);
      if (row.status === ProductStatus.PUBLISHED && row.isActive) {
        active += count;
      } else if (row.status === ProductStatus.DRAFT) {
        draft += count;
      } else if (row.status === ProductStatus.HIDDEN) {
        archived += count;
      } else if (
        row.status === ProductStatus.PUBLISHED &&
        !row.isActive
      ) {
        archived += count;
      }
    }

    return { active, draft, archived };
  }

  private groupInquiryStatus(
    formStatus: InquiryFormStatus | null,
    salesStatus: string | null,
  ): StatusGroup {
    if (formStatus === InquiryFormStatus.SUBMITTED) return "submitted";
    if (formStatus === null || formStatus === undefined) return "draft";
    return "draft";
  }

  private async loadInquiryStatus(): Promise<DashboardInquiryStatusSliceDto> {
    const rows = await this.inquiriesRepository
      .createQueryBuilder("inquiry")
      .select("inquiry.formStatus", "formStatus")
      .addSelect("COUNT(*)", "count")
      .groupBy("inquiry.formStatus")
      .getRawMany<{ formStatus: InquiryFormStatus | null; count: string }>();

    let draft = 0;
    let submitted = 0;

    for (const row of rows) {
      const count = Number(row.count);
      const group = this.groupInquiryStatus(row.formStatus, null);
      if (group === "draft") draft += count;
      else submitted += count;
    }

    return { draft, submitted };
  }

  private async loadInquiryTrends(): Promise<DashboardInquiryTrendPointDto[]> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (TREND_MONTHS - 1), 1);

    const createdRows = await this.inquiriesRepository
      .createQueryBuilder("inquiry")
      .select("to_char(inquiry.createdAt, 'YYYY-MM')", "month")
      .addSelect("COUNT(*)", "count")
      .where("inquiry.createdAt >= :start", { start })
      .groupBy("month")
      .getRawMany<{ month: string; count: string }>();

    const submittedRows = await this.inquiriesRepository
      .createQueryBuilder("inquiry")
      .select("to_char(inquiry.submittedAt, 'YYYY-MM')", "month")
      .addSelect("COUNT(*)", "count")
      .where("inquiry.submittedAt IS NOT NULL")
      .andWhere("inquiry.submittedAt >= :start", { start })
      .groupBy("month")
      .getRawMany<{ month: string; count: string }>();

    const createdMap = new Map(
      createdRows.map((r) => [r.month, Number(r.count)]),
    );
    const submittedMap = new Map(
      submittedRows.map((r) => [r.month, Number(r.count)]),
    );

    const points: DashboardInquiryTrendPointDto[] = [];
    for (let i = 0; i < TREND_MONTHS; i += 1) {
      const cursor = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      points.push({
        month,
        newCount: createdMap.get(month) ?? 0,
        completedCount: submittedMap.get(month) ?? 0,
      });
    }
    return points;
  }

  private async loadTopProducts(): Promise<DashboardTopProductDto[]> {
    const rows = await this.inquiriesRepository
      .createQueryBuilder("inquiry")
      .select("inquiry.productId", "productId")
      .addSelect("COUNT(*)", "count")
      .where("inquiry.productId IS NOT NULL")
      .groupBy("inquiry.productId")
      .orderBy("count", "DESC")
      .limit(TOP_PRODUCTS_LIMIT)
      .getRawMany<{ productId: string; count: string }>();

    if (rows.length === 0) return [];

    const productIds = rows.map((r) => r.productId);
    const products = await this.productsRepository.find({
      where: productIds.map((id) => ({ id })),
      select: ["id", "name", "slug"],
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return rows.map((row) => {
      const product = productMap.get(row.productId);
      return {
        productId: row.productId,
        productName: product?.name ?? "(deleted product)",
        productSlug: product?.slug ?? "",
        inquiryCount: Number(row.count),
      };
    });
  }

  private async loadRecentActivities(): Promise<DashboardRecentActivityDto[]> {
    const activities = await this.activitiesRepository
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.inquiry", "inquiry")
      .leftJoin("inquiry.contactedBy", "actor")
      .addSelect([
        "actor.id",
        "actor.fullName",
        "actor.avatarUrl",
      ])
      .orderBy("activity.createdAt", "DESC")
      .limit(RECENT_ACTIVITY_LIMIT)
      .getMany();

    const userIds = Array.from(
      new Set(
        activities
          .map((a) => a.createdByUserId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const users = userIds.length
      ? await this.usersRepository.find({
          where: userIds.map((id) => ({ id })),
          select: ["id", "fullName", "avatarUrl"],
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return activities.map((a) => {
      const actor = a.createdByUserId
        ? userMap.get(a.createdByUserId)
        : null;
      return {
        id: a.id,
        action: a.action,
        description: a.description,
        stepNo: a.stepNo ?? null,
        actorUserId: a.createdByUserId ?? null,
        actorFullName: actor?.fullName ?? null,
        actorAvatarUrl: actor?.avatarUrl ?? null,
        inquiryId: a.inquiryId,
        inquiryCode: a.inquiry?.code ?? null,
        occurredAt: a.createdAt,
      };
    });
  }
}