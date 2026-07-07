import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { Inquiry } from "./entities/inquiry.entity";
import {
  InquiryFormStatus,
  InquiryStatus,
  InquiryAction,
} from "./entities/inquiry.enums";
import { Customer } from "../customers/entities/customer.entity";
import { Product } from "../products/entities/product.entity";
import { Country } from "../geography/entities/country.entity";
import { Port } from "../geography/entities/port.entity";
import { InquiryStepEvent } from "./entities/inquiry-step-event.entity";
import { InquiryProduct } from "./entities/inquiry-product.entity";
import { InquiryCommercial } from "./entities/inquiry-commercial.entity";
import { InquiryRequirement } from "./entities/inquiry-requirement.entity";
import { InquiryCertificate } from "./entities/inquiry-certificate.entity";
import { Notification } from "./entities/notification.entity";
import { EmailOutbox } from "./entities/email-outbox.entity";
import { MailService, EmailType } from "../mail/mail.service";
import {
  InquiryStep1Dto,
  InquiryStep2Dto,
  InquiryStep3Dto,
  InquiryStep4Dto,
  InquiryCreatedResponseDto,
  InquiryStepSavedResponseDto,
} from "./dto/inquiry-steps.dto";

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Port)
    private readonly portRepo: Repository<Port>,
    @InjectRepository(InquiryStepEvent)
    private readonly stepEventRepo: Repository<InquiryStepEvent>,
    @InjectRepository(InquiryProduct)
    private readonly inquiryProductRepo: Repository<InquiryProduct>,
    @InjectRepository(InquiryCommercial)
    private readonly inquiryCommercialRepo: Repository<InquiryCommercial>,
    @InjectRepository(InquiryRequirement)
    private readonly inquiryRequirementRepo: Repository<InquiryRequirement>,
    @InjectRepository(InquiryCertificate)
    private readonly inquiryCertificateRepo: Repository<InquiryCertificate>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(EmailOutbox)
    private readonly emailOutboxRepo: Repository<EmailOutbox>,
    private readonly mailService: MailService,
  ) {}

  // ── Public: Start inquiry (Step 1 = Customer info) ────────────────────────

  async startInquiry(
    dto: InquiryStep1Dto,
    meta: { ip?: string; userAgent?: string; referrer?: string },
  ): Promise<InquiryCreatedResponseDto> {
    return this.inquiryRepo.manager.transaction(async (manager) => {
      // Validate country / port if provided
      await this.validateGeo(manager, dto.destinationCountryId, dto.destinationPortId);

      // Find or create customer by email
      const customer = await this.findOrCreateCustomer(manager, dto);

      // Generate next inquiry code
      const code = await this.generateInquiryCode(manager);

      // Create inquiry record
      const inquiry = manager.getRepository(Inquiry).create({
        customerId: customer.id,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phoneNumber ?? null,
        whatsapp: dto.whatsappNumber ?? null,
        companyName: dto.companyName ?? null,
        country: dto.whatsappNumber ?? null,
        destinationCountryId: dto.destinationCountryId ?? null,
        destinationPortId: dto.destinationPortId ?? null,
        status: InquiryStatus.DRAFT,
        formStatus: InquiryFormStatus.DRAFT_STEP_1,
        currentStep: 1,
        code,
        step1CompletedAt: new Date(),
        lastStepSavedAt: new Date(),
        ipAddress: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
        referrerUrl: meta.referrer ?? null,
        leadCapturedAt: new Date(),
        internalEmailSent: false,
        customerEmailSent: false,
      });

      await manager.getRepository(Inquiry).save(inquiry);

      // Record step event
      await this.recordStepEvent(manager, inquiry.id, 1, InquiryAction.CONTINUE, {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phoneNumber,
        whatsapp: dto.whatsappNumber,
        companyName: dto.companyName,
      });

      // Send internal notification email (admin/sales)
      const internalSent = await this.sendInternalEmail(manager, inquiry, customer);

      // Send customer acknowledgement email
      await this.sendCustomerAckEmail(manager, inquiry, customer);

      // Notify admin via DB notification
      await this.createAdminNotification(manager, inquiry, customer, 1);

      return {
        inquiryId: inquiry.id,
        currentStep: 1,
        formStatus: inquiry.formStatus,
        inquiryCode: inquiry.code,
        customerEmailSent: inquiry.customerEmailSent,
        internalEmailSent: internalSent,
      };
    });
  }

  // ── Public: Save Step 2 (Product) ────────────────────────────────────────

  async saveStep2(
    inquiryId: string,
    dto: InquiryStep2Dto,
    meta: { ip?: string; userAgent?: string },
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiryRepo.manager.transaction(async (manager) => {
      const inquiry = await this.getInquiryOrFail(manager, inquiryId);

      // Validate product
      const product = await manager.getRepository(Product).findOne({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${dto.productId} not found`);
      }

      // Validate geo
      await this.validateGeo(
        manager,
        dto.destinationCountryId ?? inquiry.destinationCountryId,
        dto.destinationPortId ?? inquiry.destinationPortId,
      );

      // Upsert inquiry product
      const ipRepo = manager.getRepository(InquiryProduct);
      let inquiryProduct = await ipRepo.findOne({
        where: { inquiryId },
        relations: { attributes: true },
      });

      if (!inquiryProduct) {
        inquiryProduct = ipRepo.create({
          inquiryId,
          productId: dto.productId,
          quantityMt: dto.quantity ? String(dto.quantity) : null,
          sampleRequired: dto.sampleRequest ?? false,
        });
        await ipRepo.save(inquiryProduct);
      } else {
        await ipRepo.update(inquiryProduct.id, {
          productId: dto.productId,
          quantityMt: dto.quantity ? String(dto.quantity) : null,
          sampleRequired: dto.sampleRequest ?? false,
        });
      }

      // Resolve destination from dto or keep existing
      await manager.getRepository(Inquiry).update(inquiryId, {
        productId: dto.productId,
        destinationCountryId: dto.destinationCountryId ?? inquiry.destinationCountryId,
        destinationPortId: dto.destinationPortId ?? inquiry.destinationPortId,
        currentStep: 2,
        formStatus: InquiryFormStatus.DRAFT_STEP_2,
        step2CompletedAt: new Date(),
        lastStepSavedAt: new Date(),
      });

      // Record step event
      await this.recordStepEvent(manager, inquiryId, 2, InquiryAction.CONTINUE, {
        productId: dto.productId,
        productName: product.name,
        quantity: dto.quantity,
        sampleRequest: dto.sampleRequest,
      });

      // Send internal email for step 2
      const internalSent = await this.sendInternalEmail(
        manager,
        await this.reloadInquiry(manager, inquiryId),
        inquiry.customer,
      );

      // Notify admin
      await this.createAdminNotification(
        manager,
        await this.reloadInquiry(manager, inquiryId),
        inquiry.customer,
        2,
      );

      const updated = await this.reloadInquiry(manager, inquiryId);
      return {
        inquiryId: updated.id,
        currentStep: updated.currentStep,
        formStatus: updated.formStatus,
        inquiryCode: updated.code,
        customerEmailSent: updated.customerEmailSent,
        internalEmailSent: internalSent,
        savedStep: 2,
      };
    });
  }

  // ── Public: Save Step 3 (Commercial Terms) ───────────────────────────────

  async saveStep3(
    inquiryId: string,
    dto: InquiryStep3Dto,
    meta: { ip?: string; userAgent?: string },
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiryRepo.manager.transaction(async (manager) => {
      const inquiry = await this.getInquiryOrFail(manager, inquiryId);

      // Upsert commercial terms
      const commercialRepo = manager.getRepository(InquiryCommercial);
      let commercial = await commercialRepo.findOne({
        where: { inquiryId },
      });

      const commercialData = {
        tradeTerm: dto.tradeTerm,
        paymentTerm: dto.paymentTerm ?? null,
        expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
      };

      if (!commercial) {
        commercial = commercialRepo.create({
          inquiryId,
          ...commercialData,
        });
        await commercialRepo.save(commercial);
      } else {
        await commercialRepo.update(commercial.id, commercialData);
      }

      await manager.getRepository(Inquiry).update(inquiryId, {
        tradeTerm: dto.tradeTerm,
        paymentTerm: dto.paymentTerm ?? null,
        expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
        currentStep: 3,
        formStatus: InquiryFormStatus.DRAFT_STEP_3,
        step3CompletedAt: new Date(),
        lastStepSavedAt: new Date(),
      });

      await this.recordStepEvent(manager, inquiryId, 3, InquiryAction.CONTINUE, {
        tradeTerm: dto.tradeTerm,
        paymentTerm: dto.paymentTerm,
        expectedDeliveryDate: dto.expectedDeliveryDate,
      });

      const updated = await this.reloadInquiry(manager, inquiryId);
      await this.sendInternalEmail(manager, updated, inquiry.customer);
      await this.createAdminNotification(manager, updated, inquiry.customer, 3);

      return {
        inquiryId: updated.id,
        currentStep: updated.currentStep,
        formStatus: updated.formStatus,
        inquiryCode: updated.code,
        customerEmailSent: updated.customerEmailSent,
        internalEmailSent: updated.internalEmailSent,
        savedStep: 3,
      };
    });
  }

  // ── Public: Step 4 — Final Submit ─────────────────────────────────────────

  async submitStep4(
    inquiryId: string,
    dto: InquiryStep4Dto,
    meta: { ip?: string; userAgent?: string },
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiryRepo.manager.transaction(async (manager) => {
      const inquiry = await this.getInquiryOrFail(manager, inquiryId);

      // Validate step 1 & 2 & 3 are done
      if (!inquiry.step1CompletedAt) {
        throw new BadRequestException("Step 1 (customer info) not completed");
      }

      // Upsert requirements
      const reqRepo = manager.getRepository(InquiryRequirement);
      let requirement = await reqRepo.findOne({ where: { inquiryId } });
      const reqData = {
        certificateRequired: (dto.certificateRequired ?? []).map((id) => ({ id })),
        additionalRequirements: dto.additionalRequirements
          ? [{ text: dto.additionalRequirements }]
          : [],
      };

      if (!requirement) {
        requirement = reqRepo.create({ inquiryId, ...reqData });
        await reqRepo.save(requirement);
      } else {
        await reqRepo.update(requirement.id, reqData);
      }

      // Upsert inquiry certificates
      if (dto.certificateRequired && dto.certificateRequired.length > 0) {
        await manager.getRepository(InquiryCertificate).delete({ inquiryId });
        const certRepo = manager.getRepository(InquiryCertificate);
        await certRepo.save(
          dto.certificateRequired.map((certId) =>
            certRepo.create({ inquiryId, certificateId: certId }),
          ),
        );
      }

      // Finalise inquiry
      await manager.getRepository(Inquiry).update(inquiryId, {
        currentStep: 4,
        formStatus: InquiryFormStatus.READY_TO_SUBMIT,
        step4CompletedAt: new Date(),
        submittedAt: new Date(),
        isCompleted: true,
        lastStepSavedAt: new Date(),
        status: InquiryStatus.SUBMITTED,
        notes: dto.additionalRequirements ?? null,
      });

      await this.recordStepEvent(manager, inquiryId, 4, InquiryAction.SUBMIT, {
        certificates: dto.certificateRequired,
        additionalRequirements: dto.additionalRequirements,
      });

      const updated = await this.reloadInquiry(manager, inquiryId);
      const customer = updated.customerId
        ? await manager.getRepository(Customer).findOne({ where: { id: updated.customerId } })
        : null;

      await this.sendInternalEmail(manager, updated, customer);
      if (customer) await this.sendCustomerConfirmationEmail(manager, updated, customer);
      await this.createAdminNotification(manager, updated, customer, 4);

      return {
        inquiryId: updated.id,
        currentStep: updated.currentStep,
        formStatus: InquiryFormStatus.READY_TO_SUBMIT,
        inquiryCode: updated.code,
        customerEmailSent: updated.customerEmailSent,
        internalEmailSent: updated.internalEmailSent,
        savedStep: 4,
      };
    });
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async findOrCreateCustomer(
    manager: EntityManager,
    dto: InquiryStep1Dto,
  ): Promise<Customer> {
    const customerRepo = manager.getRepository(Customer);
    let customer = await customerRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!customer) {
      customer = customerRepo.create({
        fullName: dto.fullName,
        email: dto.email.toLowerCase().trim(),
        phoneNumber: dto.phoneNumber ?? null,
        whatsappNumber: dto.whatsappNumber ?? null,
        companyName: dto.companyName ?? null,
      });
      await customerRepo.save(customer);
    } else {
      // Update contact info if changed
      const changed =
        customer.fullName !== dto.fullName ||
        customer.phoneNumber !== (dto.phoneNumber ?? null) ||
        customer.whatsappNumber !== (dto.whatsappNumber ?? null) ||
        customer.companyName !== (dto.companyName ?? null);

      if (changed) {
        await customerRepo.update(customer.id, {
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber ?? null,
          whatsappNumber: dto.whatsappNumber ?? null,
          companyName: dto.companyName ?? null,
        });
      }
    }
    return customer;
  }

  private async validateGeo(
    manager: EntityManager,
    countryId: string | null | undefined,
    portId: string | null | undefined,
  ): Promise<void> {
    if (countryId) {
      const country = await manager.getRepository(Country).findOne({
        where: { id: countryId },
      });
      if (!country) {
        throw new BadRequestException(`Country ${countryId} not found`);
      }
    }
    if (portId) {
      const port = await manager.getRepository(Port).findOne({
        where: { id: portId },
      });
      if (!port) {
        throw new BadRequestException(`Port ${portId} not found`);
      }
    }
  }

  private async getInquiryOrFail(
    manager: EntityManager,
    inquiryId: string,
  ): Promise<Inquiry> {
    const repo = manager.getRepository(Inquiry);
    const inquiry = await repo.findOne({ where: { id: inquiryId } });
    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${inquiryId} not found`);
    }
    return inquiry;
  }

  private async reloadInquiry(
    manager: EntityManager,
    inquiryId: string,
  ): Promise<Inquiry> {
    return manager.getRepository(Inquiry).findOneOrFail({
      where: { id: inquiryId },
    });
  }

  private async generateInquiryCode(manager: EntityManager): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `INQ-${dateStr}-`;

    const last = await manager
      .getRepository(Inquiry)
      .createQueryBuilder("i")
      .where("i.code ILIKE :prefix", { prefix: `${prefix}%` })
      .orderBy("i.code", "DESC")
      .getOne();

    let seq = 1;
    if (last?.code) {
      const parts = last.code.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(4, "0")}`;
  }

  private async recordStepEvent(
    manager: EntityManager,
    inquiryId: string,
    stepNo: number,
    action: InquiryAction,
    snapshotData: Record<string, unknown>,
  ): Promise<void> {
    const repo = manager.getRepository(InquiryStepEvent);
    await repo.save(
      repo.create({
        inquiryId,
        stepNo,
        stepKey: `step_${stepNo}`,
        action,
        snapshotData,
        createdBy: "customer",
      }),
    );
  }

  private async sendInternalEmail(
    manager: EntityManager,
    inquiry: Inquiry,
    customer: Customer | null,
  ): Promise<boolean> {
    // Queue in DB for audit trail
    await manager.getRepository(EmailOutbox).save(
      manager.getRepository(EmailOutbox).create({
        inquiryId: inquiry.id,
        stepNo: inquiry.currentStep,
        templateCode: `internal_step_${inquiry.currentStep}`,
        toEmail: process.env.INTERNAL_EMAIL_TO ?? "sales@phucuong.com",
        payload: { inquiryCode: inquiry.code, customerName: customer?.fullName } as Record<string, unknown>,
        status: "pending" as any,
      }),
    );

    // Send via template
    const sent = await this.mailService.sendFromTemplate(EmailType.INTERNAL_NOTIFY, {
      customerName: customer?.fullName ?? inquiry.fullName ?? "Unknown",
      inquiryCode: inquiry.code,
      inquiryId: inquiry.id,
      step: inquiry.currentStep,
      email: customer?.email ?? inquiry.email ?? undefined,
      phone: customer?.phoneNumber ?? inquiry.phone ?? undefined,
      whatsapp: customer?.whatsappNumber ?? inquiry.whatsapp ?? undefined,
      companyName: customer?.companyName ?? inquiry.companyName ?? undefined,
      tradeTerm: inquiry.tradeTerm ?? undefined,
      quantity: inquiry.quantity ?? undefined,
    });

    await manager.getRepository(Inquiry).update(inquiry.id, {
      internalEmailSent: true,
      internalEmailSentAt: sent ? new Date() : inquiry.internalEmailSentAt,
    });

    return sent;
  }

  private async sendCustomerAckEmail(
    manager: EntityManager,
    inquiry: Inquiry,
    customer: Customer,
  ): Promise<void> {
    // Queue in DB
    await manager.getRepository(EmailOutbox).save(
      manager.getRepository(EmailOutbox).create({
        inquiryId: inquiry.id,
        stepNo: 1,
        templateCode: "customer_step_1_ack",
        toEmail: customer.email,
        payload: { inquiryCode: inquiry.code, customerName: customer.fullName } as Record<string, unknown>,
        status: "pending" as any,
      }),
    );

    // Send via template
    const sent = await this.mailService.sendFromTemplate(
      EmailType.CUSTOMER_ACK,
      {
        customerName: customer.fullName,
        inquiryCode: inquiry.code,
        inquiryId: inquiry.id,
        email: customer.email,
      },
      customer.email,
    );

    if (sent) {
      await manager.getRepository(Inquiry).update(inquiry.id, {
        customerEmailSent: true,
        customerEmailSentAt: new Date(),
      });
    }
  }

  private async sendCustomerConfirmationEmail(
    manager: EntityManager,
    inquiry: Inquiry,
    customer: Customer,
  ): Promise<void> {
    // Queue in DB
    await manager.getRepository(EmailOutbox).save(
      manager.getRepository(EmailOutbox).create({
        inquiryId: inquiry.id,
        stepNo: 4,
        templateCode: "customer_final_submit",
        toEmail: customer.email,
        payload: { inquiryCode: inquiry.code, customerName: customer.fullName } as Record<string, unknown>,
        status: "pending" as any,
      }),
    );

    // Send via template
    await this.mailService.sendFromTemplate(
      EmailType.CUSTOMER_CONFIRM,
      {
        customerName: customer.fullName,
        inquiryCode: inquiry.code,
        inquiryId: inquiry.id,
        email: customer.email,
        productName: inquiry.productId ?? undefined,
        tradeTerm: inquiry.tradeTerm ?? undefined,
        quantity: inquiry.quantity ?? undefined,
      },
      customer.email,
    );
  }

  private async createAdminNotification(
    manager: EntityManager,
    inquiry: Inquiry,
    customer: Customer | null,
    stepNo: number,
  ): Promise<void> {
    const stepLabel = ["", "Customer Info", "Product Selection", "Commercial Terms", "Final Submit"][stepNo];
    const action = stepNo === 4 ? "submitted" : "updated";

    await manager.getRepository(Notification).save(
      manager.getRepository(Notification).create({
        inquiryId: inquiry.id,
        title: `Inquiry ${action} (Step ${stepNo}: ${stepLabel})`,
        message: `${customer?.fullName ?? inquiry.fullName ?? "Unknown"} — ${action} inquiry ${inquiry.code ?? inquiry.id}`,
      }),
    );
  }
}
