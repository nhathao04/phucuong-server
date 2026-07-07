import {
  Body,
  Controller,
  Ip,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import {
  InquiryStep1Dto,
  InquiryStep2Dto,
  InquiryStep3Dto,
  InquiryStep4Dto,
  InquiryCreatedResponseDto,
  InquiryStepSavedResponseDto,
} from "./dto/inquiry-steps.dto";
import { InquiriesService } from "./inquiries.service";

@ApiTags("Inquiries")
@Controller("inquiries")
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  // ── STEP 1: Start inquiry (Customer info — REQUIRED first step) ────────────
  @Post("step/1")
  @ApiOperation({
    summary: "Step 1 — Submit customer information to start an inquiry",
    description:
      "Creates a new inquiry record and captures customer contact details. " +
      "An acknowledgement email is sent to the customer and an internal notification " +
      "email is queued for the sales team. This step is mandatory before proceeding.",
  })
  @ApiResponse({
    status: 201,
    type: InquiryCreatedResponseDto,
    description: "Inquiry created, Step 1 saved, emails sent.",
  })
  async step1(
    @Body() dto: InquiryStep1Dto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<InquiryCreatedResponseDto> {
    return this.inquiriesService.startInquiry(dto, {
      ip,
      userAgent: req.get("user-agent") ?? undefined,
      referrer: req.get("referer") ?? undefined,
    });
  }

  // ── STEP 2: Save product selection ─────────────────────────────────────────
  @Post("step/2")
  @ApiOperation({
    summary: "Step 2 — Save product, quantity and attributes",
    description:
      "Associates the inquiry with a product and saves quantity/sample request. " +
      "An internal email is sent to notify sales. Product-specific attributes are " +
      "captured for the selected product.",
  })
  @ApiResponse({
    status: 201,
    type: InquiryStepSavedResponseDto,
    description: "Step 2 saved, internal notification sent.",
  })
  async step2(
    @Body() dto: InquiryStep2Dto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiriesService.saveStep2(dto.inquiryId, dto, {
      ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
  }

  // ── STEP 3: Save commercial terms ─────────────────────────────────────────
  @Post("step/3")
  @ApiOperation({
    summary: "Step 3 — Save trade term, payment term, delivery date",
    description:
      "Saves the commercial terms for the inquiry. Internal sales notification " +
      "is sent. Trade term and payment term are stored.",
  })
  @ApiResponse({
    status: 201,
    type: InquiryStepSavedResponseDto,
    description: "Step 3 saved, internal notification sent.",
  })
  async step3(
    @Body() dto: InquiryStep3Dto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiriesService.saveStep3(dto.inquiryId, dto, {
      ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
  }

  // ── STEP 4: Final submit ──────────────────────────────────────────────────
  @Post("step/4")
  @ApiOperation({
    summary: "Step 4 — Final submission with requirements & certificates",
    description:
      "Completes the inquiry submission. Saves required certificates and additional " +
      "requirements. Triggers final confirmation email to customer and internal " +
      "notification to sales. The inquiry is marked as SUBMITTED.",
  })
  @ApiResponse({
    status: 201,
    type: InquiryStepSavedResponseDto,
    description: "Inquiry submitted successfully.",
  })
  async step4(
    @Body() dto: InquiryStep4Dto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiriesService.submitStep4(dto.inquiryId, dto, {
      ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
  }
}
