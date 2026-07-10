import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager, In } from "typeorm";
import { Inquiry } from "./entities/inquiry.entity";
import {
  InquiryFormStatus,
  InquiryStatus,
  InquiryAction,
} from "./entities/inquiry.enums";
import { Customer } from "../customers/entities/customer.entity";
import { Product } from "../products/entities/product.entity";
import { ProductAttribute } from "../products/entities/product-attribute.entity";
import { ProductAttributeOption } from "../products/entities/product-attribute-option.entity";
import { ProductContainerConfig } from "../products/entities/product-container-config.entity";
import { ProductCountryConfig } from "../products/entities/product-country-config.entity";
import { ProductTradeTerm } from "../products/entities/product-trade-term.entity";
import { Country } from "../geography/entities/country.entity";
import { Port } from "../geography/entities/port.entity";
import { InquiryStepEvent } from "./entities/inquiry-step-event.entity";
import { InquiryProduct } from "./entities/inquiry-product.entity";
import { InquiryProductAttribute } from "./entities/inquiry-product-attribute.entity";
import { InquiryCommercial } from "./entities/inquiry-commercial.entity";
import { InquiryRequirement } from "./entities/inquiry-requirement.entity";
import { InquiryCertificate } from "./entities/inquiry-certificate.entity";
import { Certificate } from "./entities/certificate.entity";
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
  InquiryCalculationDto,
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
    @InjectRepository(ProductContainerConfig)
    private readonly productContainerConfigRepo: Repository<ProductContainerConfig>,
    @InjectRepository(ProductCountryConfig)
    private readonly productCountryConfigRepo: Repository<ProductCountryConfig>,
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

      // Validate product exists and is purchasable. Step 1 binds the
      // inquiry to a single product — Step 2 will only collect
      // quantity + attributes for this product.
      const product = await manager.getRepository(Product).findOne({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${dto.productId} not found`);
      }

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
        productId: dto.productId,
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
        productId: dto.productId,
        productName: product.name,
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

      // Validate product — comes from Step 1, not Step 2 DTO.
      if (!inquiry.productId) {
        throw new BadRequestException(
          "Inquiry has no product bound. Restart from Step 1 and pick a product.",
        );
      }
      const productId = inquiry.productId;
      const product = await manager.getRepository(Product).findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      // Validate geo
      await this.validateGeo(
        manager,
        dto.destinationCountryId ?? inquiry.destinationCountryId,
        dto.destinationPortId ?? inquiry.destinationPortId,
      );

      // ── Auto calculation: Container + MOQ ─────────────────────────────────
      const countryId =
        dto.destinationCountryId ?? inquiry.destinationCountryId ?? null;
      const quantity = Number(dto.quantity);

      const container = await this.resolveContainerConfig(
        manager,
        productId,
        dto.containerCode ?? undefined,
        dto.tradeTermCode ?? undefined,
      );
      const moq = await this.resolveMoqMt(manager, productId, product, countryId);
      const calculation = this.computeProductCalculation(quantity, container, moq);

      // Upsert inquiry product
      const ipRepo = manager.getRepository(InquiryProduct);
      let inquiryProduct = await ipRepo.findOne({
        where: { inquiryId },
        relations: { attributes: true },
      });

      const productFields = {
        productId,
        quantityMt: dto.quantity ? String(dto.quantity) : null,
        sampleRequired: dto.sampleRequest ?? false,
        estimatedContainer: calculation.estimatedContainers
          ? String(calculation.estimatedContainers)
          : null,
        moqStatus: calculation.moqStatus,
      };

      if (!inquiryProduct) {
        inquiryProduct = ipRepo.create({ inquiryId, ...productFields });
        await ipRepo.save(inquiryProduct);
      } else {
        await ipRepo.update(inquiryProduct.id, productFields);
      }

      // Upsert product attributes (Step 2 form selections).
      // Supports: optionId (catalog selection), customValue (free-form when
      // optionId points to a custom-trigger option), or value (legacy/text).
      if (dto.attributes && dto.attributes.length) {
        await this.upsertInquiryAttributes(
          manager,
          inquiryProduct.id,
          dto.attributes,
        );
      }

      // Resolve destination from dto or keep existing
      await manager.getRepository(Inquiry).update(inquiryId, {
        destinationCountryId: dto.destinationCountryId ?? inquiry.destinationCountryId,
        destinationPortId: dto.destinationPortId ?? inquiry.destinationPortId,
        currentStep: 2,
        formStatus: InquiryFormStatus.DRAFT_STEP_2,
        step2CompletedAt: new Date(),
        lastStepSavedAt: new Date(),
        quantity: String(quantity),
        estimatedContainer: calculation.estimatedContainers
          ? String(calculation.estimatedContainers)
          : null,
      });

      // Record step event
      await this.recordStepEvent(manager, inquiryId, 2, InquiryAction.CONTINUE, {
        productId,
        productName: product.name,
        quantity: dto.quantity,
        sampleRequest: dto.sampleRequest,
        calculation,
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
        calculation,
      };
    });
  }

  // ── Public: Save Step 3 (Commercial Terms + Requirements) ────────────────
  //
  // Single endpoint now covers trade/payment/delivery/certificates/notes.
  // Step 4 is reduced to a review-only submit call.

  async saveStep3(
    inquiryId: string,
    dto: InquiryStep3Dto,
    meta: { ip?: string; userAgent?: string },
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiryRepo.manager.transaction(async (manager) => {
      const inquiry = await this.getInquiryOrFail(manager, inquiryId);

      // 1) Upsert commercial terms
      const commercialRepo = manager.getRepository(InquiryCommercial);
      let commercial = await commercialRepo.findOne({
        where: { inquiryId },
      });

      const commercialData = {
        tradeTerm: dto.tradeTerm ?? null,
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

      // 2) Upsert requirement row (cert list + free-form notes)
      const reqRepo = manager.getRepository(InquiryRequirement);
      let requirement = await reqRepo.findOne({ where: { inquiryId } });
      const certIdList = dto.certificateRequired?.length ? dto.certificateRequired : [];
      const reqData = {
        certificateRequired: certIdList.map((id) => ({ id })),
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

      // 3) Sync inquiry_certificate rows (replaces previous selection).
      //    Validates every certificateId exists so FK violations become 400
      //    rather than opaque 500s on submit.
      const certRepo = manager.getRepository(InquiryCertificate);
      const certificateRepo = manager.getRepository(Certificate);

      // Delete existing records first
      await certRepo.delete({ inquiryId });

      // Save other documents (free-text) with null certificateId
      const otherDocs = dto.otherDocuments?.filter((d) => d?.trim());
      if (otherDocs?.length) {
        await certRepo.save(
          otherDocs.map((text) =>
            certRepo.create({ inquiryId, certificateId: null as any, otherText: text.trim() }),
          ),
        );
      }

      // Validate and save certificate IDs
      const uniqueCertIds = dto.certificateRequired?.filter((id) => id?.trim());
      if (uniqueCertIds?.length) {
        const found = await certificateRepo.find({
          where: { id: In(uniqueCertIds) },
          select: { id: true },
        });
        const foundIds = new Set(found.map((c) => c.id));
        const missing = uniqueCertIds.filter((cid) => !foundIds.has(cid));
        if (missing.length) {
          throw new BadRequestException(
            `Certificate(s) not found: ${missing.join(", ")}`,
          );
        }
        await certRepo.save(
          uniqueCertIds.map((certificateId) =>
            certRepo.create({ inquiryId, certificateId }),
          ),
        );
      }

      // 4) Persist commercial/requirements on the Inquiry row
      //    (notes field mirrors additionalRequirements for cross-module reads)
      await manager.getRepository(Inquiry).update(inquiryId, {
        tradeTerm: dto.tradeTerm ?? null,
        paymentTerm: dto.paymentTerm ?? null,
        expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
        notes: dto.additionalRequirements ?? null,
        currentStep: 3,
        formStatus: InquiryFormStatus.DRAFT_STEP_3,
        step3CompletedAt: new Date(),
        lastStepSavedAt: new Date(),
      });

      await this.recordStepEvent(manager, inquiryId, 3, InquiryAction.CONTINUE, {
        tradeTerm: dto.tradeTerm ?? null,
        paymentTerm: dto.paymentTerm ?? null,
        expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
        certificateRequired: certIdList,
        additionalRequirements: dto.additionalRequirements ?? null,
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

  // ── Public: Step 4 — Final Submit (review-only) ───────────────────────────
  //
  // Step 4 no longer carries any input fields — every requirement (certs,
  // notes, commercial terms) has been captured on Step 3. This endpoint
  // only validates that Step 1-3 are complete and fires the SUBMIT side
  // effects (emails, status transition).

  async submitStep4(
    inquiryId: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<InquiryStepSavedResponseDto> {
    return this.inquiryRepo.manager.transaction(async (manager) => {
      const inquiry = await this.getInquiryOrFail(manager, inquiryId);

      // Defensive guard: refuse to submit if any prior step is missing.
      if (!inquiry.step1CompletedAt) {
        throw new BadRequestException("Step 1 (customer info) not completed");
      }
      if (!inquiry.step2CompletedAt) {
        throw new BadRequestException("Step 2 (product) not completed");
      }
      if (!inquiry.step3CompletedAt) {
        throw new BadRequestException("Step 3 (commercial terms) not completed");
      }

      // Finalise inquiry (no upsert here — Step 3 owns the requirement row)
      await manager.getRepository(Inquiry).update(inquiryId, {
        currentStep: 4,
        formStatus: InquiryFormStatus.READY_TO_SUBMIT,
        step4CompletedAt: new Date(),
        submittedAt: new Date(),
        lastStepSavedAt: new Date(),
        status: InquiryStatus.SUBMITTED,
      });

      await this.recordStepEvent(manager, inquiryId, 4, InquiryAction.SUBMIT, {
        // submit is a no-input step; payload purely mirrors what's already saved
        certificateCount:
          (await manager.getRepository(InquiryCertificate).count({
            where: { inquiryId },
          })) ?? 0,
      });

      const updated = await this.reloadInquiry(manager, inquiryId);
      const customer = updated.customerId
        ? await manager.getRepository(Customer).findOne({
            where: { id: updated.customerId },
          })
        : null;

      await this.sendInternalEmail(manager, updated, customer);
      if (customer)
        await this.sendCustomerConfirmationEmail(manager, updated, customer);
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

  private async getProductName(
    manager: EntityManager,
    productId: string | null | undefined,
  ): Promise<string | undefined> {
    if (!productId) return undefined;
    const product = await manager.getRepository(Product).findOne({
      where: { id: productId },
      select: { name: true },
    });
    return product?.name;
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

  // ── Auto calculation: Container Qty + MOQ Validation ──────────────────────
  // Pick the default container config for the product (or smallest if none flagged).
  // Falls back to product.quoteConfig.moq if no country-level config exists.
  // Resolves container config by priority:
  // 1. Explicit containerCode if provided
  // 2. Default container for the selected trade term (tradeTermCode)
  // 3. Global default container (isDefault=true)
  // 4. Smallest capacity container
  private async resolveContainerConfig(
    manager: EntityManager,
    productId: string,
    containerCode?: string | null,
    tradeTermCode?: string | null,
  ): Promise<ProductContainerConfig | null> {
    const repo = manager.getRepository(ProductContainerConfig);

    if (containerCode) {
      const cfg = await repo.findOne({ where: { productId, containerCode } });
      if (cfg) return cfg;
    }

    if (tradeTermCode) {
      const tradeTermRepo = manager.getRepository(ProductTradeTerm);
      const tradeTerm = await tradeTermRepo
        .createQueryBuilder("pt")
        .innerJoin("pt.tradeTerm", "tt")
        .where("pt.productId = :productId", { productId })
        .andWhere("tt.code = :code", { code: tradeTermCode.toUpperCase() })
        .getOne();
      if (tradeTerm) {
        const defaultForTerm = await repo.findOne({
          where: { productId, isDefault: true },
        });
        if (defaultForTerm) return defaultForTerm;
      }
    }

    const defaultCfg = await repo.findOne({
      where: { productId, isDefault: true },
    });
    if (defaultCfg) return defaultCfg;

    return repo
      .createQueryBuilder("c")
      .where("c.productId = :productId", { productId })
      .orderBy("c.capacityMt", "ASC")
      .getOne();
  }

  // Returns the country-specific MOQ (or falls back to product.quoteConfig.moq).
  private async resolveMoqMt(
    manager: EntityManager,
    productId: string,
    product: Product,
    destinationCountryId: string | null | undefined,
  ): Promise<{ moqMt: number | null; moqLabel: string | null }> {
    if (destinationCountryId) {
      const countryCfg = await manager
        .getRepository(ProductCountryConfig)
        .findOne({ where: { productId, countryId: destinationCountryId } });
      if (countryCfg?.moqMt) {
        return { moqMt: Number(countryCfg.moqMt), moqLabel: countryCfg.moqLabel ?? null };
      }
    }

    const moqRaw = product.quoteConfig?.moq;
    if (!moqRaw) return { moqMt: null, moqLabel: null };

    // Format: "N x CONTAINER_CODE" (e.g. "1 x 40HQ", "2 x 20FT")
    const containerMatch = moqRaw.match(/^(\d+(?:\.\d+)?)\s*[xX]\s*([A-Za-z0-9]+)$/);
    if (containerMatch) {
      const containerCount = parseFloat(containerMatch[1]);
      const containerCode = containerMatch[2].toUpperCase();
      const containerCfg = await manager
        .getRepository(ProductContainerConfig)
        .findOne({ where: { productId, containerCode } });
      if (containerCfg) {
        const capacity = parseFloat(containerCfg.capacityMt);
        if (!isNaN(capacity) && capacity > 0) {
          return { moqMt: containerCount * capacity, moqLabel: moqRaw };
        }
      }
    }

    // Plain number format (e.g. "10" → 10 MT)
    const parsed = parseFloat(moqRaw);
    if (!isNaN(parsed) && parsed > 0) {
      return { moqMt: parsed, moqLabel: moqRaw };
    }

    return { moqMt: null, moqLabel: null };
  }

  private computeProductCalculation(
    quantityMt: number,
    container: ProductContainerConfig | null,
    moq: { moqMt: number | null; moqLabel: string | null },
  ): InquiryCalculationDto {
    const containerCapacity = container ? Number(container.capacityMt) : 0;
    const estimatedContainers =
      containerCapacity > 0
        ? Math.max(1, Math.ceil(quantityMt / containerCapacity))
        : null;

    let moqStatus: "ok" | "below_moq" | "no_moq_config" = "no_moq_config";
    if (moq.moqMt !== null) {
      moqStatus = quantityMt >= moq.moqMt ? "ok" : "below_moq";
    }

    return {
      estimatedContainers,
      containerCode: container?.containerCode ?? null,
      containerName: container?.containerName ?? null,
      containerCapacityMt: container ? containerCapacity : null,
      moqMt: moq.moqMt,
      moqLabel: moq.moqLabel,
      moqStatus,
      isValid: moqStatus !== "below_moq",
    };
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

    // Load product info, attributes, and certificates for email
    const productName = await this.getProductName(manager, inquiry.productId);
    const productAttributes = await this.loadProductAttributesForEmail(manager, inquiry.id);
    const { certificates, otherDocuments } = await this.loadCertificatesForEmail(manager, inquiry.id);

    // Send via template
    const calculation = await this.buildCalculationForEmail(manager, inquiry);
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
      productName,
      productAttributes,
      calculation,
      certificates,
      otherDocuments,
    });

    await manager.getRepository(Inquiry).update(inquiry.id, {
      internalEmailSent: true,
      internalEmailSentAt: sent ? new Date() : inquiry.internalEmailSentAt,
    });

    return sent;
  }

  private async loadProductAttributesForEmail(
    manager: EntityManager,
    inquiryId: string,
  ): Promise<Array<{ label: string; value: string }>> {
    const productRepo = manager.getRepository(InquiryProduct);
    const attrLinkRepo = manager.getRepository(InquiryProductAttribute);
    const attributeRepo = manager.getRepository(ProductAttribute);

    const products = await productRepo.find({ where: { inquiryId } });
    if (!products.length) return [];

    const product = products[0]; // Use first product
    const attrLinks = await attrLinkRepo.find({
      where: { inquiryProductId: product.id },
      order: { sortOrder: "ASC" },
    });

    if (!attrLinks.length) return [];

    const attributeIds = attrLinks.map((a) => a.attributeId);
    const attributes = await attributeRepo.find({ where: { id: In(attributeIds) } });
    const attrMap = Object.fromEntries(attributes.map((a) => [a.id, a]));

    return attrLinks
      .map((link) => {
        const attr = attrMap[link.attributeId];
        if (!attr) return null;
        const value = link.customValue ?? link.valueText ?? "";
        if (!value) return null;
        return { label: attr.name, value };
      })
      .filter((item): item is { label: string; value: string } => item !== null);
  }

  private async loadCertificatesForEmail(
    manager: EntityManager,
    inquiryId: string,
  ): Promise<{ certificates: string[]; otherDocuments: string[] }> {
    const certRepo = manager.getRepository(InquiryCertificate);
    const certificateRepo = manager.getRepository(Certificate);

    const inquiryCerts = await certRepo.find({ where: { inquiryId } });

    const certificates: string[] = [];
    const otherDocuments: string[] = [];

    for (const ic of inquiryCerts) {
      if (ic.certificateId) {
        const cert = await certificateRepo.findOne({
          where: { id: ic.certificateId },
          select: { name: true },
        });
        if (cert) certificates.push(cert.name);
      } else if (ic.otherText) {
        otherDocuments.push(ic.otherText);
      }
    }

    return { certificates, otherDocuments };
  }

  private async buildCalculationForEmail(
    manager: EntityManager,
    inquiry: Inquiry,
  ): Promise<{
    estimatedContainers?: number | null;
    containerCode?: string | null;
    containerName?: string | null;
    containerCapacityMt?: number | null;
    moqMt?: number | null;
    moqLabel?: string | null;
    moqStatus?: "ok" | "below_moq" | "no_moq_config";
    isValid?: boolean;
  } | undefined> {
    if (!inquiry.productId || !inquiry.quantity) return undefined;

    const product = await manager.getRepository(Product).findOne({
      where: { id: inquiry.productId },
    });
    if (!product) return undefined;

    const quantityMt = parseFloat(inquiry.quantity);
    if (isNaN(quantityMt)) return undefined;

    const container = await this.resolveContainerConfig(manager, inquiry.productId);
    const moq = await this.resolveMoqMt(manager, inquiry.productId, product, inquiry.destinationCountryId);

    const containerCapacity = container ? Number(container.capacityMt) : 0;
    const estimatedContainers =
      containerCapacity > 0 ? Math.max(1, Math.ceil(quantityMt / containerCapacity)) : null;

    let moqStatus: "ok" | "below_moq" | "no_moq_config" = "no_moq_config";
    if (moq.moqMt !== null) {
      moqStatus = quantityMt >= moq.moqMt ? "ok" : "below_moq";
    }

    return {
      estimatedContainers,
      containerCode: container?.containerCode ?? null,
      containerName: container?.containerName ?? null,
      containerCapacityMt: container ? Number(container.capacityMt) : null,
      moqMt: moq.moqMt,
      moqLabel: moq.moqLabel,
      moqStatus,
      isValid: moqStatus !== "below_moq",
    };
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

    // Get product name for email
    const productName = await this.getProductName(manager, inquiry.productId);

    // Send via template
    await this.mailService.sendFromTemplate(
      EmailType.CUSTOMER_CONFIRM,
      {
        customerName: customer.fullName,
        inquiryCode: inquiry.code,
        inquiryId: inquiry.id,
        email: customer.email,
        productName,
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

  // ── Step 2 attribute persistence ──────────────────────────────────────────
  // Accepts three payload shapes per attribute:
  //   1. optionId (catalog selection, e.g. coconut_size id=42)
  //   2. optionId + customValue (catalog trigger, e.g. optionId=Custom + customValue="14 cm")
  //   3. value (free-form text/number for text-type attributes, legacy)
  //
  // Server-side validation:
  //   - optionId MUST belong to attributeId/attributeCode
  //   - When option has isCustomTrigger=true, customValue is required
  //   - When attribute type is select and optionId is missing → 400
  //   - When attribute is required (mapping.required) → value OR (optionId + customValue) required

  private async upsertInquiryAttributes(
    manager: EntityManager,
    inquiryProductId: number,
    attributes: {
      attributeId?: number;
      attributeCode?: string;
      optionId?: number | null;
      value?: string | null;
      customValue?: string | null;
    }[],
  ): Promise<void> {
    const attributeRepo = manager.getRepository(ProductAttribute);
    const optionRepo = manager.getRepository(ProductAttributeOption);
    const attrLinkRepo = manager.getRepository(InquiryProductAttribute);

    // Resolve attributeId for entries that only have attributeCode
    const codeLookupNeeded = attributes.filter((a) => !a.attributeId && a.attributeCode);
    let attributesByCode: Record<string, ProductAttribute> = {};
    if (codeLookupNeeded.length) {
      const codes = Array.from(new Set(codeLookupNeeded.map((a) => a.attributeCode!)));
      const found = await attributeRepo.find({ where: { code: In(codes) } });
      attributesByCode = Object.fromEntries(found.map((a) => [a.code, a]));
    }

    // Wipe + rewrite (Step 2 is single product, attributes are product-scoped)
    await attrLinkRepo.delete({ inquiryProductId });

    let sortOrder = 0;
    for (const input of attributes) {
      const attribute =
        (input.attributeId
          ? await attributeRepo.findOne({ where: { id: input.attributeId } })
          : attributesByCode[input.attributeCode ?? ""]) ?? null;

      if (!attribute) {
        // Silently skip unknown codes — admin may have removed attribute
        continue;
      }

      let optionId: number | null = input.optionId ?? null;
      let optionValue: string | null = null;
      let customValue: string | null = input.customValue ?? null;

      if (optionId) {
        const option = await optionRepo.findOne({
          where: { id: optionId, attributeId: attribute.id },
        });
        if (!option) {
          throw new BadRequestException(
            `Option ${optionId} does not belong to attribute "${attribute.code}"`,
          );
        }
        optionValue = option.value;

        if (option.isCustomTrigger) {
          const trimmed = customValue?.trim();
          if (!trimmed) {
            throw new BadRequestException(
              `Attribute "${attribute.code}" requires a custom value when "Custom" is selected.`,
            );
          }
          customValue = trimmed;
        }
      } else if (attribute.type === "select") {
        // Select-type attribute without optionId: allow plain value as free-form fallback
        if (input.value?.trim()) {
          optionValue = input.value.trim();
        }
      } else {
        // text/number/boolean/range — store free-form
        if (input.value != null) optionValue = input.value;
      }

      const row = attrLinkRepo.create({
        inquiryProductId,
        attributeId: attribute.id,
        optionId,
        valueText: optionValue,
        customValue,
        sortOrder: sortOrder++,
      });
      await attrLinkRepo.save(row);
    }
  }
}
