import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../../common/guards/staff-role.guard";
import { CertificatesService } from "./certificates.service";
import {
  CertificateListQueryDto,
  CertificateResponseDto,
  CertificateUsageCountDto,
  CreateCertificateDto,
  UpdateCertificateDto,
} from "./dto/certificate.dto";

@ApiTags("staff-certificates")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/certificates")
export class StaffCertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({
    summary: "List certificate master records (staff)",
    description:
      "Returns every certificate row with `productCount` (how many " +
      "products currently attach to it). Search by name with " +
      "`?search=iso` (case-insensitive substring).",
  })
  @ApiResponse({ status: 200, type: [CertificateResponseDto] })
  list(
    @Query() query: CertificateListQueryDto,
  ): Promise<CertificateResponseDto[]> {
    return this.certificatesService.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get certificate detail (staff)" })
  @ApiParam({
    name: "id",
    description: "Certificate UUID",
    example: "550e8400-e29b-41d4-a716-446655440099",
  })
  @ApiResponse({ status: 200, type: CertificateResponseDto })
  detail(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<CertificateResponseDto> {
    return this.certificatesService.getDetail(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new certificate (staff)" })
  @ApiResponse({ status: 201, type: CertificateResponseDto })
  create(
    @Body() dto: CreateCertificateDto,
  ): Promise<CertificateResponseDto> {
    return this.certificatesService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update certificate (staff)" })
  @ApiParam({
    name: "id",
    description: "Certificate UUID",
    example: "550e8400-e29b-41d4-a716-446655440099",
  })
  @ApiResponse({ status: 200, type: CertificateResponseDto })
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCertificateDto,
  ): Promise<CertificateResponseDto> {
    return this.certificatesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete certificate (staff)",
    description:
      "Hard delete. Cascades through `product_certificates` and " +
      "`inquiry_certificates` foreign keys (both `ON DELETE CASCADE`). " +
      "Call `GET /:id/usage` first to confirm the product count.",
  })
  @ApiParam({
    name: "id",
    description: "Certificate UUID",
    example: "550e8400-e29b-41d4-a716-446655440099",
  })
  @ApiResponse({ status: 200, schema: { example: { id: "uuid" } } })
  remove(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<{ id: string }> {
    return this.certificatesService.remove(id);
  }

  @Get(":id/usage")
  @ApiOperation({
    summary: "Get product-usage count for a certificate (staff)",
    description:
      "Returns how many products currently attach to this certificate. " +
      "Use before calling DELETE to confirm blast radius.",
  })
  @ApiParam({ name: "id", description: "Certificate UUID" })
  @ApiResponse({ status: 200, type: CertificateUsageCountDto })
  usage(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<CertificateUsageCountDto> {
    return this.certificatesService.getUsage(id);
  }
}

// ─────────────────────── Public ───────────────────────
// No public consumer today (cert masters are internal), but keep this
// controller available for future buyer-side docs (e.g. "we hold these
// certifications" on the marketing site). Returns active certs only — same
// list, no usage data.

@ApiTags("public-certificates")
@Controller("certificates")
export class PublicCertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({
    summary: "List active certificates (public)",
    description:
      "Returns all certificates that are not marked as inactive/expired. " +
      "All active certificates are returned regardless of whether they are attached to any product.",
  })
  @ApiResponse({ status: 200, type: [CertificateResponseDto] })
  async list(): Promise<CertificateResponseDto[]> {
    const all = await this.certificatesService.list({});
    // Filter out certificates explicitly marked as inactive/expired
    return all.filter(
      (cert) => cert.status !== "inactive" && cert.status !== "expired",
    );
  }
}
