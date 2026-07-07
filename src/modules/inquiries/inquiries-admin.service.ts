import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";

import { Inquiry } from "./entities/inquiry.entity";
import { InquiryActivity } from "./entities/inquiry-activity.entity";
import { InquiryAssignment } from "./entities/inquiry-assignment.entity";
import { AssignmentRole, InquiryActivityAction, EmailOutboxStatus, InquiryFormStatus, InquiryStatus } from "./entities/inquiry.enums";
import { Customer } from "../customers/entities/customer.entity";
import { Product } from "../products/entities/product.entity";
import { Country } from "../geography/entities/country.entity";
import { User } from "../users/entities/user.entity";

import { InquiryListQueryDto } from "./dto/inquiry-admin-query.dto";
import {
  AssignStaffDto,
  UpdateInquiryNotesDto,
  UpdateInquiryStatusDto,
} from "./dto/inquiry-admin-action.dto";
import {
  InquiryActivityItemDto,
  InquiryAssignmentItemDto,
  InquiryDetailDto,
  InquiryListItemDto,
  InquiryListResponseDto,
  InquiryStatsByCountryDto,
  InquiryStatsByDayDto,
  InquiryStatsByProductDto,
  InquiryStatsByStaffDto,
  InquiryStatsCountsDto,
  InquiryStatsDto,
  InquiryStatsEmailDto,
  InquiryStatsFunnelDto,
  InquiryFunnelStepDto,
} from "./dto/inquiry-admin-response.dto";
import { Notification } from "./entities/notification.entity";
import { EmailOutbox } from "./entities/email-outbox.entity";

interface JwtUserPayload {
  sub: string;
  email?: string;
  role?: string;
}

@Injectable()
export class InquiriesAdminService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(InquiryActivity)
    private readonly activityRepo: Repository<InquiryActivity>,
    @InjectRepository(InquiryAssignment)
    private readonly assignmentRepo: Repository<InquiryAssignment>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(EmailOutbox)
    private readonly emailOutboxRepo: Repository<EmailOutbox>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── LIST ──────────────────────────────────────────────────────────────────

  async list(query: InquiryListQueryDto): Promise<InquiryListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? "createdAt";
    const sortDir = (query.sortDir ?? "DESC").toUpperCase() as "ASC" | "DESC";

    const qb = this.inquiryRepo.createQueryBuilder("i");


    if (query.search) {
      const term = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb1) => {
          qb1
            .where("LOWER(i.code) LIKE :term", { term })
            .orWhere("LOWER(COALESCE(i.fullName, '')) LIKE :term", { term })
            .orWhere("LOWER(COALESCE(i.email, '')) LIKE :term", { term })
            .orWhere("LOWER(COALESCE(i.companyName, '')) LIKE :term", { term });
        }),
      );
    }

    if (query.status) qb.andWhere("i.status = :status", { status: query.status });
    if (query.formStatus) qb.andWhere("i.formStatus = :formStatus", { formStatus: query.formStatus });
    if (query.salesStatus) qb.andWhere("i.salesStatus = :salesStatus", { salesStatus: query.salesStatus });
    if (query.currentStep !== undefined) qb.andWhere("i.currentStep = :currentStep", { currentStep: query.currentStep });
    if (query.isSubmitted !== undefined) {
      qb.andWhere(
        query.isSubmitted
          ? "i.formStatus = :submittedStatus"
          : "i.formStatus <> :submittedStatus",
        { submittedStatus: InquiryFormStatus.SUBMITTED },
      );
    }
    if (query.hasLead !== undefined) {
      qb.andWhere(query.hasLead ? "i.leadCapturedAt IS NOT NULL" : "i.leadCapturedAt IS NULL");
    }
    if (query.destinationCountryId) {
      qb.andWhere("i.destinationCountryId = :destinationCountryId", {
        destinationCountryId: query.destinationCountryId,
      });
    }
    if (query.productId) qb.andWhere("i.productId = :productId", { productId: query.productId });
    if (query.customerId) qb.andWhere("i.customerId = :customerId", { customerId: query.customerId });
    if (query.utmSource) qb.andWhere("i.utmSource = :utmSource", { utmSource: query.utmSource });
    if (query.createdFrom) qb.andWhere("i.createdAt >= :createdFrom", { createdFrom: query.createdFrom });
    if (query.createdTo) qb.andWhere("i.createdAt <= :createdTo", { createdTo: query.createdTo });

    qb.orderBy(`i.${sortBy}`, sortDir).skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();

    // Hydrate product names in one go
    const productIds = Array.from(
      new Set(rows.map((r) => r.productId).filter((id): id is string => !!id)),
    );
    const products = productIds.length
      ? await this.productRepo.find({
          where: productIds.map((id) => ({ id })),
          select: ["id", "name"],
        })
      : [];
    const productNameMap = new Map(products.map((p) => [p.id, p.name] as const));

    const items: InquiryListItemDto[] = rows.map((row) => {
      const productName = row.productId
        ? productNameMap.get(row.productId) ?? null
        : null;
      return this.mapListItem(row, productName);
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // ── DETAIL ────────────────────────────────────────────────────────────────

  async getDetail(id: string): Promise<InquiryDetailDto> {
    const inquiry = await this.inquiryRepo.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    let productName: string | null = null;
    if (inquiry.productId) {
      const p = await this.productRepo.findOne({
        where: { id: inquiry.productId },
        select: ["id", "name"],
      });
      productName = p?.name ?? null;
    }

    const [activities, assignments] = await Promise.all([
      this.activityRepo.find({
        where: { inquiryId: id },
        order: { createdAt: "DESC" },
        take: 100,
      }),
      this.assignmentRepo.find({
        where: { inquiryId: id },
        order: { assignedAt: "DESC" },
      }),
    ]);

    const staffIds = assignments.map((a) => a.staffUserId);
    const staffUsers = staffIds.length
      ? await this.userRepo.find({
          where: staffIds.map((sid) => ({ id: sid })),
          select: ["id", "fullName", "email"],
        })
      : [];
    const staffMap = new Map(staffUsers.map((u) => [u.id, u] as const));

    return {
      ...this.mapListItem(inquiry, productName),
      phone: inquiry.phone,
      whatsapp: inquiry.whatsapp,
      ipAddress: inquiry.ipAddress ?? null,
      userAgent: inquiry.userAgent ?? null,
      referrerUrl: inquiry.referrerUrl ?? null,
      landingPageUrl: inquiry.landingPageUrl ?? null,
      notes: inquiry.notes ?? null,
      internalNotes: inquiry.internalNotes ?? null,
      utmMedium: inquiry.utmMedium ?? null,
      utmCampaign: inquiry.utmCampaign ?? null,
      internalEmailSentAt: inquiry.internalEmailSentAt ?? null,
      customerEmailSentAt: inquiry.customerEmailSentAt ?? null,
      lastStepSavedAt: inquiry.lastStepSavedAt ?? null,
      step1CompletedAt: inquiry.step1CompletedAt ?? null,
      step2CompletedAt: inquiry.step2CompletedAt ?? null,
      step3CompletedAt: inquiry.step3CompletedAt ?? null,
      step4CompletedAt: inquiry.step4CompletedAt ?? null,
      activities: activities.map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        createdByUserId: a.createdByUserId ?? null,
        createdAt: a.createdAt,
      })),
      assignments: assignments.map((asg) => {
        const user = staffMap.get(asg.staffUserId);
        return {
          id: asg.id,
          staffUserId: asg.staffUserId,
          staffName: user?.fullName ?? null,
          staffEmail: user?.email ?? null,
          role: asg.role,
          assignedAt: asg.assignedAt,
          unassignedAt: asg.unassignedAt ?? null,
        };
      }),
    };
  }

  // ── UPDATE STATUS ─────────────────────────────────────────────────────────

  async updateStatus(
    id: string,
    dto: UpdateInquiryStatusDto,
    actor: JwtUserPayload,
  ): Promise<InquiryDetailDto> {
    const inquiry = await this.inquiryRepo.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    const prevStatus = inquiry.status;
    const prevSales = inquiry.salesStatus;

    inquiry.status = dto.status;
    if (dto.salesStatus !== undefined) inquiry.salesStatus = dto.salesStatus;
    await this.inquiryRepo.save(inquiry);

    const desc =
      dto.note ??
      `Status changed: ${prevStatus}${prevSales ? ` / ${prevSales}` : ""} → ${dto.status}${dto.salesStatus ? ` / ${dto.salesStatus}` : ""}`;

    await this.activityRepo.save(
      this.activityRepo.create({
        inquiryId: id,
        action: InquiryActivityAction.CUSTOMER_CHANGED,
        description: desc,
        createdByUserId: actor.sub,
      }),
    );

    await this.notificationRepo.save(
      this.notificationRepo.create({
        inquiryId: id,
        title: `Status updated to ${dto.status}`,
        message: desc,
      }),
    );

    return this.getDetail(id);
  }

  // ── UPDATE NOTES ──────────────────────────────────────────────────────────

  async updateNotes(
    id: string,
    dto: UpdateInquiryNotesDto,
    actor: JwtUserPayload,
  ): Promise<InquiryDetailDto> {
    const inquiry = await this.inquiryRepo.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    if (dto.internalNotes !== undefined) inquiry.internalNotes = dto.internalNotes;
    await this.inquiryRepo.save(inquiry);

    if (dto.activityDescription) {
      await this.activityRepo.save(
        this.activityRepo.create({
          inquiryId: id,
          action: InquiryActivityAction.CUSTOMER_CHANGED,
          description: dto.activityDescription,
          createdByUserId: actor.sub,
        }),
      );
    }

    return this.getDetail(id);
  }

  // ── ASSIGN / UNASSIGN STAFF ───────────────────────────────────────────────

  async assignStaff(
    id: string,
    dto: AssignStaffDto,
    actor: JwtUserPayload,
  ): Promise<InquiryDetailDto> {
    const inquiry = await this.inquiryRepo.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    const staff = await this.userRepo.findOne({
      where: { id: dto.staffUserId },
      relations: { role: true },
    });
    if (!staff) throw new NotFoundException("Staff user not found");
    const roleName = staff.role?.name?.toLowerCase();
    if (roleName !== "admin" && roleName !== "staff") {
      throw new BadRequestException("User is not admin or staff");
    }

    await this.assignmentRepo.save(
      this.assignmentRepo.create({
        inquiryId: id,
        staffUserId: dto.staffUserId,
        role: roleName === "admin" ? AssignmentRole.ADMIN : AssignmentRole.STAFF,
      }),
    );

    const desc = dto.comment
      ? `Assigned to ${staff.fullName ?? staff.email}${dto.comment ? `: ${dto.comment}` : ""}`
      : `Assigned to ${staff.fullName ?? staff.email}`;

    await this.activityRepo.save(
      this.activityRepo.create({
        inquiryId: id,
        action: InquiryActivityAction.CUSTOMER_CHANGED,
        description: desc,
        createdByUserId: actor.sub,
      }),
    );

    return this.getDetail(id);
  }

  async unassignStaff(
    inquiryId: string,
    assignmentId: number,
    actor: JwtUserPayload,
  ): Promise<InquiryDetailDto> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, inquiryId },
    });
    if (!assignment) throw new NotFoundException("Assignment not found");

    assignment.unassignedAt = new Date();
    await this.assignmentRepo.save(assignment);

    await this.activityRepo.save(
      this.activityRepo.create({
        inquiryId,
        action: InquiryActivityAction.CUSTOMER_CHANGED,
        description: `Unassigned staff (assignment ${assignmentId})`,
        createdByUserId: actor.sub,
      }),
    );

    return this.getDetail(inquiryId);
  }

  // ── STATS ─────────────────────────────────────────────────────────────────

  async getStats(daysWindow = 30): Promise<InquiryStatsDto> {
    const since = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000);

    const [
      totals,
      byStep,
      daySeries,
      topCountries,
      topProducts,
      staffPerf,
      emails,
      emailsPending,
    ] = await Promise.all([
      this.countTotals(),
      this.buildFunnel(),
      this.buildDaySeries(since),
      this.buildTopCountries(10),
      this.buildTopProducts(10),
      this.buildStaffPerformance(10),
      this.countEmails(),
      Promise.all([
        this.emailOutboxRepo.count({ where: { status: EmailOutboxStatus.PENDING } }),
        this.emailOutboxRepo.count({ where: { status: EmailOutboxStatus.FAILED } }),
      ]),
    ]);

    const [pendingOutbox, failedOutbox] = emailsPending;

    return {
      counts: totals,
      funnel: byStep,
      byDay: daySeries,
      topCountries,
      topProducts,
      byStaff: staffPerf,
      emails: {
        ...emails,
        pendingOutbox,
        failedOutbox,
      },
      generatedAt: new Date(),
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private mapListItem(row: Inquiry, productName: string | null): InquiryListItemDto {
    return {
      id: row.id,
      code: row.code,
      customerName: row.fullName ?? null,
      companyName: row.companyName ?? null,
      email: row.email ?? null,
      productId: row.productId ?? null,
      productName,
      destinationCountryId: row.destinationCountryId ?? null,
      destinationCountry: row.destinationCountry ?? null,
      tradeTerm: row.tradeTerm ?? null,
      quantity: row.quantity !== undefined && row.quantity !== null ? String(row.quantity) : null,
      quantityUnit: row.quantityUnit ?? null,
      status: row.status,
      formStatus: row.formStatus,
      salesStatus: row.salesStatus ?? null,
      currentStep: row.currentStep,
      isCompleted: row.isCompleted,
      internalEmailSent: row.internalEmailSent,
      customerEmailSent: row.customerEmailSent,
      leadCapturedAt: row.leadCapturedAt ?? null,
      submittedAt: row.submittedAt ?? null,
      utmSource: row.utmSource ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async countTotals(): Promise<InquiryStatsCountsDto> {
    const rows = await this.inquiryRepo
      .createQueryBuilder("i")
      .select("i.status", "status")
      .addSelect("COUNT(*)", "count")
      .addSelect(
        "SUM(CASE WHEN i.leadCapturedAt IS NOT NULL THEN 1 ELSE 0 END)",
        "leads",
      )
      .addSelect(
        "SUM(CASE WHEN i.formStatus = :submitted THEN 1 ELSE 0 END)",
        "submitted",
      )
      .setParameter("submitted", InquiryFormStatus.SUBMITTED)
      .groupBy("i.status")
      .getRawMany<{ status: InquiryStatus; count: string; leads: string; submitted: string }>();

    const result: InquiryStatsCountsDto = {
      total: 0,
      leads: 0,
      drafts: 0,
      submitted: 0,
      completed: 0,
      inProgress: 0,
      closed: 0,
      cancelled: 0,
    };
    for (const r of rows) {
      const c = Number(r.count);
      result.total += c;
      result.leads += Number(r.leads ?? 0);
      result.submitted += Number(r.submitted ?? 0);
      switch (r.status) {
        case InquiryStatus.DRAFT:
          result.drafts += c;
          break;
        case InquiryStatus.CLOSED:
          result.closed += c;
          break;
        case InquiryStatus.CANCELLED:
          result.cancelled += c;
          break;
        case InquiryStatus.IN_PROGRESS:
        case InquiryStatus.PROCESSING:
          result.inProgress += c;
          break;
        case InquiryStatus.CONFIRMED_ORDER:
        case InquiryStatus.SUBMITTED:
          result.completed += c;
          break;
      }
    }
    return result;
  }

  private async buildFunnel(): Promise<InquiryStatsFunnelDto> {
    const counts = await this.inquiryRepo
      .createQueryBuilder("i")
      .select("i.currentStep", "step")
      .addSelect("COUNT(*)", "count")
      .groupBy("i.currentStep")
      .getRawMany<{ step: number; count: string }>();

    const stepMap = new Map<number, number>();
    counts.forEach((c) => stepMap.set(Number(c.step), Number(c.count)));

    const buildStep = (step: number, lastStep: number | null): InquiryFunnelStepDto => {
      const reached = stepMap.get(step) ?? 0;
      const lastCount = lastStep !== null ? stepMap.get(lastStep) ?? 0 : 0;
      const converted = Math.min(reached, lastCount);
      const rate = lastCount > 0 ? Math.round((converted / lastCount) * 1000) / 10 : 0;
      return { step, reached, convertedToNext: converted, conversionRate: rate };
    };

    const steps: InquiryFunnelStepDto[] = [
      buildStep(1, null),
      buildStep(2, 1),
      buildStep(3, 2),
      buildStep(4, 3),
    ];
    const last = stepMap.get(4) ?? 0;
    const first = stepMap.get(1) ?? 0;
    const overallConversion = first > 0 ? Math.round((last / first) * 1000) / 10 : 0;
    return { steps, overallConversion };
  }

  private async buildDaySeries(since: Date): Promise<InquiryStatsByDayDto[]> {
    const rows = await this.inquiryRepo
      .createQueryBuilder("i")
      .select(`to_char(date_trunc('day', i.createdAt), 'YYYY-MM-DD')`, "date")
      .addSelect("COUNT(*)", "count")
      .addSelect(
        "SUM(CASE WHEN i.formStatus = :submitted THEN 1 ELSE 0 END)",
        "submitted",
      )
      .where("i.createdAt >= :since", { since })
      .setParameter("submitted", InquiryFormStatus.SUBMITTED)
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany<{ date: string; count: string; submitted: string }>();

    return rows.map((r) => ({
      date: r.date,
      leads: Number(r.count),
      submitted: Number(r.submitted ?? 0),
    }));
  }

  private async buildTopCountries(limit: number): Promise<InquiryStatsByCountryDto[]> {
    const rows = await this.inquiryRepo
      .createQueryBuilder("i")
      .leftJoin(Country, "c", "c.id = i.destinationCountryId")
      .select("i.destinationCountryId", "countryId")
      .addSelect("COALESCE(c.name, i.destinationCountry, 'Unknown')", "countryName")
      .addSelect("COUNT(*)", "country_count")
      .where("i.destinationCountryId IS NOT NULL OR i.destinationCountry IS NOT NULL")
      .groupBy("i.destinationCountryId")
      .addGroupBy("c.name")
      .addGroupBy("i.destinationCountry")
      .orderBy("country_count", "DESC")
      .limit(limit)
      .getRawMany<{ countryId: string | null; countryName: string; country_count: string }>();

    return rows.map((r) => ({
      countryId: r.countryId,
      countryName: r.countryName,
      count: Number(r.country_count),
    }));
  }

  private async buildTopProducts(limit: number): Promise<InquiryStatsByProductDto[]> {
    const rows = await this.inquiryRepo
      .createQueryBuilder("i")
      .leftJoin(Product, "p", "p.id = i.productId")
      .select("i.productId", "productId")
      .addSelect("COALESCE(p.name, 'Unknown')", "productName")
      .addSelect("COUNT(*)", "product_count")
      .where("i.productId IS NOT NULL")
      .groupBy("i.productId")
      .addGroupBy("p.name")
      .orderBy("product_count", "DESC")
      .limit(limit)
      .getRawMany<{ productId: string; productName: string; product_count: string }>();

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      count: Number(r.product_count),
    }));
  }

  private async buildStaffPerformance(limit: number): Promise<InquiryStatsByStaffDto[]> {
    const closedA = InquiryStatus.CLOSED;
    const closedB = InquiryStatus.CONFIRMED_ORDER;
    const rows = await this.assignmentRepo
      .createQueryBuilder("a")
      .leftJoin(User, "u", "u.id = a.staffUserId")
      .leftJoin(Inquiry, "i", "i.id = a.inquiryId")
      .select("a.staffUserId", "staffUserId")
      .addSelect("u.fullName", "staffName")
      .addSelect("COUNT(*)", "assigned_count")
      .addSelect(
        'SUM(CASE WHEN i.status = :closedA OR i.status = :closedB THEN 1 ELSE 0 END)',
        "closed_count",
      )
      .where("a.unassignedAt IS NULL")
      .setParameter("closedA", closedA)
      .setParameter("closedB", closedB)
      .groupBy("a.staffUserId")
      .addGroupBy("u.fullName")
      .orderBy("assigned_count", "DESC")
      .limit(limit)
      .getRawMany<{ staffUserId: string; staffName: string | null; assigned_count: string; closed_count: string }>();

    return rows.map((r) => ({
      staffUserId: r.staffUserId,
      staffName: r.staffName,
      assignedCount: Number(r.assigned_count),
      closedCount: Number(r.closed_count ?? 0),
    }));
  }

  private async countEmails(): Promise<InquiryStatsEmailDto> {
    const rows = await this.inquiryRepo
      .createQueryBuilder("i")
      .select(
        "SUM(CASE WHEN i.customerEmailSent = true THEN 1 ELSE 0 END)",
        "customerSent",
      )
      .addSelect(
        "SUM(CASE WHEN i.customerEmailSent = false AND i.submittedAt IS NOT NULL THEN 1 ELSE 0 END)",
        "customerFailed",
      )
      .addSelect(
        "SUM(CASE WHEN i.internalEmailSent = true THEN 1 ELSE 0 END)",
        "internalSent",
      )
      .addSelect(
        "SUM(CASE WHEN i.internalEmailSent = false AND i.leadCapturedAt IS NOT NULL THEN 1 ELSE 0 END)",
        "internalFailed",
      )
      .getRawOne<{
        customerSent: string;
        customerFailed: string;
        internalSent: string;
        internalFailed: string;
      }>();

    return {
      customerSent: Number(rows?.customerSent ?? 0),
      customerFailed: Number(rows?.customerFailed ?? 0),
      internalSent: Number(rows?.internalSent ?? 0),
      internalFailed: Number(rows?.internalFailed ?? 0),
      pendingOutbox: 0,
      failedOutbox: 0,
    };
  }
}
