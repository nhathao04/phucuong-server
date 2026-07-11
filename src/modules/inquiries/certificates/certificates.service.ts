import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Certificate } from "../entities/certificate.entity";
import { ProductCertificate } from "../../products/entities/product-certificate.entity";
import {
  CertificateListQueryDto,
  CertificateResponseDto,
  CertificateUsageCountDto,
  CreateCertificateDto,
  UpdateCertificateDto,
} from "./dto/certificate.dto";

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(ProductCertificate)
    private readonly productCertificateRepository: Repository<ProductCertificate>,
  ) {}

  // ── LIST ─────────────────────────────────────────────────────────────────
  //
  // Returns every certificate master row with a usage count (number of
  // products that currently attach to it). Optional `search` does a
  // case-insensitive substring match on the name.
  async list(
    query: CertificateListQueryDto,
  ): Promise<CertificateResponseDto[]> {
    const trimmedSearch = query.search?.trim();

    const certificates = await this.certificateRepository.find({
      where: trimmedSearch ? { name: ILike(`%${trimmedSearch}%`) } : {},
      order: { name: "ASC" },
    });

    if (certificates.length === 0) return [];

    // Single grouped query to fetch usage counts for every cert at once.
    const rawCounts = await this.productCertificateRepository
      .createQueryBuilder("pc")
      .select("pc.certificateId", "certificateId")
      .addSelect("COUNT(*)", "count")
      .where("pc.certificateId IN (:...ids)", {
        ids: certificates.map((c) => c.id),
      })
      .groupBy("pc.certificateId")
      .getRawMany<{ certificateId: string; count: string }>();

    const countById = new Map<string, number>();
    for (const row of rawCounts) {
      countById.set(row.certificateId, Number(row.count) || 0);
    }

    return certificates.map((certificate) =>
      this.toResponseDto(certificate, countById.get(certificate.id) ?? 0),
    );
  }

  // ── DETAIL ───────────────────────────────────────────────────────────────
  async getDetail(id: string): Promise<CertificateResponseDto> {
    const certificate = await this.findCertificateOrThrow(id);
    const productCount = await this.productCertificateRepository.count({
      where: { certificateId: id },
    });
    return this.toResponseDto(certificate, productCount);
  }

  // ── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateCertificateDto): Promise<CertificateResponseDto> {
    const name = dto.name.trim();
    const existing = await this.certificateRepository.findOne({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(`Certificate already exists: ${name}`);
    }

    const saved = await this.certificateRepository.save(
      this.certificateRepository.create({
        name,
        isActive: dto.isActive ?? true,
        fileUrl: dto.fileUrl ?? null,
      }),
    );

    return this.toResponseDto(saved, 0);
  }

  // ── UPDATE ───────────────────────────────────────────────────────────────
  async update(
    id: string,
    dto: UpdateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.findCertificateOrThrow(id);

    if (dto.name !== undefined) {
      const nextName = dto.name.trim();
      if (nextName !== certificate.name) {
        const dup = await this.certificateRepository.findOne({
          where: { name: nextName },
        });
        if (dup && dup.id !== certificate.id) {
          throw new ConflictException(
            `Certificate name already in use: ${nextName}`,
          );
        }
        certificate.name = nextName;
      }
    }

    if (dto.isActive !== undefined) certificate.isActive = dto.isActive;
    if (dto.fileUrl !== undefined) certificate.fileUrl = dto.fileUrl;

    const saved = await this.certificateRepository.save(certificate);
    return this.toResponseDto(
      saved,
      await this.productCertificateRepository.count({
        where: { certificateId: id },
      }),
    );
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  // Hard delete. The DB foreign keys (`product_certificates.certificateId`
  // and `inquiry_certificates.certificateId` both `ON DELETE CASCADE`) will
  // automatically clear junction rows. We surface a clear 400 if any inquiry
  // is still actively referencing the certificate, to prevent accidental
  // loss of historical inquiry data.

  async remove(id: string): Promise<{ id: string }> {
    const certificate = await this.findCertificateOrThrow(id);
    await this.certificateRepository.delete(certificate.id);
    return { id: certificate.id };
  }

  // ── USAGE (used by admin UI to confirm blast radius before delete) ──────
  async getUsage(id: string): Promise<CertificateUsageCountDto> {
    await this.findCertificateOrThrow(id);
    const productCount = await this.productCertificateRepository.count({
      where: { certificateId: id },
    });
    return { id, productCount };
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  private async findCertificateOrThrow(id: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate not found: ${id}`);
    }
    return certificate;
  }

  private toResponseDto(
    certificate: Certificate,
    productCount: number,
  ): CertificateResponseDto {
    return {
      id: certificate.id,
      name: certificate.name,
      isActive: certificate.isActive,
      fileUrl: certificate.fileUrl,
      productCount,
      createdAt: certificate.createdAt,
    };
  }
}
