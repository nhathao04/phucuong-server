import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";

import { DashboardService } from "./dashboard.service";
import { DashboardSummaryDto } from "./dto/dashboard-response.dto";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: "Dashboard summary (staff + admin)",
    description:
      "Returns counts, status slices, inquiry trends (12 months), top products, " +
      "and recent activity for the staff/admin dashboard view. " +
      "Single round-trip to populate all dashboard widgets.",
  })
  getSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary();
  }
}