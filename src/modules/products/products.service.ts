import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, QueryFailedError, Repository, EntityManager, FindOptionsWhere } from "typeorm";
import {
  CreateProductDto,
  ProductAttributeValueInputDto,
  ProductCertificateInputDto,
  ProductFaqInputDto,
  ProductImageRefDto,
  ProductPackagingOptionInputDto,
  ProductQuoteConfigInputDto,
  ProductTargetBuyerInputDto,
  ProductTechnicalSpecificationInputDto,
  ProductWhyChooseUsInputDto,
  UpdateProductDto,
  ProductApplicationInputDto,
  ProductApplicationAttributeInputDto,
} from "./dto/product-request.dto";
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "./dto/product-category.dto";
import { ProductListQueryDto } from "./dto/product-list-query.dto";
import {
  AssetSummaryDto,
} from "../media/dto/asset.dto";
import { AssetOwnerType } from "../media/entities/asset.entity";
import {
  ProductAttributeMappingSummaryDto,
  ProductAttributeValueResponseDto,
  ProductAttributeValueSummaryDto,
  ProductCertificateSummaryDto,
  ProductContainerConfigSummaryDto,
  ProductCountryConfigSummaryDto,
  ProductCountrySummaryDto,
  ProductDetailDto,
  ProductFaqSummaryDto,
  ProductHeroDto,
  ProductHeroStatDto,
  ProductListItemDto,
  ProductListResponseDto,
  ProductOrderConfigDto,
  InquiryOrderAttributeMappingDto,
  InquiryOrderAttributeOptionDto,
  InquiryOrderContainerConfigDto,
  InquiryOrderCountryConfigDto,
  InquiryOrderTradeTermDto,
  ProductPackagingOptionDto,
  ProductQuoteConfigDto,
  ProductQuoteConfigFieldDto,
  ProductSummaryDto,
  ProductTargetBuyerDto,
  ProductTechnicalSpecificationDto,
  ProductTradeTermSummaryDto,
  ProductCategorySummaryDto,
  ProductWhyChooseUsDto,
  ProductApplicationResponseDto,
} from "./dto/product-response.dto";
import {
  ProductAttribute,
  ProductAttributeGroup,
  ProductAttributeType,
} from "./entities/product-attribute.entity";
import { ProductAttributeMapping } from "./entities/product-attribute-mapping.entity";
import { ProductAttributeOption } from "./entities/product-attribute-option.entity";
import { ProductAttributeValue } from "./entities/product-attribute-value.entity";
import { ProductContainerConfig } from "./entities/product-container-config.entity";
import { ProductImage } from "./entities/product-image.entity";
import {
  Product,
  ProductStatus,
} from "./entities/product.entity";
import { ProductFaq } from "./entities/product-faq.entity";
import { ProductCertificate } from "./entities/product-certificate.entity";
import { ProductTradeTerm } from "./entities/product-trade-term.entity";
import { TradeTerm } from "./entities/trade-term.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { ProductCountryConfig } from "./entities/product-country-config.entity";
import { ProductTechnicalSpecification } from "./entities/product-technical-specification.entity";
import { ProductPackagingOption } from "./entities/product-packaging-option.entity";
import { ProductTargetBuyer } from "./entities/product-target-buyer.entity";
import { ProductWhyChooseUs } from "./entities/product-why-choose-us.entity";
import { ProductApplication } from "./entities/product-application.entity";
import { ProductApplicationAttribute } from "./entities/product-application-attribute.entity";
import { Country } from "../geography/entities/country.entity";
import { Asset } from "../media/entities/asset.entity";
import { Certificate } from "../inquiries/entities/certificate.entity";

type ProductConfigPayload = Partial<CreateProductDto & UpdateProductDto> & {
  attributeMappings?: Array<{
    attributeId?: number;
    attributeCode?: string;
    defaultOptionId?: number | null;
    defaultOptionValue?: string | null;
    required?: boolean;
    isInquiryField?: boolean;
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
  images?: ProductImageRefDto[];
  attributeValues?: ProductAttributeValueInputDto[];
  technicalSpecifications?: ProductTechnicalSpecificationInputDto[];
  packagingOptions?: ProductPackagingOptionInputDto[];
  targetBuyers?: ProductTargetBuyerInputDto[];
  whyChooseUs?: ProductWhyChooseUsInputDto[];
  faqs?: ProductFaqInputDto[];
  certificates?: ProductCertificateInputDto[];
  badges?: string[];
  hero?: ProductQuoteConfigInputDto extends never
    ? never
    : {
        eyebrow?: string | null;
        title?: string | null;
        subtitle?: string | null;
        stats?: Array<{ value: string; label: string }>;
      } | null;
  quoteConfig?: ProductQuoteConfigInputDto | null;
  applications?: ProductApplicationInputDto[];
};

const toAssetSummary = (asset: Asset | null | undefined): AssetSummaryDto | null => {
  if (!asset) return null;
  return {
    id: asset.id,
    url: asset.url,
    thumbnailUrl: asset.thumbnailUrl,
    alt: asset.alt,
    caption: asset.caption,
    width: asset.width,
    height: asset.height,
    sortOrder: asset.sortOrder,
  };
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
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
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
      description: category.description ?? null,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
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
      isInquiryField: mapping.isInquiryField,
      sortOrder: mapping.sortOrder,
      metadata: mapping.metadata,
    };
  }

  private toAttributeSpecifications(
    product: Product,
  ): ProductAttributeValueResponseDto[] {
    return (product.attributeValues ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((value: ProductAttributeValue): ProductAttributeValueResponseDto => ({
        id: value.id,
        attributeId: value.attributeId,
        code: value.attribute?.code ?? "",
        name: value.attribute?.name ?? "",
        groupKey: value.attribute?.groupKey ?? "other",
        type: value.attribute?.type ?? "text",
        sectionLabel:
          value.sectionLabel ?? value.attribute?.sectionLabel ?? null,
        value: value.value ?? null,
        valueNumber: value.valueNumber ?? null,
        unit: value.unit ?? value.attribute?.unit ?? null,
        footnote: value.footnote ?? value.attribute?.footnote ?? null,
        required: value.required,
        sortOrder: value.sortOrder,
      }));
  }

  private toAttributeValueSummary(
    value: ProductAttributeValue,
  ): ProductAttributeValueSummaryDto {
    return {
      code: value.attribute?.code ?? "",
      name: value.attribute?.name ?? "",
      groupKey: value.attribute?.groupKey ?? "other",
      value: value.value ?? null,
      footnote: value.footnote ?? value.attribute?.footnote ?? null,
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
      isActive: cert.certificate?.isActive ?? true,
      fileUrl: cert.certificate?.fileUrl ?? null,
    };
  }

  private toApplications(
    product: Product,
  ): ProductApplicationResponseDto[] {
    return [...(product.applications ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((app) => ({
        id: app.id,
        introLine: app.introLine ?? null,
        attributes: [...(app.attributes ?? [])]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((attr) => ({
            id: attr.id,
            name: attr.name,
            value: attr.value ?? null,
            sortOrder: attr.sortOrder,
          })),
        sortOrder: app.sortOrder,
      }));
  }

  private toImageDto(image: ProductImage): AssetSummaryDto | null {
    return toAssetSummary(image.asset);
  }

  private toImages(product: Product): AssetSummaryDto[] {
    if (!product.images) return [];
    return [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => this.toImageDto(image))
      .filter((asset): asset is AssetSummaryDto => Boolean(asset));
  }

  private toHero(product: Product): ProductHeroDto | null {
    if (!product.hero) return null;
    const hero = product.hero;
    return {
      eyebrow: hero.eyebrow ?? null,
      title: hero.title ?? null,
      subtitle: hero.subtitle ?? null,
      stats: Array.isArray(hero.stats)
        ? hero.stats.map<ProductHeroStatDto>((stat) => ({
            value: String(stat?.value ?? ""),
            label: String(stat?.label ?? ""),
          }))
        : [],
    };
  }

  private toTechnicalSpecifications(
    product: Product,
  ): ProductTechnicalSpecificationDto[] {
    if (!product.technicalSpecifications) return [];
    return [...product.technicalSpecifications]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map<ProductTechnicalSpecificationDto>((spec) => ({
        label: spec.label,
        value: spec.value,
        unit: spec.unit,
      }));
  }

  private toPackagingOptions(
    product: Product,
  ): ProductPackagingOptionDto[] {
    if (!product.packagingOptions) return [];
    return [...product.packagingOptions]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map<ProductPackagingOptionDto>((option) => ({
        title: option.title,
        description: option.description,
        details: Array.isArray(option.details) ? option.details : [],
      }));
  }

  private toTargetBuyers(product: Product): ProductTargetBuyerDto[] {
    if (!product.targetBuyers) return [];
    return [...product.targetBuyers]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map<ProductTargetBuyerDto>((target) => ({
        title: target.title,
        description: target.description,
      }));
  }

  private toWhyChooseUs(product: Product): ProductWhyChooseUsDto[] {
    if (!product.whyChooseUs) return [];
    return [...product.whyChooseUs]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map<ProductWhyChooseUsDto>((reason) => ({
        title: reason.title,
        description: reason.description,
      }));
  }

  private toQuoteConfig(product: Product): ProductQuoteConfigDto | null {
    if (!product.quoteConfig) return null;
    const quoteConfig = product.quoteConfig;
    return {
      moq: quoteConfig.moq ?? null,
      tradeTerms: Array.isArray(quoteConfig.tradeTerms)
        ? quoteConfig.tradeTerms
        : [],
      fields: Array.isArray(quoteConfig.fields)
        ? quoteConfig.fields.map<ProductQuoteConfigFieldDto>((field) => ({
            key: field.key,
            label: field.label,
            type: field.type,
            unit: field.unit ?? null,
            required: Boolean(field.required),
            options: Array.isArray(field.options) ? field.options : [],
          }))
        : [],
    };
  }

  private toSummaryDto(product: Product): ProductSummaryDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      productCode: product.productCode,
      productCategoryId: product.productCategoryId,
      productCategory: this.toCategoryDto(product.productCategory),
      seoTitle: product.seoTitle,
      metaDescription: product.metaDescription,
      focusKeyword: product.focusKeyword,
      description: product.description,
      shortDescription: product.shortDescription,
      thumbnailUrl: product.thumbnailUrl,
      imageUrl: product.imageUrl,
      badges: product.badges ?? [],
      images: this.toImages(product),
      status: product.status,
      sortOrder: product.sortOrder,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toListItemDto(product: Product): ProductListItemDto {
    const attrValues = (product.attributeValues ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const grouped: Record<string, ProductAttributeValueSummaryDto[]> = {};
    for (const value of attrValues) {
      const summary = this.toAttributeValueSummary(value);
      const key = summary.groupKey;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(summary);
    }

    return {
      ...this.toSummaryDto(product),
      countryConfigs: (product.countryConfigs ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((config) => this.toCountryConfigDto(config)),
      attributeGrouped: grouped as ProductListItemDto["attributeGrouped"],
    };
  }

  private toDetailDto(product: Product): ProductDetailDto {
    const attrSpecs = this.toAttributeSpecifications(product);
    const grouped: Record<string, ProductAttributeValueResponseDto[]> = {};
    for (const item of attrSpecs) {
      if (!grouped[item.groupKey]) {
        grouped[item.groupKey] = [];
      }
      grouped[item.groupKey].push(item);
    }

    return {
      ...this.toSummaryDto(product),
      hero: this.toHero(product),
      technicalSpecifications: this.toTechnicalSpecifications(product),
      packagingOptions: this.toPackagingOptions(product),
      targetBuyers: this.toTargetBuyers(product),
      whyChooseUs: this.toWhyChooseUs(product),
      quoteConfig: this.toQuoteConfig(product),
      countryConfigs: (product.countryConfigs ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((config) => this.toCountryConfigDto(config)),
      attributeGrouped: grouped as ProductDetailDto["attributeGrouped"],
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
      applications: this.toApplications(product),
    };
  }

  private async loadProductForDetail(
    productId: string,
    manager?: EntityManager,
  ): Promise<Product> {
    const product = await this.loadProductForDetailByWhere(
      { id: productId },
      manager,
    );
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return product;
  }

  private async loadProductForDetailByLookup(
    lookup: FindOptionsWhere<Product>,
  ): Promise<Product> {
    const product = await this.loadProductForDetailByWhere(lookup);
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  private async loadProductForDetailByWhere(
    where: FindOptionsWhere<Product>,
    manager?: EntityManager,
  ): Promise<Product | null> {
    const repo = manager
      ? manager.getRepository(Product)
      : this.productsRepository;

    const product = await repo.findOne({
      where,
      relations: { productCategory: true },
    });

    if (!product) {
      return null;
    }

    const mgr = repo.manager;
    const productId = product.id;

    const countryConfigs = await mgr
      .getRepository(ProductCountryConfig)
      .find({
        where: { productId },
        relations: { country: true },
        order: { sortOrder: "ASC" },
      });
    const attributeMappings = await mgr
      .getRepository(ProductAttributeMapping)
      .find({
        where: { productId },
        relations: { attribute: true, defaultOption: true },
        order: { sortOrder: "ASC" },
      });
    const attributeValues = await mgr
      .getRepository(ProductAttributeValue)
      .find({
        where: { productId },
        relations: { attribute: true },
        order: { sortOrder: "ASC" },
      });
    const containerConfigs = await mgr
      .getRepository(ProductContainerConfig)
      .find({
        where: { productId },
      });
    const tradeTerms = await mgr.getRepository(ProductTradeTerm).find({
      where: { productId },
      relations: { tradeTerm: true },
      order: { sortOrder: "ASC" },
    });
    const faqs = await mgr.getRepository(ProductFaq).find({
      where: { productId },
      order: { sortOrder: "ASC" },
    });
    const certificates = await mgr.getRepository(ProductCertificate).find({
      where: { productId },
      relations: { certificate: true },
      order: { sortOrder: "ASC" },
    });
    const images = await mgr.getRepository(ProductImage).find({
      where: { productId },
      relations: { asset: true },
      order: { sortOrder: "ASC" },
    });
    const technicalSpecifications = await mgr
      .getRepository(ProductTechnicalSpecification)
      .find({
        where: { productId },
        order: { sortOrder: "ASC" },
      });
    const packagingOptions = await mgr
      .getRepository(ProductPackagingOption)
      .find({
        where: { productId },
        order: { sortOrder: "ASC" },
      });
    const targetBuyers = await mgr.getRepository(ProductTargetBuyer).find({
      where: { productId },
      order: { sortOrder: "ASC" },
    });
    const whyChooseUs = await mgr.getRepository(ProductWhyChooseUs).find({
      where: { productId },
      order: { sortOrder: "ASC" },
    });
    const applications = await mgr.getRepository(ProductApplication).find({
      where: { productId },
      relations: { attributes: true },
      order: { sortOrder: "ASC" },
    });

    product.countryConfigs = countryConfigs;
    product.attributeMappings = attributeMappings;
    product.attributeValues = attributeValues;
    product.containerConfigs = containerConfigs;
    product.tradeTerms = tradeTerms;
    product.faqs = faqs;
    product.certificates = certificates;
    product.images = images;
    product.technicalSpecifications = technicalSpecifications;
    product.packagingOptions = packagingOptions;
    product.targetBuyers = targetBuyers;
    product.whyChooseUs = whyChooseUs;
    product.applications = applications;

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

  private async resolveProductCategoryId(
    input: Pick<
      CreateProductDto | UpdateProductDto,
      "productCategoryId" | "productCategorySlug" | "productCategoryName"
    >,
  ): Promise<number | null | undefined> {
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
      shortDescription:
        input.shortDescription !== undefined
          ? input.shortDescription
          : (existingProduct?.shortDescription ?? null),
      thumbnailUrl:
        input.thumbnailUrl !== undefined
          ? input.thumbnailUrl
          : (existingProduct?.thumbnailUrl ?? null),
      imageUrl:
        input.imageUrl !== undefined
          ? input.imageUrl
          : (existingProduct?.imageUrl ?? null),
      isActive:
        input.isActive !== undefined
          ? input.isActive
          : (existingProduct?.isActive ?? true),
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
      badges:
        input.badges !== undefined
          ? (input.badges ?? [])
          : (existingProduct?.badges ?? []),
      hero: input.hero !== undefined
        ? (input.hero ?? null)
        : existingProduct?.hero ?? null,
      quoteConfig:
        input.quoteConfig !== undefined
          ? (input.quoteConfig ?? null)
          : (existingProduct?.quoteConfig ?? null),
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

  private buildAttributeMappingInputs(
    input: CreateProductDto | UpdateProductDto,
  ): {
    hasExplicitMappings: boolean;
    mappingInputs: NonNullable<ProductConfigPayload["attributeMappings"]>;
  } {
    const configInput = input as ProductConfigPayload;
    const hasExplicitMappings = configInput.attributeMappings !== undefined;

    if (hasExplicitMappings) {
      return {
        hasExplicitMappings: true,
        mappingInputs: configInput.attributeMappings ?? [],
      };
    }

    // Build inquiry field mappings from quoteConfig.fields
    const quoteFields = configInput.quoteConfig?.fields;
    if (quoteFields?.length) {
      const mappingInputs: NonNullable<ProductConfigPayload["attributeMappings"]> =
        [];
      quoteFields.forEach((field, index) => {
        mappingInputs.push({
          attributeCode: field.key,
          required: field.required ?? false,
          isInquiryField: true,
          sortOrder: field.sortOrder ?? index,
          metadata: field.unit ? { unit: field.unit } : null,
        });
      });
      return { hasExplicitMappings: false, mappingInputs };
    }

    // Build spec display mappings from attributeValues (isInquiryField=false)
    if (!configInput.attributeValues?.length) {
      return { hasExplicitMappings: false, mappingInputs: [] };
    }

    const seen = new Set<string>();
    const mappingInputs: NonNullable<ProductConfigPayload["attributeMappings"]> =
      [];

    configInput.attributeValues.forEach((item, index) => {
      const dedupeKey =
        typeof item.attributeId === "number"
          ? `id:${item.attributeId}`
          : item.attributeCode?.trim().toLowerCase();

      if (!dedupeKey || seen.has(dedupeKey)) {
        return;
      }

      seen.add(dedupeKey);
      mappingInputs.push({
        attributeId: item.attributeId,
        attributeCode: item.attributeCode,
        required: item.required ?? false,
        isInquiryField: false,
        sortOrder: item.sortOrder ?? index,
        metadata: null,
      });
    });

    return { hasExplicitMappings: false, mappingInputs };
  }

  private async syncAttributeMappings(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const { hasExplicitMappings, mappingInputs } =
      this.buildAttributeMappingInputs(input);

    if (mappingInputs.length === 0) {
      if (hasExplicitMappings) {
        await manager
          .getRepository(ProductAttributeMapping)
          .delete({ productId });
      }
      return;
    }

    const attributeMappingRepository = manager.getRepository(
      ProductAttributeMapping,
    );
    const attributeRepository = manager.getRepository(ProductAttribute);
    const optionRepository = manager.getRepository(ProductAttributeOption);

    if (hasExplicitMappings) {
      await attributeMappingRepository.delete({ productId });
    }

    const attributeIds = [
      ...new Set(
        mappingInputs
          .map((item) => item.attributeId)
          .filter((value): value is number => typeof value === "number"),
      ),
    ];

    const attributeCodes = [
      ...new Set(
        mappingInputs
          .map((item) => item.attributeCode?.trim().toLowerCase())
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const attributesById = new Map<number, ProductAttribute>();
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
      attributeId: number;
    }> = [];

    for (const mappingInput of mappingInputs) {
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
          .filter((value): value is number => typeof value === "number"),
      ),
    ];

    let optionsById = new Map<number, ProductAttributeOption>();
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
      attributeId: number,
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

    const mappingsToSave: ProductAttributeMapping[] = [];
    for (const resolvedMapping of resolvedMappings) {
      const mappingInput = resolvedMapping.input;
      let resolvedDefaultOptionId: number | null = null;

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

      const isInquiryField =
        mappingInput.isInquiryField ?? (hasExplicitMappings ? true : false);

      if (hasExplicitMappings) {
        mappingsToSave.push(
          attributeMappingRepository.create({
            productId,
            attributeId: resolvedMapping.attributeId,
            defaultOptionId: resolvedDefaultOptionId,
            required: mappingInput.required ?? false,
            isInquiryField,
            sortOrder: mappingInput.sortOrder ?? 0,
            metadata: mappingInput.metadata ?? null,
          }),
        );
        continue;
      }

      const existing = await attributeMappingRepository.findOne({
        where: {
          productId,
          attributeId: resolvedMapping.attributeId,
        },
      });

      if (existing) {
        existing.required = mappingInput.required ?? existing.required;
        existing.sortOrder = mappingInput.sortOrder ?? existing.sortOrder;
        existing.metadata = mappingInput.metadata ?? existing.metadata;
        if (mappingInput.isInquiryField !== undefined) {
          existing.isInquiryField = mappingInput.isInquiryField;
        }
        if (resolvedDefaultOptionId !== null) {
          existing.defaultOptionId = resolvedDefaultOptionId;
        }
        mappingsToSave.push(existing);
        continue;
      }

      mappingsToSave.push(
        attributeMappingRepository.create({
          productId,
          attributeId: resolvedMapping.attributeId,
          defaultOptionId: resolvedDefaultOptionId,
          required: mappingInput.required ?? false,
          isInquiryField,
          sortOrder: mappingInput.sortOrder ?? 0,
          metadata: mappingInput.metadata ?? null,
        }),
      );
    }

    if (mappingsToSave.length > 0) {
      await attributeMappingRepository.save(mappingsToSave);
    }
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

  private async syncImages(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.images) return;

    const imageRepository = manager.getRepository(ProductImage);
    const assetRepository = manager.getRepository(Asset);
    await imageRepository.delete({ productId });

    if (configInput.images.length === 0) return;

    const seen = new Set<string>();
    const entries: ProductImage[] = [];

    for (const ref of configInput.images) {
      let assetId = ref.assetId;

      // If URL is provided instead of assetId, create or find existing Asset
      if (!assetId && ref.url) {
        // Check if asset with this URL already exists
        let asset = await assetRepository.findOne({
          where: { url: ref.url },
          select: { id: true },
        });

        if (!asset) {
          // Create new asset record
          asset = assetRepository.create({
            url: ref.url,
            thumbnailUrl: ref.url, // Cloudinary can generate thumbnails from URL
            alt: ref.alt ?? null,
            caption: ref.caption ?? null,
            mimeType: "image",
            ownerType: AssetOwnerType.PRODUCT,
            ownerId: productId,
          });
          asset = await assetRepository.save(asset);
        } else if (
          (ref.caption !== undefined && ref.caption !== asset.caption) ||
          (ref.alt !== undefined && ref.alt !== asset.alt)
        ) {
          // Update alt/caption if caller supplied a new value
          asset.alt = ref.alt ?? asset.alt;
          asset.caption = ref.caption ?? asset.caption;
          asset = await assetRepository.save(asset);
        }
        assetId = asset.id;
      }

      if (!assetId || seen.has(assetId)) continue;
      seen.add(assetId);

      entries.push(
        imageRepository.create({
          productId,
          assetId,
          sortOrder: ref.sortOrder ?? entries.length,
        }),
      );
    }

    if (entries.length > 0) {
      await imageRepository.save(entries);
    }
  }

  private async syncTechnicalSpecifications(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.technicalSpecifications) return;

    const repository = manager.getRepository(ProductTechnicalSpecification);
    await repository.delete({ productId });

    if (configInput.technicalSpecifications.length === 0) return;

    const entries = configInput.technicalSpecifications.map(
      (spec, index) =>
        repository.create({
          productId,
          label: spec.label,
          value: spec.value,
          unit: spec.unit ?? null,
          sortOrder: spec.sortOrder ?? index,
        }),
    );
    await repository.save(entries);
  }

  private async syncPackagingOptions(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.packagingOptions) return;

    const repository = manager.getRepository(ProductPackagingOption);
    await repository.delete({ productId });

    if (configInput.packagingOptions.length === 0) return;

    const entries = configInput.packagingOptions.map((option, index) =>
      repository.create({
        productId,
        title: option.title,
        description: option.description ?? null,
        details: option.details ?? [],
        sortOrder: option.sortOrder ?? index,
      }),
    );
    await repository.save(entries);
  }

  private async syncTargetBuyers(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.targetBuyers) return;

    const repository = manager.getRepository(ProductTargetBuyer);
    await repository.delete({ productId });

    if (configInput.targetBuyers.length === 0) return;

    const entries = configInput.targetBuyers.map((item, index) =>
      repository.create({
        productId,
        title: item.title,
        description: item.description ?? null,
        sortOrder: item.sortOrder ?? index,
      }),
    );
    await repository.save(entries);
  }

  private async syncWhyChooseUs(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.whyChooseUs) return;

    const repository = manager.getRepository(ProductWhyChooseUs);
    await repository.delete({ productId });

    if (configInput.whyChooseUs.length === 0) return;

    const entries = configInput.whyChooseUs.map((item, index) =>
      repository.create({
        productId,
        title: item.title,
        description: item.description ?? null,
        sortOrder: item.sortOrder ?? index,
      }),
    );
    await repository.save(entries);
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

  private async syncFaqs(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.faqs) return;

    const faqRepository = manager.getRepository(ProductFaq);
    await faqRepository.delete({ productId });

    if (configInput.faqs.length === 0) return;

    const seenQuestions = new Set<string>();
    const entries = configInput.faqs.map((faq, index) => {
      const question = faq.question.trim();
      const key = question.toLowerCase();
      if (seenQuestions.has(key)) {
        throw new BadRequestException(
          `Duplicate FAQ question provided in payload: ${question}`,
        );
      }
      seenQuestions.add(key);

      return faqRepository.create({
        productId,
        question,
        answer: faq.answer,
        sortOrder: faq.sortOrder ?? index,
        isActive: faq.isActive ?? true,
      });
    });

    await faqRepository.save(entries);
  }

  private async syncCertificates(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.certificates) return;

    const productCertificateRepository = manager.getRepository(ProductCertificate);
    const certificateRepository = manager.getRepository(Certificate);
    await productCertificateRepository.delete({ productId });

    if (configInput.certificates.length === 0) return;

    const seen = new Set<string>();
    const entries: ProductCertificate[] = [];

    for (let index = 0; index < configInput.certificates.length; index += 1) {
      const item = configInput.certificates[index];
      let resolvedCertificateId: string | null = null;

      if (item.certificateId) {
        const cert = await certificateRepository.findOne({
          where: { id: item.certificateId },
        });
        if (!cert) {
          throw new BadRequestException(
            `Certificate not found for id: ${item.certificateId}`,
          );
        }
        resolvedCertificateId = cert.id;
      } else {
        const trimmedName = item.name?.trim();
        if (!trimmedName) {
          throw new BadRequestException(
            `Certificate entry #${index + 1} requires either certificateId or name.`,
          );
        }
        let cert = await certificateRepository.findOne({
          where: { name: trimmedName },
        });
        if (!cert) {
          cert = await certificateRepository.save(
            certificateRepository.create({
              name: trimmedName,
              isActive: item.isActive ?? true,
              fileUrl: item.fileUrl ?? null,
            }),
          );
        }
        resolvedCertificateId = cert.id;
      }

      if (seen.has(resolvedCertificateId)) {
        throw new BadRequestException(
          `Duplicate certificate provided in payload: ${resolvedCertificateId}`,
        );
      }
      seen.add(resolvedCertificateId);

      entries.push(
        productCertificateRepository.create({
          productId,
          certificateId: resolvedCertificateId,
          isRequired: item.isRequired ?? false,
          sortOrder: item.sortOrder ?? index,
        }),
      );
    }

    await productCertificateRepository.save(entries);
  }

  private async syncApplications(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.applications) return;

    const appRepository = manager.getRepository(ProductApplication);
    const attrRepository = manager.getRepository(ProductApplicationAttribute);

    const existingApps = await appRepository.find({ where: { productId } });
    const appIds = existingApps.map((a) => a.id);
    if (appIds.length > 0) {
      await attrRepository.delete({ productApplicationId: In(appIds) });
    }
    await appRepository.delete({ productId });

    if (configInput.applications.length === 0) return;

    for (let i = 0; i < configInput.applications.length; i += 1) {
      const appInput = configInput.applications[i];
      const app = appRepository.create({
        productId,
        introLine: appInput.introLine ?? null,
        sortOrder: appInput.sortOrder ?? i,
      });
      const savedApp = await appRepository.save(app);

      if (appInput.attributes && appInput.attributes.length > 0) {
        savedApp.attributes = appInput.attributes.map(
          (attr: ProductApplicationAttributeInputDto, idx: number) =>
            attrRepository.create({
              productApplicationId: savedApp.id,
              name: attr.name,
              value: attr.value ?? null,
              sortOrder: attr.sortOrder ?? idx,
            }),
        );
        await appRepository.save(savedApp);
      }
    }
  }

  private async syncAttributeValues(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
    const configInput = input as ProductConfigPayload;
    if (!configInput.attributeValues) {
      return;
    }

    const valueRepository = manager.getRepository(ProductAttributeValue);
    const attributeRepository = manager.getRepository(ProductAttribute);

    await valueRepository.delete({ productId });

    if (configInput.attributeValues.length === 0) {
      return;
    }

    const inputs = configInput.attributeValues;

    // ── Step 1: collect all attribute IDs and codes ─────────────────────────
    const attributeIds = [
      ...new Set(
        inputs
          .map((item: ProductAttributeValueInputDto) => item.attributeId)
          .filter((value): value is number => typeof value === "number"),
      ),
    ];

    const attributeCodes = [
      ...new Set(
        inputs
          .map((item: ProductAttributeValueInputDto) =>
            item.attributeCode?.trim().toLowerCase(),
          )
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    // ── Step 2: load existing attributes ────────────────────────────────────
    const attributesById = new Map<number, ProductAttribute>();
    const attributesByCode = new Map<string, ProductAttribute>();

    if (attributeIds.length > 0) {
      const list = await attributeRepository.find({
        where: { id: In(attributeIds) },
      });
      for (const attr of list) {
        attributesById.set(attr.id, attr);
        attributesByCode.set(attr.code.trim().toLowerCase(), attr);
      }
    }
    if (attributeCodes.length > 0) {
      const list = await attributeRepository.find({
        where: { code: In(attributeCodes) },
      });
      for (const attr of list) {
        attributesById.set(attr.id, attr);
        attributesByCode.set(attr.code.trim().toLowerCase(), attr);
      }
    }

    // ── Step 3: auto-create missing attribute masters ───────────────────────
    for (const item of inputs) {
      if (!item.attributeCode) continue;
      const codeKey = item.attributeCode.trim().toLowerCase();
      if (attributesByCode.has(codeKey)) continue;

      // Attribute doesn't exist — create a new master entry
      const code = item.attributeCode.trim();
      const name =
        item.attributeName?.trim() ||
        this.buildAttributeNameFromCode(code);
      const groupKey = item.groupKey ?? ProductAttributeGroup.OTHER;
      const type = item.attributeType ?? ProductAttributeType.TEXT;

      const created = attributeRepository.create({
        code,
        name,
        groupKey,
        type,
        unit: item.unit ?? null,
        defaultValue: item.value ?? null,
        footnote: item.footnote ?? null,
        sectionLabel: item.sectionLabel ?? null,
        isActive: true,
      });
      const saved = await attributeRepository.save(created);
      attributesById.set(saved.id, saved);
      attributesByCode.set(saved.code.trim().toLowerCase(), saved);
    }

    // ── Step 4: build value entries ────────────────────────────────────────
    const seenAttributeIds = new Set<number>();
    const entries: ProductAttributeValue[] = [];

    inputs.forEach((item: ProductAttributeValueInputDto, index: number) => {
      let resolved: ProductAttribute | undefined;
      if (typeof item.attributeId === "number") {
        resolved = attributesById.get(item.attributeId);
      } else if (item.attributeCode) {
        resolved = attributesByCode.get(
          item.attributeCode.trim().toLowerCase(),
        );
      } else {
        throw new BadRequestException(
          `attributeValues[${index}]: attributeId or attributeCode is required.`,
        );
      }

      if (!resolved) {
        throw new BadRequestException(
          `attributeValues[${index}]: attribute not found (${item.attributeId ?? item.attributeCode}).`,
        );
      }

      if (seenAttributeIds.has(resolved.id)) {
        throw new BadRequestException(
          `attributeValues[${index}]: duplicate attribute '${resolved.code}' is not allowed.`,
        );
      }
      seenAttributeIds.add(resolved.id);

      const valueNumberRaw = item.valueNumber ?? null;
      const valueNumber =
        valueNumberRaw === null || valueNumberRaw === undefined
          ? null
          : String(valueNumberRaw);

      entries.push(
        valueRepository.create({
          productId,
          attributeId: resolved.id,
          value: item.value ?? null,
          valueNumber,
          unit: item.unit ?? null,
          footnote: item.footnote ?? null,
          sectionLabel: item.sectionLabel ?? null,
          required: item.required ?? false,
          sortOrder: item.sortOrder ?? index,
          metadata: item.metadata ?? null,
        }),
      );
    });

    if (entries.length > 0) {
      await valueRepository.save(entries);
    }
  }

  private async syncProductConfigurations(
    manager: EntityManager,
    productId: string,
    input: CreateProductDto | UpdateProductDto,
  ): Promise<void> {
  // Auto-derive containerConfigs and quoteConfig.moq from attributeValues
  // when FE doesn't send them explicitly. Keeps display (attributeValues) and
  // auto-calc (containerConfigs + quoteConfig.moq) in sync without forcing
  // staff to fill 2 places.
  this.deriveContainerAndMoqFromAttributes(input);

  await this.syncAttributeValues(manager, productId, input);
  await this.syncAttributeMappings(manager, productId, input);
  await this.syncContainerConfigs(manager, productId, input);
  await this.syncCountryConfigs(manager, productId, input);
  await this.syncImages(manager, productId, input);
    await this.syncTechnicalSpecifications(manager, productId, input);
    await this.syncPackagingOptions(manager, productId, input);
    await this.syncTargetBuyers(manager, productId, input);
    await this.syncWhyChooseUs(manager, productId, input);
    await this.syncTradeTerms(manager, productId, input);
    await this.syncFaqs(manager, productId, input);
    await this.syncCertificates(manager, productId, input);
    await this.syncApplications(manager, productId, input);
  }

  /**
   * Auto-derive functional config (containerConfigs + quoteConfig.moq) from
   * display attributes so the two sources stay in sync.
   *
   * Reads three well-known attribute codes from `attributeValues`:
   *   • `container_load`  — e.g. "~27 tonnes per 40ft container" or
   *                          "~27 MT per 40HQ"
   *   • `container_type`  — e.g. "40ft refrigerated (reefer)"
   *   • `moq`             — e.g. "1 x 40ft containers" or "1 x 40RF"
   *
   * Side effects (mutates `input` in place, only when FE did NOT send the
   * corresponding field, so explicit values always win):
   *   1. `containerConfigs` is populated from `container_load`+
   *      `container_type`.
   *   2. `quoteConfig.moq` is normalized into the parser-friendly form
   *      `"<N> x <CODE>"` expected by `resolveMoqMt()`.
   */
  private deriveContainerAndMoqFromAttributes(
    input: CreateProductDto | UpdateProductDto,
  ): void {
    const configInput = input as ProductConfigPayload;
    const attrs = configInput.attributeValues;
    if (!attrs?.length) return;

    const findByCode = (code: string): string | null => {
      const hit = attrs.find(
        (item) => item.attributeCode?.trim().toLowerCase() === code,
      );
      if (!hit?.value) return null;
      const trimmed = hit.value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const containerLoad = findByCode("container_load");
    const containerType = findByCode("container_type");
    const moqValue = findByCode("moq");

    // ── 1) Derive containerConfigs if FE didn't send it ───────────────────
    if (!configInput.containerConfigs && containerLoad) {
      const capacity = this.extractCapacityMt(containerLoad);
      if (capacity !== null) {
        const typeText =
          containerType ?? this.extractContainerTypeAfterPer(containerLoad);
        const containerCode = this.deriveContainerCode(
          typeText ?? containerLoad,
        );

        if (containerCode) {
          configInput.containerConfigs = [
            {
              containerCode,
              containerName:
                typeText?.trim() ||
                `${capacity} MT container`,
              capacityMt: capacity,
              isDefault: true,
            },
          ];
        }
      }
    }

    // ── 2) Derive quoteConfig.moq if FE didn't send it ─────────────────────
    if (moqValue && !configInput.quoteConfig?.moq) {
      const parsed = this.parseMoqString(moqValue);
      const containerCode =
        configInput.containerConfigs?.[0]?.containerCode ??
        this.deriveContainerCode(moqValue);

      let moqLabel: string | null = null;
      if (parsed && containerCode) {
        moqLabel = `${parsed.count} x ${containerCode}`;
      } else if (parsed) {
        // No container code resolved — keep original wording
        moqLabel = moqValue;
      } else {
        moqLabel = moqValue;
      }

      if (!configInput.quoteConfig) {
        configInput.quoteConfig = { moq: moqLabel };
      } else {
        configInput.quoteConfig.moq = moqLabel;
      }
    }
  }

  /**
   * Pull the first numeric value followed by tonnes/tấn/MT/ton.
   * Examples it matches:
   *   "~27 tonnes per 40ft container" → 27
   *   "~27 MT per 40HQ"               → 27
   *   "≈ 27.5 tonnes"                  → 27.5
   */
  private extractCapacityMt(text: string): number | null {
    const match = text.match(
      /(\d+(?:\.\d+)?)\s*(?:tonnes?|tấn|\bmt\b|tons?)/i,
    );
    if (!match) return null;
    const value = parseFloat(match[1]);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  /**
   * Extract container type hint from text after "per" or "/".
   * Example: "~27 tonnes per 40ft container" → "40ft container".
   */
  private extractContainerTypeAfterPer(text: string): string | null {
    const match = text.match(/(?:per|\/)\s*(.+)$/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Try to map free-form container description to a canonical ISO-like code
   * (e.g. "40ft refrigerated", "40RF", "40ft reefer", "40HQ").
   * Returns null if no recognizable code is found.
   */
  private deriveContainerCode(text: string | null | undefined): string | null {
    if (!text) return null;
    const upper = text.toUpperCase();

    const isoMatch = upper.match(
      /\b((?:20|40|45)\s*(?:FT|RF|HQ|RH|RE|DV|DC|DRY|REEFER|HIGH|OT))\b/,
    );
    if (isoMatch) {
      return isoMatch[1].replace(/\s+/g, "");
    }

    // Plain "40ft" / "20ft" → pad to 4 chars: 40FT / 20FT
    const plainMatch = upper.match(/\b((?:20|40|45)\s*FT)\b/);
    if (plainMatch) return plainMatch[1].replace(/\s+/g, "");

    return null;
  }

  /**
   * Parse MOQ strings into (count, raw) when possible.
   * Examples:
   *   "1 x 40ft containers"     → { count: 1, raw: "1 x 40ft containers" }
   *   "2 x 20FT"                → { count: 2, raw: "2 x 20FT" }
   *   "5 containers"            → null (no "N x CODE" pattern)
   */
  private parseMoqString(
    text: string,
  ): { count: number; raw: string } | null {
    const match = text.match(/^\s*(\d+(?:\.\d+)?)\s*[xX×]\s*([A-Za-z0-9 ]+?)\s*$/);
    if (!match) return null;
    const count = parseFloat(match[1]);
    if (!Number.isFinite(count) || count <= 0) return null;
    return { count, raw: text.trim() };
  }

  async softDeleteProduct(id: string): Promise<ProductDetailDto> {
    return this.updateStaffProduct(id, { status: ProductStatus.HIDDEN } as any);
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
      .leftJoinAndSelect("product.images", "images")
      .leftJoinAndSelect("images.asset", "imageAsset")
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
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    const lookupKey = isUuid
      ? { id: identifier }
      : { slug: identifier };

    const product = await this.loadProductForDetailByLookup(lookupKey);
    return this.toDetailDto(product);
  }

  async createStaffProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductDetailDto> {
    try {
      const savedProduct = await this.productsRepository.manager.transaction(
        async (manager) => {
          const productRepository = manager.getRepository(Product);
          const product = productRepository.create(
            await this.buildProductPayload(createProductDto),
          );
          const saved = await productRepository.save(product);
          await this.syncProductConfigurations(
            manager,
            saved.id,
            createProductDto,
          );
          return saved;
        },
      );
      const detailProduct = await this.loadProductForDetail(savedProduct.id);
      return this.toDetailDto(detailProduct);
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
      const savedProduct = await this.productsRepository.manager.transaction(
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

          const saved = await productRepository.save(updatedProduct);
          await this.syncProductConfigurations(
            manager,
            saved.id,
            updateProductDto,
          );
          return saved;
        },
      );
      const detailProduct = await this.loadProductForDetail(savedProduct.id);
      return this.toDetailDto(detailProduct);
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
      .leftJoinAndSelect("product.images", "images")
      .leftJoinAndSelect("images.asset", "imageAsset")
      .leftJoinAndSelect("product.attributeValues", "attributeValues")
      .leftJoinAndSelect("attributeValues.attribute", "attribute")
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
    // Phân loại identifier: UUID → lookup theo id; ngược lại lookup theo slug.
    // Tránh truyền chuỗi slug vào cột uuid (Postgres "invalid input syntax for type uuid").
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    const product = isUuid
      ? await this.productsRepository.findOne({
          where: {
            id: identifier,
            status: ProductStatus.PUBLISHED,
            isActive: true,
          },
        })
      : await this.productsRepository.findOne({
          where: {
            slug: identifier,
            status: ProductStatus.PUBLISHED,
            isActive: true,
          },
        });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const detailProduct = await this.loadProductForDetail(product.id);
    return this.toDetailDto(detailProduct);
  }

  // ── Inquiry Order Config ──────────────────────────────────────────────────
  // Trimmed payload: only the fields needed to build the Step 2 / Step 3 form
  // on the public inquiry page, plus MOQ + container configs for auto-calc.

  async getOrderConfig(identifier: string): Promise<ProductOrderConfigDto> {
    const detail = await this.loadProductDetail(identifier, { includeDraft: true });
    return this.toOrderConfigDto(detail);
  }

  async getPublicOrderConfig(identifier: string): Promise<ProductOrderConfigDto> {
    const detail = await this.loadProductDetail(identifier, {
      includeDraft: false,
    });
    return this.toOrderConfigDto(detail);
  }

  private async loadProductDetail(
    identifier: string,
    opts: { includeDraft: boolean },
  ): Promise<Product> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    const baseWhere = isUuid ? { id: identifier } : { slug: identifier };
    const where = opts.includeDraft
      ? baseWhere
      : { ...baseWhere, status: ProductStatus.PUBLISHED, isActive: true };

    const product = await this.productsRepository.findOne({ where });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return (await this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect(
        "product.attributeMappings",
        "attributeMappings",
      )
      .leftJoinAndSelect("attributeMappings.attribute", "attribute")
      .leftJoinAndSelect(
        "attributeMappings.defaultOption",
        "defaultOption",
      )
      .leftJoinAndSelect("attribute.options", "attrOption")
      .leftJoinAndSelect("product.containerConfigs", "containerConfigs")
      .leftJoinAndSelect("product.countryConfigs", "countryConfigs")
      .leftJoinAndSelect("countryConfigs.country", "country")
      .leftJoinAndSelect("product.tradeTerms", "tradeTerms")
      .leftJoinAndSelect("tradeTerms.tradeTerm", "tradeTerm")
      .where("product.id = :id", { id: product.id })
      .orderBy("attributeMappings.sortOrder", "ASC")
      .addOrderBy("attrOption.sortOrder", "ASC")
      .getOne()) as Product;
  }

  private toOrderConfigDto(product: Product): ProductOrderConfigDto {
    // Public-facing endpoint — hide attributes that staff marked as
    // isInquiryField=false (catalog-only, e.g. internal SKUs / spec notes).
    const mappings: InquiryOrderAttributeMappingDto[] = (
      product.attributeMappings ?? []
    )
      .filter((mapping) => mapping.isInquiryField !== false)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((mapping): InquiryOrderAttributeMappingDto => ({
        id: mapping.id,
        attributeId: mapping.attributeId,
        code: mapping.attribute?.code ?? "",
        name: mapping.attribute?.name ?? "",
        groupKey: mapping.attribute?.groupKey ?? "other",
        type: mapping.attribute?.type ?? "text",
        unit: mapping.attribute?.unit ?? null,
        defaultValue: mapping.attribute?.defaultValue ?? null,
        placeholder: mapping.attribute?.placeholder ?? null,
        footnote: mapping.attribute?.footnote ?? null,
        required: mapping.required,
        isInquiryField: mapping.isInquiryField,
        sortOrder: mapping.sortOrder,
        defaultOptionId: mapping.defaultOptionId ?? null,
        options: (mapping.attribute?.options ?? [])
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(
            (option): InquiryOrderAttributeOptionDto => ({
              id: option.id,
              value: option.value,
              sortOrder: option.sortOrder,
              isActive: option.isActive,
              isCustomTrigger: option.isCustomTrigger ?? false,
              customPlaceholder: option.customPlaceholder ?? null,
            }),
          ),
      }));

    const containers: InquiryOrderContainerConfigDto[] = (
      product.containerConfigs ?? []
    )
      .slice()
      .sort((a, b) => Number(a.capacityMt) - Number(b.capacityMt))
      .map((config): InquiryOrderContainerConfigDto => ({
        id: config.id,
        containerCode: config.containerCode,
        containerName: config.containerName,
        capacityMt: String(config.capacityMt),
        isDefault: config.isDefault,
      }));

    const countries: InquiryOrderCountryConfigDto[] = (
      product.countryConfigs ?? []
    )
      .slice()
      .filter((cfg) => cfg.isActive)
      .map((cfg): InquiryOrderCountryConfigDto => ({
        countryId: cfg.countryId,
        countryCode: cfg.country?.code ?? "",
        countryName: cfg.country?.name ?? "",
        moqMt: cfg.moqMt ? String(cfg.moqMt) : null,
        moqLabel: cfg.moqLabel ?? null,
        leadTimeDays: cfg.leadTimeDays ?? null,
        isActive: cfg.isActive,
      }));

    const tradeTerms: InquiryOrderTradeTermDto[] = (product.tradeTerms ?? [])
      .map(
        (pt): InquiryOrderTradeTermDto => ({
          id: pt.id,
          code: pt.tradeTerm?.code ?? "",
          name: pt.tradeTerm?.name ?? "",
          isActive: pt.tradeTerm?.isActive ?? true,
          isDefault: pt.isDefault,
        }),
      )
      .filter((term) => term.isActive)
      .sort((a, b) => a.code.localeCompare(b.code));

    return {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productCode: product.productCode ?? null,
      attributeMappings: mappings,
      containerConfigs: containers,
      countryConfigs: countries,
      tradeTerms,
    };
  }

  // ──────────────────────── Category endpoints ────────────────────────

  async listCategories(): Promise<ProductCategorySummaryDto[]> {
    const categories = await this.productCategoriesRepository.find({
      order: { createdAt: "ASC" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  async listActiveCategories(): Promise<ProductCategorySummaryDto[]> {
    const categories = await this.productCategoriesRepository.find({
      where: { isActive: true },
      order: { createdAt: "ASC" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  async getCategoryDetail(id: number): Promise<ProductCategorySummaryDto> {
    const category = await this.productCategoriesRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Product category ${id} not found`);
    }
    return this.toCategorySummaryDto(category);
  }

  async createCategory(
    dto: CreateProductCategoryDto,
  ): Promise<ProductCategorySummaryDto> {
    const slug = this.resolveSlug(dto.name, undefined);

    const existing = await this.productCategoriesRepository.findOne({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(
        `Product category with slug "${slug}" already exists`,
      );
    }

    const category = this.productCategoriesRepository.create({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.productCategoriesRepository.save(category);
    return this.toCategorySummaryDto(saved);
  }

  async updateCategory(
    id: number,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategorySummaryDto> {
    const category = await this.productCategoriesRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Product category ${id} not found`);
    }

    if (dto.slug !== undefined || dto.name !== undefined) {
      const nextSlug = this.resolveSlug(
        dto.name ?? category.name,
        dto.slug ?? category.slug,
      );
      if (nextSlug !== category.slug) {
        const clash = await this.productCategoriesRepository.findOne({
          where: { slug: nextSlug },
        });
        if (clash && clash.id !== category.id) {
          throw new ConflictException(
            `Product category with slug "${nextSlug}" already exists`,
          );
        }
        category.slug = nextSlug;
      }
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined)
      category.description = dto.description ?? null;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    const saved = await this.productCategoriesRepository.save(category);
    return this.toCategorySummaryDto(saved);
  }

  async softDeleteCategory(id: number): Promise<ProductCategorySummaryDto> {
    const category = await this.productCategoriesRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Product category ${id} not found`);
    }

    const productRepo = this.productCategoriesRepository.manager.getRepository(
      Product,
    );
    const productCount = await productRepo.count({
      where: { productCategoryId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category ${id}: ${productCount} product(s) still reference it`,
      );
    }

    category.isActive = false;
    const saved = await this.productCategoriesRepository.save(category);
    return this.toCategorySummaryDto(saved);
  }

  private toCategorySummaryDto(
    cat: ProductCategory,
  ): ProductCategorySummaryDto {
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }
}
