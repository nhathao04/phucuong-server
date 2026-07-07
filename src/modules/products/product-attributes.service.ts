import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ProductAttribute } from "./entities/product-attribute.entity";
import { ProductAttributeOption } from "./entities/product-attribute-option.entity";
import {
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  ProductAttributeResponseDto,
  AddAttributeOptionDto,
  UpdateAttributeOptionDto,
  ProductAttributeListQueryDto,
} from "./dto/product-attribute.dto";

const toResponseDto = (
  entity: ProductAttribute,
  options: ProductAttributeOption[] = [],
): ProductAttributeResponseDto => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  groupKey: entity.groupKey,
  type: entity.type,
  unit: entity.unit,
  defaultValue: entity.defaultValue,
  placeholder: entity.placeholder,
  footnote: entity.footnote,
  sectionLabel: entity.sectionLabel,
  isActive: entity.isActive,
  isInquiryField: entity.isInquiryField ?? true,
  options: options.map((option) => ({
    id: option.id,
    value: option.value,
    sortOrder: option.sortOrder,
    isActive: option.isActive,
    isCustomTrigger: option.isCustomTrigger ?? false,
    customPlaceholder: option.customPlaceholder ?? null,
  })),
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

@Injectable()
export class ProductAttributesService {
  constructor(
    @InjectRepository(ProductAttribute)
    private readonly attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductAttributeOption)
    private readonly optionRepository: Repository<ProductAttributeOption>,
  ) {}

  async list(
    query: ProductAttributeListQueryDto,
  ): Promise<ProductAttributeResponseDto[]> {
    const where: Record<string, unknown> = {};
    if (query.groupKey) where.groupKey = query.groupKey;
    if (typeof query.isActive === "boolean") where.isActive = query.isActive;

    const entities = await this.attributeRepository.find({
      where,
      relations: { options: true },
      order: { id: "ASC" },
    });

    return entities.map((entity) => toResponseDto(entity, entity.options));
  }

  async getDetail(identifier: string): Promise<ProductAttributeResponseDto> {
    const attribute = await this.findAttribute(identifier);
    const options = await this.optionRepository.find({
      where: { attributeId: attribute.id },
      order: { sortOrder: "ASC", id: "ASC" },
    });
    return toResponseDto(attribute, options);
  }

  async create(
    dto: CreateProductAttributeDto,
  ): Promise<ProductAttributeResponseDto> {
    const code = dto.code.trim();
    const existing = await this.attributeRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Attribute code already exists: ${code}`);
    }

    const saved = await this.attributeRepository.manager.transaction(
      async (manager) => {
        const attributeRepository = manager.getRepository(ProductAttribute);
        const optionRepository = manager.getRepository(ProductAttributeOption);

        const attribute = attributeRepository.create({
          code,
          name: dto.name.trim(),
          groupKey: dto.groupKey,
          type: dto.type,
          unit: dto.unit ?? null,
          defaultValue: dto.defaultValue ?? null,
          placeholder: dto.placeholder ?? null,
          footnote: dto.footnote ?? null,
          sectionLabel: dto.sectionLabel ?? null,
          isActive: dto.isActive ?? true,
          isInquiryField: dto.isInquiryField ?? true,
        });
        const savedAttribute = await attributeRepository.save(attribute);

        if (dto.type === "select" && dto.options && dto.options.length > 0) {
          const unique = new Set<string>();
          const optionEntities = dto.options.map((option, index) => {
            const value = option.value?.trim();
            if (!value) {
              throw new BadRequestException(
                `Option #${index + 1}: value is required.`,
              );
            }
            const key = value.toLowerCase();
            if (unique.has(key)) {
              throw new BadRequestException(
                `Duplicate option value: ${value}`,
              );
            }
            unique.add(key);
            return optionRepository.create({
              attributeId: savedAttribute.id,
              value,
              sortOrder: option.sortOrder ?? index,
            });
          });
          await optionRepository.save(optionEntities);
        } else if (dto.type === "select") {
          throw new BadRequestException(
            "Select-type attribute must include at least one option.",
          );
        }

        return savedAttribute;
      },
    );

    return this.getDetail(saved.code);
  }

  async update(
    identifier: string,
    dto: UpdateProductAttributeDto,
  ): Promise<ProductAttributeResponseDto> {
    const attribute = await this.findAttribute(identifier);

    if (dto.name !== undefined) attribute.name = dto.name.trim();
    if (dto.groupKey !== undefined) attribute.groupKey = dto.groupKey;
    if (dto.type !== undefined) attribute.type = dto.type;
    if (dto.unit !== undefined) attribute.unit = dto.unit;
    if (dto.defaultValue !== undefined)
      attribute.defaultValue = dto.defaultValue;
    if (dto.placeholder !== undefined)
      attribute.placeholder = dto.placeholder;
    if (dto.footnote !== undefined) attribute.footnote = dto.footnote;
    if (dto.sectionLabel !== undefined)
      attribute.sectionLabel = dto.sectionLabel;
    if (dto.isActive !== undefined) attribute.isActive = dto.isActive;
    if (dto.isInquiryField !== undefined)
      attribute.isInquiryField = dto.isInquiryField;

    await this.attributeRepository.save(attribute);
    return this.getDetail(attribute.code);
  }

  async softDelete(identifier: string): Promise<{ code: string }> {
    const attribute = await this.findAttribute(identifier);
    attribute.isActive = false;
    await this.attributeRepository.save(attribute);
    return { code: attribute.code };
  }

  async addOption(
    identifier: string,
    dto: AddAttributeOptionDto,
  ): Promise<ProductAttributeResponseDto> {
    const attribute = await this.findAttribute(identifier);
    if (attribute.type !== "select") {
      throw new BadRequestException(
        "Options are only allowed for select-type attributes.",
      );
    }
    const value = dto.value.trim();
    const existing = await this.optionRepository.findOne({
      where: { attributeId: attribute.id, value: In([value]) },
    });
    if (existing) {
      throw new ConflictException(`Option already exists: ${value}`);
    }
    const lastSort = await this.optionRepository.findOne({
      where: { attributeId: attribute.id },
      order: { sortOrder: "DESC" },
    });
    const option = this.optionRepository.create({
      attributeId: attribute.id,
      value,
      sortOrder: dto.sortOrder ?? (lastSort?.sortOrder ?? -1) + 1,
      isCustomTrigger: dto.isCustomTrigger ?? false,
      customPlaceholder: dto.customPlaceholder ?? null,
    });
    await this.optionRepository.save(option);
    return this.getDetail(attribute.code);
  }

  async updateOption(
    identifier: string,
    optionId: number,
    dto: UpdateAttributeOptionDto,
  ): Promise<ProductAttributeResponseDto> {
    const attribute = await this.findAttribute(identifier);
    const option = await this.optionRepository.findOne({
      where: { id: optionId, attributeId: attribute.id },
    });
    if (!option) {
      throw new NotFoundException("Option not found");
    }
    if (dto.value !== undefined) option.value = dto.value.trim();
    if (dto.sortOrder !== undefined) option.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) option.isActive = dto.isActive;
    if (dto.isCustomTrigger !== undefined)
      option.isCustomTrigger = dto.isCustomTrigger;
    if (dto.customPlaceholder !== undefined)
      option.customPlaceholder = dto.customPlaceholder;
    await this.optionRepository.save(option);
    return this.getDetail(attribute.code);
  }

  async deleteOption(
    identifier: string,
    optionId: number,
  ): Promise<{ id: number }> {
    const attribute = await this.findAttribute(identifier);
    const option = await this.optionRepository.findOne({
      where: { id: optionId, attributeId: attribute.id },
    });
    if (!option) {
      throw new NotFoundException("Option not found");
    }
    await this.optionRepository.delete(option.id);
    return { id: optionId };
  }

  private async findAttribute(identifier: string): Promise<ProductAttribute> {
    const id = Number.parseInt(identifier, 10);
    const attribute = Number.isFinite(id) && id > 0
      ? await this.attributeRepository.findOne({ where: { id } })
      : await this.attributeRepository.findOne({
          where: { code: identifier.trim() },
        });
    if (!attribute) {
      throw new NotFoundException(
        `Product attribute not found: ${identifier}`,
      );
    }
    return attribute;
  }
}