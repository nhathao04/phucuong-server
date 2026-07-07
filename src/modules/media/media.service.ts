import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Asset, AssetOwnerType } from "./entities/asset.entity";
import { AssetListResponseDto } from "./dto/asset-response.dto";
import { AssetSummaryDto, toAssetSummary } from "./dto/asset.dto";
import {
  CreateAssetDto,
  ListAssetsQueryDto,
} from "./dto/asset-request.dto";

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
  ) {}

  async create(
    dto: CreateAssetDto,
    uploadedById?: string | null,
  ): Promise<AssetSummaryDto> {
    if (!dto.url) {
      throw new NotFoundException("Asset url is required");
    }

    const asset = this.assetsRepository.create({
      url: dto.url,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      alt: dto.alt ?? null,
      caption: dto.caption ?? null,
      width: dto.width ?? null,
      height: dto.height ?? null,
      sortOrder: dto.sortOrder ?? 0,
      mimeType: dto.mimeType ?? "image/webp",
      originalName: dto.originalName ?? null,
      storageKey: dto.storageKey ?? null,
      byteSize: dto.byteSize ?? null,
      ownerType: dto.ownerType ?? AssetOwnerType.GENERAL,
      ownerId: dto.ownerId ?? null,
      uploadedById: uploadedById ?? null,
    });

    const saved = await this.assetsRepository.save(asset);
    return toAssetSummary(saved)!;
  }

  async findById(id: string): Promise<AssetSummaryDto> {
    const asset = await this.assetsRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException("Asset not found");
    }
    return toAssetSummary(asset)!;
  }

  async findManyByIds(ids: string[]): Promise<Asset[]> {
    if (ids.length === 0) return [];
    return this.assetsRepository.findByIds(ids);
  }

  async listByOwner(
    ownerType: AssetOwnerType,
    ownerId: string,
  ): Promise<AssetSummaryDto[]> {
    const assets = await this.assetsRepository.find({
      where: { ownerType, ownerId },
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
    return assets.map((asset) => toAssetSummary(asset)!);
  }

  async list(query: ListAssetsQueryDto): Promise<AssetListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;

    const qb = this.assetsRepository
      .createQueryBuilder("asset")
      .orderBy("asset.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (query.ownerType) {
      qb.andWhere("asset.ownerType = :ownerType", {
        ownerType: query.ownerType,
      });
    }

    if (query.ownerId) {
      qb.andWhere("asset.ownerId = :ownerId", { ownerId: query.ownerId });
    }

    const [assets, total] = await qb.getManyAndCount();

    return {
      items: assets.map((asset) => toAssetSummary(asset)!),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }
}
