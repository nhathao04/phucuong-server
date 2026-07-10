import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";

import { InquiriesAdminService } from "./inquiries-admin.service";
import { InquiryListQueryDto } from "./dto/inquiry-admin-query.dto";
import {
  AssignStaffDto,
  UpdateInquiryNotesDto,
  UpdateInquiryStatusDto,
} from "./dto/inquiry-admin-action.dto";
import {
  InquiryDetailDto,
  InquiryListResponseDto,
  InquiryStatsDto,
} from "./dto/inquiry-admin-response.dto";

@ApiTags("staff-inquiries")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/inquiries")
export class StaffInquiriesController {
  constructor(private readonly adminService: InquiriesAdminService) {}

  // ── Stats ─────────────────────────────────────────────────────────────────

  @Get("stats")
  @ApiOperation({
    summary: "Get inquiry dashboard statistics",
    description:
      "Aggregates inquiry counts, funnel conversion rates, daily activity for the last `days` " +
      "(default 30) days, top countries, top products, staff performance and email health.",
  })
  @ApiResponse({ status: 200, type: InquiryStatsDto })
  stats(
    @Query("days", new DefaultValuePipe(30), ParseIntPipe) days: number,
  ): Promise<InquiryStatsDto> {
    return this.adminService.getStats(days);
  }

  // ── List ──────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: "List inquiries with filtering and pagination",
    description:
      "Search by code/name/email/company, filter by status, sales status, step, country, product, " +
      "customer, UTM, and date range. Supports pagination + sorting.",
  })
  @ApiResponse({ status: 200, type: InquiryListResponseDto })
  list(@Query() query: InquiryListQueryDto): Promise<InquiryListResponseDto> {
    return this.adminService.list(query);
  }

  // ── Detail ────────────────────────────────────────────────────────────────

  @Get(":id")
  @ApiOperation({
    summary: "Get full detail of one inquiry (admin view)",
    description:
      "Returns all fields including internal notes, IP/UA, UTM tracking and recent activity log.",
  })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, type: InquiryDetailDto })
  detail(@Param("id", ParseUUIDPipe) id: string): Promise<InquiryDetailDto> {
    return this.adminService.getDetail(id);
  }

  // ── Update status ─────────────────────────────────────────────────────────

  @Patch(":id/status")
  @ApiOperation({
    summary: "Update inquiry lifecycle status (sales pipeline)",
    description:
      "Sets `status` and optionally `salesStatus`. Writes an activity log entry and " +
      "creates a notification. The actor (JWT `sub`) is recorded as `createdByUserId`.",
  })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, type: InquiryDetailDto })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInquiryStatusDto,
    @Req() req: Request & { user?: { sub: string } },
  ): Promise<InquiryDetailDto> {
    return this.adminService.updateStatus(id, dto, { sub: req.user?.sub ?? "" });
  }

  // ── Update notes ──────────────────────────────────────────────────────────

  @Patch(":id/notes")
  @ApiOperation({ summary: "Update internal notes for an inquiry" })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, type: InquiryDetailDto })
  updateNotes(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInquiryNotesDto,
    @Req() req: Request & { user?: { sub: string } },
  ): Promise<InquiryDetailDto> {
    return this.adminService.updateNotes(id, dto, { sub: req.user?.sub ?? "" });
  }

  // ── Assign staff ──────────────────────────────────────────────────────────

  @Post(":id/assignments")
  @ApiOperation({
    summary: "Assign a staff/admin user to an inquiry",
    description:
      "Creates an `InquiryAssignment` row. Only users whose `Role.name` is `admin` or `staff` " +
      "can be assigned. An activity log entry is recorded.\n\n" +
      "Rules:\n" +
      "- If the inquiry is unassigned or already held by the same user, this succeeds.\n" +
      "- If another user currently holds it, pass `force: true` to take it over " +
      "(closes their active assignment and creates yours).",
  })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, type: InquiryDetailDto })
  assign(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignStaffDto,
    @Req() req: Request & { user?: { sub: string } },
  ): Promise<InquiryDetailDto> {
    return this.adminService.assignStaff(id, dto, { sub: req.user?.sub ?? "" });
  }

  @Delete(":id/assignments/:assignmentId")
  @ApiOperation({
    summary: "Release your own assignment on an inquiry",
    description:
      "Sets `unassignedAt` on the assignment row (soft-unassign). " +
      "You can only unassign your own assignment — releasing another staff's " +
      "assignment requires them to do it themselves, or `assignStaff` with `force: true`.",
  })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiParam({ name: "assignmentId", description: "Assignment row numeric id" })
  @ApiResponse({ status: 200, type: InquiryDetailDto })
  @ApiResponse({ status: 403, description: "Caller is not the owner of this assignment" })
  unassign(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("assignmentId", ParseIntPipe) assignmentId: number,
    @Req() req: Request & { user?: { sub: string } },
  ): Promise<InquiryDetailDto> {
    return this.adminService.unassignStaff(id, assignmentId, {
      sub: req.user?.sub ?? "",
    });
  }

  // ── Toggle contacted ──────────────────────────────────────────────────────

  @Put(":id/contacted")
  @ApiOperation({
    summary: "Toggle the `contacted` flag (true ↔ false) on an inquiry",
    description:
      "Flips the `contacted` boolean. When set to true, also records `contactedAt` " +
      "and `contactedById`. An activity log entry is written each time.",
  })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, type: InquiryDetailDto })
  toggleContacted(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request & { user?: { sub: string } },
  ): Promise<InquiryDetailDto> {
    return this.adminService.toggleContacted(id, { sub: req.user?.sub ?? "" });
  }
}
