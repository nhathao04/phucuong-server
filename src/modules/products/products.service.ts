import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, QueryFailedError, Repository, EntityManager } from "typeorm";
import { CreateProductDto, UpdateProductDto } from "./dto/product-request.dto";
import { ProductListQueryDto } from "./dto/product-list-query.dto";
import {
  ProductAttributeMappingSummaryDto,
  ProductContainerConfigSummaryDto,
  ProductDetailDto,
  ProductCountryConfigSummaryDto,
  ProductCountrySummaryDto,
  ProductListResponseDto,
  ProductListItemDto,
  ProductSummaryDto,
  ProductTradeTermSummaryDto,
  ProductCategorySummaryDto,
  ProductFaqSummaryDto,
  ProductCertificateSummaryDto,
} from "./dto/product-response.dto";
import {
  ProductAttribute,
  ProductAttributeType,
} from "./entities/product-attribute.entity";
import { ProductAttributeMapping } from "./entities/product-attribute-mapping.entity";
import { ProductAttributeOption } from "./entities/product-attribute-option.entity";
import { ProductContainerConfig } from "./entities/product-container-config.entity";
import { Product, ProductStatus } from "./entities/product.entity";
import { ProductFaq } from "./entities/product-faq.entity";
import { ProductCertificate } from "./entities/product-certificate.entity";
import { ProductTradeTerm } from "./entities/product-trade-term.entity";
import { TradeTerm } from "./entities/trade-term.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { ProductCountryConfig } from "./entities/product-country-config.entity";
import { Country } from "../geography/entities/country.entity";

type ProductConfigPayload = Partial<CreateProductDto & UpdateProductDto> & {
  attributeMappings?: Array<{
    attributeId?: string;
    attributeCode?: string;
    defaultOptionId?: string | null;
    defaultOptionValue?: string | null;
    required?: boolean;
    sortOrder?: number;
    metadata?: Record<string, unknown> | null;
  }>;
  containerConfigs?: Array<{
    containerCode: string;
    containerName: string;
    capacityMt: number;
    isDefault?: boolean;
    notes?: string | null;
  }>;
  countryConfigs?: Array<{
    countryId?: string;
    countryCode?: string;
    moqMt?: string | null;
    moqLabel?: string | null;
    leadTimeDays?: number | null;
    seoTitle?: string | null;
    metaDescription?: string | null;
    landingSlug?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }>;
  tradeTerms?: Array<{
    tradeTermId?: number;
    tradeTermCode?: string;
    isDefault?: boolean;
    sortOrder?: number;
  }>;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {}

  private normalizeText(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private buildAttributeNameFromCode(code: string): string {
    return code
      .replace(/[_-]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((segment) =>
        segment.length > 0
          ? segment[0].toUpperCase() + segment.slice(1).toLowerCase()
          : segment,
      )
      .join(" ");
  }

  private async resolveProductCategoryId(
    input: Pick<
      CreateProductDto | UpdateProductDto,
      "productCategoryId" | "productCategorySlug" | "productCategoryName"
    >,
  ): Promise<string | null | undefined> {
    const categorySlug = this.normalizeText(input.productCategorySlug);
    if (categorySlug) {
      const category = await this.productCategoriesRepository.findOne({
        where: { slug: categorySlug },
      });

      if (!category) {
        throw new NotFoundException(
          `Product category not found for slug: ${categorySlug}`,
        );
      }

      return category.id;
    }

    const categoryName = this.normalizeText(input.productCategoryName);
    if (categoryName) {
      const categories = await this.productCategoriesRepository
        .createQueryBuilder("category")
        .where("LOWER(category.name) = LOWER(:name)", { name: categoryName })
        .orderBy("category.createdAt", "ASC")
        .getMany();

      if (categories.length === 0) {
        throw new NotFoundException(
          `Product category not found for name: ${categoryName}`,
        );
      }

      if (categories.length > 1) {
        throw new ConflictException(
          `Multiple product categories match name: ${categoryName}. Use productCategorySlug or productCategoryId instead.`,
        );
      }

      return categories[0].id;
    }

    if (
      input.productCategoryId !== undefined &&
      input.productCategoryId !== null
    ) {
      const categoryById = await this.productCategoriesRepository.findOne({
        where: { id: input.productCategoryId },
      });

      if (categoryById) {
        return categoryById.id;
      }
    }

    return undefined;
  }

  private toSummaryDto(product: Product): ProductSummaryDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      productCode: product.productCode,
      productCategoryId: product.productCategoryId,
      seoTitle: product.seoTitle,
      metaDescription: product.metaDescription,
      focusKeyword: product.focusKeyword,
      description: product.description,
      shortDescription: product.shortDescription,
      thumbnailUrl: product.thumbnailUrl,
      imageUrl: product.imageUrl,
      hsCode: product.hsCode,
      origin: product.origin,
      exportPort: product.exportPort,
      shelfLife: product.shelfLife,
      storageCondition: product.storageCondition,
      sampleAvailable: product.sampleAvailable,
      labReportAvailable: product.labReportAvailable,
      status: product.status,
      sortOrder: product.sortOrder,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toCategoryDto(
    category: ProductCategory | null | undefined,
  ): ProductCategorySummaryDto | null {
    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };
  }

  private toCountryDto(
    country: Country | null | undefined,
  ): ProductCountrySummaryDto | null {
    if (!country) {
      return null;
    }

    return {
      id: country.id,
      code: country.code,
      name: country.name,
    };
  }

  private toAttributeMappingDto(
    mapping: ProductAttributeMapping,
  ): ProductAttributeMappingSummaryDto {
    return {
      id: mapping.id,
      attributeId: mapping.attributeId,
      attributeCode: mapping.attribute?.code ?? null,
      attributeName: mapping.attribute?.name ?? null,
      defaultOptionId: mapping.defaultOptionId,
      defaultOptionValue: mapping.defaultOption?.value ?? null,
      required: mapping.required,
      sortOrder: mapping.sortOrder,
      metadata: mapping.metadata,
    };
  }

  private toContainerConfigDto(
    config: ProductContainerConfig,
  ): ProductContainerConfigSummaryDto {
    return {
      id: config.id,
      containerCode: config.containerCode,
      containerName: config.containerName,
      capacityMt: config.capacityMt,
      isDefault: config.isDefault,
      notes: config.notes,
    };
  }

  private toCountryConfigDto(
    config: ProductCountryConfig,
  ): ProductCountryConfigSummaryDto {
    return {
      id: config.id,
      country: this.toCountryDto(config.country) ?? {
        id: config.countryId,
        code: "",
        name: "",
      },
      moqMt: config.moqMt,
      moqLabel: config.moqLabel,
      leadTimeDays: config.leadTimeDays,
      seoTitle: config.seoTitle,
      metaDescription: config.metaDescription,
      landingSlug: config.landingSlug,
      isActive: config.isActive,
      sortOrder: config.sortOrder,
    };
  }

  private toTradeTermDto(
    productTradeTerm: ProductTradeTerm,
  ): ProductTradeTermSummaryDto {
    return {
      id: productTradeTerm.id,
      tradeTermId: productTradeTerm.tradeTermId,
      code: productTradeTerm.tradeTerm?.code ?? "",
      name: productTradeTerm.tradeTerm?.name ?? "",
      isDefault: productTradeTerm.isDefault,
      sortOrder: productTradeTerm.sortOrder,
    };
  }

  private toFaqDto(faq: ProductFaq): ProductFaqSummaryDto {
    return {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
    };
  }

  private toCertificateDto(
    cert: ProductCertificate,
  ): ProductCertificateSummaryDto {
    return {
      id: cert.id,
      name: cert.certificate?.name ?? "",
      status: cert.certificate?.status ?? null,
      fileUrl: cert.certificate?.fileUrl ?? null,
    };
  }

  private toDetailDto(product: Product): ProductDetailDto {
    return {
      ...this.toSummaryDto(product),
      countryConfigs: (product.countryConfigs ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((config) => this.toCountryConfigDto(config)),
      attributeMappings: (product.attributeMappings ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((mapping) => this.toAttributeMappingDto(mapping)),
      containerConfigs: (product.containerConfigs ?? [])
        .slice()
        .map((config) => this.toContainerConfigDto(config)),
      tradeTerms: (product.tradeTerms ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((tradeTerm) => this.toTradeTermDto(tradeTerm)),
      faqs: (product.faqs ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((faq) => this.toFaqDto(faq)),
      certificates: (product.certificates ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cert) => this.toCertificateDto(cert)),
    };
  }

  private toListItemDto(product: Product): ProductListItemDto {
    return {
      ...this.toSummaryDto(product),
      productCategory: this.toCategoryDto(product.productCategory),
      countryConfigs: (product.countryConfigs ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((config) => this.toCountryConfigDto(config)),
      attributeMappings: (product.attributeMappings ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((mapping) => this.toAttributeMappingDto(mapping)),
      containerConfigs: (product.containerConfigs ?? [])
        .slice()
        .map((config) => this.toContainerConfigDto(config)),
      tradeTerms: (product.tradeTerms ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((tradeTerm) => this.toTradeTermDto(tradeTerm)),
    };
  }

  private async loadProductForDetail(
    productId: string,
    manager?: EntityManager,
  ): Promise<Product> {
    const productRepository = manager
      ? manager.getRepository(Product)
      : this.productsRepository;

    const product = await productRepository.findOne({
      where: { id: productId },
      relations: {
        productCategory: true,
        countryConfigs: { country: true },
        attributeMappings: { attribute: true, defaultOption: true },
        containerConfigs: true,
        tradeTerms: { tradeTerm: true },
        faqs: true,
        certificates: { certificate: true },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  private resolveSlug(name: string, slug?: string): string {
    const source = slug?.trim() || name;
    const normalizedSlug = this.slugify(source);

    if (!normalizedSlug) {
      throw new BadRequestException("Product slug cannot be empty");
    }

    return normalizedSlug;
  }

  private async buildProductPayload(
    input: CreateProductDto | UpdateProductDto,
    existingProduct?: Product,
  ): Promise<Partial<Product>> {
    const hasName = typeof input.name === "string";
    const nextName = hasName ? input.name : existingProduct?.name;
    const resolvedCategoryId = await this.resolveProductCategoryId(input);

    return {
      name: input.name ?? existingProduct?.name,
      slug:
        hasName || input.slug
          ? this.resolveSlug(nextName ?? "", input.slug)
          : existingProduct?.slug,
      productCode:
        input.productCode !== undefined
          ? input.productCode
          : (existingProduct?.productCode ?? null),
      productCategoryId:
        resolvedCategoryId !== undefined
          ? resolvedCategoryId
          : (existingProduct?.productCategoryId ?? null),
      seoTitle:
        input.seoTitle !== undefined
          ? input.seoTitle
          : (existingProduct?.seoTitle ?? null),
      metaDescription:
        input.metaDescription !== undefined
          ? input.metaDescription
          : (existingProduct?.metaDescription ?? null),
      focusKeyword:
        input.focusKeyword !== undefined
          ? input.focusKeyword
          : (existingProduct?.focusKeyword ?? null),
      description:
        input.description !== undefined
          ? input.description
          : (existingProduct?.description ?? null),
      isActive:
        input.isActive !== undefined
          ? input.isActive
          : (existingProduct?.isActive ?? true),
      hsCode:
        input.hsCode !== undefined
          ? input.hsCode
          : (existingProduct?.hsCode ?? null),
      origin:
        input.origin !== undefined
          ? input.origin
          : (existingProduct?.origin ?? null),
      exportPort:
        input.exportPort !== undefined
          ? input.exportPort
          : (existingProduct?.exportPort ?? null),
      shelfLife:
        input.shelfLife !== undefined
          ? input.shelfLife
          : (existingProduct?.shelfLife ?? null),
      storageCondition:
        input.storageCondition !== undefined
          ? input.storageCondition
          : (existingProduct?.storageCondition ?? null),
      sampleAvailable:
        input.sampleAvailable !== undefined
          ? input.sampleAvailable
          : (existingProduct?.sampleAvailable ?? false),
      labReportAvailable:
        input.labReportAvailable !== undefined
          ? input.labReportAvailable
          : (existingProduct?.labReportAvailable ?? false),
      status:
        input.status !== undefined
          ? input.status
          : (existingProduct?.status ?? ProductStatus.DRAFT),
      sortOrder:
        input.sortOrder !== undefined
          ? input.sortOrder
          : (existingProduct?.sortOrder ?? 0),
      isFeatured:
        input.isFeatured !== undefined
          ? input.isFeatured
          : (existingProduct?.isFeatured ?? false),
    };
  }

  private async resolveCountryConfigCountryId(countryInput: {
    countryId?: string;
    countryCode?: string;
  }): Promise<string> {
    if (countryInput.countryId) {
      const country = await this.countriesRepository.findOne({
        where: { id: countryInput.countryId, isActive: true },
      });

      if (!country) {
        throw new BadRequestException(
          `Country not found for id: ${countryInput.countryId}`,
        );
      }

      return country.id;
    }

    if (countryInput.countryCode) {
      const code = countryInput.countryCode.trim().toUpperCase();
      const country = await this.countriesRepository.findOne({
        where: { code, isActive: true },
      });

      if (!country) {
        throw new BadRequestException(`Country not found for code: ${code}`);
      }

      return country.id;
    }

    throw new BadRequestException(
      "Each country config item must include countryId or countryCode",
    );
  }

  private async syncAttributeMappings(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;

    if (!configInput.attributeMappings) {
      return;
    }

    const attributeMappingRepository = manager.getRepository(
      ProductAttributeMapping,
    );
    const attributeRepository = manager.getRepository(ProductAttribute);
    const optionRepository = manager.getRepository(ProductAttributeOption);

    await attributeMappingRepository.delete({ productId });

    if (configInput.attributeMappings.length === 0) {
      return;
    }

    const attributeIds = [
      ...new Set(
        configInput.attributeMappings
          .map(
            (
              item: NonNullable<
                ProductConfigPayload["attributeMappings"]
              >[number],
            ) => item.attributeId,
          )
          .filter((value): value is string => typeof value === "string"),
      ),
    ];

    const attributeCodes = [
      ...new Set(
        configInput.attributeMappings
          .map(
            (
              item: NonNullable<
                ProductConfigPayload["attributeMappings"]
              >[number],
            ) => item.attributeCode?.trim().toLowerCase(),
          )
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const attributesById = new Map<string, ProductAttribute>();
    const attributesByCode = new Map<string, ProductAttribute>();

    if (attributeIds.length > 0) {
      const attributesByIdList = await attributeRepository.find({
        where: { id: In(attributeIds) },
      });
      for (const attribute of attributesByIdList) {
        attributesById.set(attribute.id, attribute);
        attributesByCode.set(attribute.code.trim().toLowerCase(), attribute);
      }
    }

    if (attributeCodes.length > 0) {
      const attributesByCodeList = await attributeRepository
        .createQueryBuilder("attribute")
        .where("LOWER(attribute.code) IN (:...codes)", {
          codes: attributeCodes,
        })
        .getMany();

      for (const attribute of attributesByCodeList) {
        attributesById.set(attribute.id, attribute);
        attributesByCode.set(attribute.code.trim().toLowerCase(), attribute);
      }
    }

    const resolvedMappings: Array<{
      input: NonNullable<ProductConfigPayload["attributeMappings"]>[number];
      attributeId: string;
    }> = [];

    for (const mappingInput of configInput.attributeMappings) {
      const resolvedById = mappingInput.attributeId
        ? attributesById.get(mappingInput.attributeId)
        : undefined;
      const resolvedByCode = mappingInput.attributeCode
        ? attributesByCode.get(mappingInput.attributeCode.trim().toLowerCase())
        : undefined;
      let resolvedAttribute = resolvedById ?? resolvedByCode;

      if (!mappingInput.attributeId && !mappingInput.attributeCode) {
        throw new BadRequestException(
          "Each attribute mapping must provide attributeId or attributeCode",
        );
      }

      if (!resolvedAttribute && mappingInput.attributeCode) {
        const normalizedCode = mappingInput.attributeCode.trim().toLowerCase();
        const createdAttribute = await attributeRepository.save(
          attributeRepository.create({
            code: normalizedCode,
            name: this.buildAttributeNameFromCode(normalizedCode),
            type: ProductAttributeType.SELECT,
            isActive: true,
          }),
        );

        attributesById.set(createdAttribute.id, createdAttribute);
        attributesByCode.set(normalizedCode, createdAttribute);
        resolvedAttribute = createdAttribute;
      }

      if (!resolvedAttribute) {
        throw new BadRequestException(
          `Attribute not found for mapping: ${mappingInput.attributeId ?? mappingInput.attributeCode}`,
        );
      }

      resolvedMappings.push({
        input: mappingInput,
        attributeId: resolvedAttribute.id,
      });
    }

    const defaultOptionIds = [
      ...new Set(
        resolvedMappings
          .map((item) => item.input)
          .map((item) => item.defaultOptionId)
          .filter((value): value is string => typeof value === "string"),
      ),
    ];

    let optionsById = new Map<string, ProductAttributeOption>();
    if (defaultOptionIds.length > 0) {
      const options = await optionRepository.find({
        where: { id: In(defaultOptionIds) },
      });
      if (options.length !== defaultOptionIds.length) {
        throw new BadRequestException(
          "One or more defaultOptionId values are invalid",
        );
      }
      optionsById = new Map(options.map((option) => [option.id, option]));
    }

    const resolveOptionByValue = async (
      attributeId: string,
      value: string,
    ): Promise<ProductAttributeOption | null> => {
      return optionRepository
        .createQueryBuilder("option")
        .where("option.attributeId = :attributeId", { attributeId })
        .andWhere("LOWER(option.value) = LOWER(:value)", {
          value: value.trim(),
        })
        .getOne();
    };

    const mappings: ProductAttributeMapping[] = [];
    for (const resolvedMapping of resolvedMappings) {
      const mappingInput = resolvedMapping.input;
      let resolvedDefaultOptionId: string | null = null;

      if (mappingInput.defaultOptionId) {
        const option = optionsById.get(mappingInput.defaultOptionId);
        if (!option || option.attributeId !== resolvedMapping.attributeId) {
          throw new BadRequestException(
            `defaultOptionId ${mappingInput.defaultOptionId} does not belong to resolved attribute`,
          );
        }
        resolvedDefaultOptionId = option.id;
      } else if (mappingInput.defaultOptionValue) {
        const option = await resolveOptionByValue(
          resolvedMapping.attributeId,
          mappingInput.defaultOptionValue,
        );
        if (option) {
          resolvedDefaultOptionId = option.id;
        } else {
          const createdOption = await optionRepository.save(
            optionRepository.create({
              attributeId: resolvedMapping.attributeId,
              value: mappingInput.defaultOptionValue.trim(),
              isActive: true,
              sortOrder: 0,
            }),
          );
          optionsById.set(createdOption.id, createdOption);
          resolvedDefaultOptionId = createdOption.id;
        }
      }

      mappings.push(
        attributeMappingRepository.create({
          productId,
          attributeId: resolvedMapping.attributeId,
          defaultOptionId: resolvedDefaultOptionId,
          required: mappingInput.required ?? false,
          sortOrder: mappingInput.sortOrder ?? 0,
          metadata: mappingInput.metadata ?? null,
        }),
      );
    }

    await attributeMappingRepository.save(mappings);
  }

  private async syncContainerConfigs(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;

    if (!configInput.containerConfigs) {
      return;
    }

    const containerConfigRepository = manager.getRepository(
      ProductContainerConfig,
    );
    await containerConfigRepository.delete({ productId });

    if (configInput.containerConfigs.length === 0) {
      return;
    }

    const configs = configInput.containerConfigs.map(
      (
        configInput: NonNullable<
          ProductConfigPayload["containerConfigs"]
        >[number],
      ) =>
        containerConfigRepository.create({
          productId,
          containerCode: configInput.containerCode,
          containerName: configInput.containerName,
          capacityMt: configInput.capacityMt.toFixed(2),
          isDefault: configInput.isDefault ?? false,
          notes: configInput.notes ?? null,
        }),
    );

    await containerConfigRepository.save(configs);
  }

  private async syncCountryConfigs(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;

    if (!configInput.countryConfigs) {
      return;
    }

    const countryConfigRepository = manager.getRepository(ProductCountryConfig);
    await countryConfigRepository.delete({ productId });

    if (configInput.countryConfigs.length === 0) {
      return;
    }

    const resolvedCountryIds: string[] = [];
    for (const countryConfigInput of configInput.countryConfigs) {
      const countryId = await this.resolveCountryConfigCountryId({
        countryId: countryConfigInput.countryId,
        countryCode: countryConfigInput.countryCode,
      });

      if (resolvedCountryIds.includes(countryId)) {
        throw new BadRequestException(
          "Duplicate country config provided in payload",
        );
      }

      resolvedCountryIds.push(countryId);
    }

    const entries = configInput.countryConfigs.map(
      (
        countryConfigInput: NonNullable<
          ProductConfigPayload["countryConfigs"]
        >[number],
        index: number,
      ) => {
        const countryId = resolvedCountryIds[index];

        return countryConfigRepository.create({
          productId,
          countryId,
          moqMt: countryConfigInput.moqMt ?? null,
          moqLabel: countryConfigInput.moqLabel ?? null,
          leadTimeDays: countryConfigInput.leadTimeDays ?? null,
          seoTitle: countryConfigInput.seoTitle ?? null,
          metaDescription: countryConfigInput.metaDescription ?? null,
          landingSlug: countryConfigInput.landingSlug ?? null,
          isActive: countryConfigInput.isActive ?? true,
          sortOrder: countryConfigInput.sortOrder ?? index,
        });
      },
    );

    await countryConfigRepository.save(entries);
  }

  private async resolveTradeTermId(
    manager: EntityManager,
    tradeTermInput: { tradeTermId?: number; tradeTermCode?: string },
  ): Promise<number> {
    const tradeTermRepository = manager.getRepository(TradeTerm);

    if (tradeTermInput.tradeTermId !== undefined) {
      const tradeTerm = await tradeTermRepository.findOne({
        where: { id: tradeTermInput.tradeTermId, isActive: true },
      });
      if (!tradeTerm) {
        throw new BadRequestException(
          `Trade term not found for id: ${tradeTermInput.tradeTermId}`,
        );
      }
      return tradeTerm.id;
    }

    if (tradeTermInput.tradeTermCode) {
      const code = tradeTermInput.tradeTermCode.trim().toUpperCase();
      const tradeTerm = await tradeTermRepository.findOne({
        where: { code, isActive: true },
      });
      if (!tradeTerm) {
        throw new BadRequestException(`Trade term not found for code: ${code}`);
      }
      return tradeTerm.id;
    }

    throw new BadRequestException(
      "Each trade term item must include tradeTermId or tradeTermCode",
    );
  }

  private async syncTradeTerms(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;

    if (!configInput.tradeTerms) {
      return;
    }

    const productTradeTermRepository = manager.getRepository(ProductTradeTerm);
    await productTradeTermRepository.delete({ productId });

    if (configInput.tradeTerms.length === 0) {
      return;
    }

    const resolvedTradeTermIds: number[] = [];
    for (const tradeTermInput of configInput.tradeTerms) {
      const tradeTermId = await this.resolveTradeTermId(
        manager,
        tradeTermInput,
      );
      if (resolvedTradeTermIds.includes(tradeTermId)) {
        throw new BadRequestException(
          "Duplicate trade term provided in payload",
        );
      }
      resolvedTradeTermIds.push(tradeTermId);
    }

    const entries = configInput.tradeTerms.map(
      (
        tradeTermInput: NonNullable<ProductConfigPayload["tradeTerms"]>[number],
        index: number,
      ) =>
        productTradeTermRepository.create({
          productId,
          tradeTermId: resolvedTradeTermIds[index],
          isDefault: tradeTermInput.isDefault ?? false,
          sortOrder: tradeTermInput.sortOrder ?? index,
        }),
    );

    await productTradeTermRepository.save(entries);
  }

  private async syncProductConfigurations(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    await this.syncAttributeMappings(manager, productId, input);
    await this.syncContainerConfigs(manager, productId, input);
    await this.syncCountryConfigs(manager, productId, input);
    await this.syncTradeTerms(manager, productId, input);
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === "object" &&
      error.driverError !== null &&
      "code" in error.driverError &&
      (error.driverError as { code?: string }).code === "23505"
    );
  }

  async listForStaff(
    query: ProductListQueryDto,
  ): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const hasIsActiveFilter = typeof query.isActive === "boolean";

    const qb = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.productCategory", "productCategory")
      .leftJoinAndSelect("product.countryConfigs", "countryConfigs")
      .leftJoinAndSelect("countryConfigs.country", "country")
      .leftJoinAndSelect("product.attributeMappings", "attributeMappings")
      .leftJoinAndSelect("attributeMappings.attribute", "attribute")
      .leftJoinAndSelect("attributeMappings.defaultOption", "defaultOption")
      .leftJoinAndSelect("product.containerConfigs", "containerConfigs")
      .leftJoinAndSelect("product.tradeTerms", "productTradeTerms")
      .leftJoinAndSelect("productTradeTerms.tradeTerm", "tradeTerm")
      .orderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        "(product.name ILIKE :search OR product.slug ILIKE :search OR product.productCode ILIKE :search OR product.seoTitle ILIKE :search OR product.description ILIKE :search)",
        {
          search: `%${search}%`,
        },
      );
    }

    if (hasIsActiveFilter) {
      qb.andWhere("product.isActive = :isActive", {
        isActive: query.isActive,
      });
    }

    const [products, total] = await qb.getManyAndCount();

    return {
      items: products.map((product) => this.toListItemDto(product)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async getStaffDetail(identifier: string): Promise<ProductDetailDto> {
    const product = await this.productsRepository.findOne({
      where: [{ id: identifier }, { slug: identifier }],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const detailProduct = await this.loadProductForDetail(product.id);
    return this.toDetailDto(detailProduct);
  }

  async createStaffProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductDetailDto> {
    try {
      return await this.productsRepository.manager.transaction(
        async (manager) => {
          const productRepository = manager.getRepository(Product);
          const product = productRepository.create(
            await this.buildProductPayload(createProductDto),
          );

          const savedProduct = await productRepository.save(product);
          await this.syncProductConfigurations(
            manager,
            savedProduct.id,
            createProductDto,
          );
          const detailProduct = await this.loadProductForDetail(
            savedProduct.id,
            manager,
          );
          return this.toDetailDto(detailProduct);
        },
      );
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Product slug already exists");
      }

      throw error;
    }
  }

  async updateStaffProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDetailDto> {
    try {
      return await this.productsRepository.manager.transaction(
        async (manager) => {
          const productRepository = manager.getRepository(Product);
          const product = await productRepository.findOne({ where: { id } });

          if (!product) {
            throw new NotFoundException("Product not found");
          }

          const updatedProduct = productRepository.merge(
            product,
            await this.buildProductPayload(updateProductDto, product),
          );

          const savedProduct = await productRepository.save(updatedProduct);
          await this.syncProductConfigurations(
            manager,
            savedProduct.id,
            updateProductDto,
          );
          const detailProduct = await this.loadProductForDetail(
            savedProduct.id,
            manager,
          );
          return this.toDetailDto(detailProduct);
        },
      );
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Product slug already exists");
      }

      throw error;
    }
  }

  // ─────────────────────── Public endpoints ───────────────────────

  async listPublic(
    query: ProductListQueryDto,
  ): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.productCategory", "productCategory")
      .leftJoinAndSelect("product.countryConfigs", "countryConfigs")
      .leftJoinAndSelect("countryConfigs.country", "country")
      .leftJoinAndSelect("product.attributeMappings", "attributeMappings")
      .leftJoinAndSelect("attributeMappings.attribute", "attribute")
      .leftJoinAndSelect("attributeMappings.defaultOption", "defaultOption")
      .leftJoinAndSelect("product.containerConfigs", "containerConfigs")
      .leftJoinAndSelect("product.tradeTerms", "productTradeTerms")
      .leftJoinAndSelect("productTradeTerms.tradeTerm", "tradeTerm")
      .where("product.status = :status", { status: ProductStatus.PUBLISHED })
      .andWhere("product.isActive = true")
      .orderBy("product.sortOrder", "ASC")
      .addOrderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        "(product.name ILIKE :search OR product.slug ILIKE :search OR product.description ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    const [products, total] = await qb.getManyAndCount();

    return {
      items: products.map((product) => this.toListItemDto(product)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async getPublicDetail(identifier: string): Promise<ProductDetailDto> {
    const product = await this.productsRepository.findOne({
      where: [
        { id: identifier, status: ProductStatus.PUBLISHED, isActive: true },
        { slug: identifier, status: ProductStatus.PUBLISHED, isActive: true },
      ],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const detailProduct = await this.loadProductForDetail(product.id);
    return this.toDetailDto(detailProduct);
  }
}
