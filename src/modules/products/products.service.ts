import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductListQueryDto } from "./dto/product-list-query.dto";
import {
  ProductDetailDto,
  ProductListResponseDto,
  ProductSummaryDto,
} from "./dto/product-response.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private toSummaryDto(product: Product): ProductSummaryDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      image: product.image,
      containerCapacity: product.containerCapacity,
      containerType: product.containerType,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toDetailDto(product: Product): ProductDetailDto {
    return {
      ...this.toSummaryDto(product),
      specification: product.specification,
      packing: product.packing,
      applications: product.applications,
      documents: product.documents,
    };
  }

  async listForStaff(
    query: ProductListQueryDto,
  ): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.productsRepository
      .createQueryBuilder("product")
      .orderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        "(product.name ILIKE :search OR product.slug ILIKE :search OR product.description ILIKE :search)",
        {
          search: `%${search}%`,
        },
      );
    }

    const [products, total] = await qb.getManyAndCount();

    return {
      items: products.map((product) => this.toSummaryDto(product)),
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

    return this.toDetailDto(product);
  }
}
