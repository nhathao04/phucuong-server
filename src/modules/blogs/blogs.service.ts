import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, QueryFailedError, Repository } from "typeorm";
import { Asset, AssetOwnerType } from "../media/entities/asset.entity";
import { AssetSummaryDto } from "../media/dto/asset.dto";
import { BlogAsset } from "./entities/blog-asset.entity";
import { BlogCategory } from "./entities/blog-category.entity";
import { Blog, BlogStatus } from "./entities/blog.entity";
import {
  BlogAuthorDto,
  BlogCategoryDto,
  BlogDetailDto,
  BlogListResponseDto,
  BlogSummaryDto,
  BlogTableOfContentsItemDto,
} from "./dto/blog-response.dto";
import { BlogCategoryResponseDto } from "./dto/blog-category-response.dto";
import {
  BlogAssetRefDto,
  CreateBlogDto,
  UpdateBlogDto,
} from "./dto/blog.dto";
import { BlogListQueryDto } from "./dto/blog-list-query.dto";
import { buildTableOfContents } from "./utils/toc.util";

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
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(BlogCategory)
    private readonly categoriesRepository: Repository<BlogCategory>,
  ) {}

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  private resolveSlug(title: string, slug?: string): string {
    return this.slugify(slug?.trim() || title);
  }

  private toAuthorDto(blog: Blog): BlogAuthorDto | null {
    if (!blog.author) return null;
    return {
      id: blog.author.id,
      fullName: blog.author.fullName,
      avatarUrl: blog.author.avatarUrl ?? null,
    };
  }

  private toCategoryDto(blog: Blog): BlogCategoryDto | null {
    if (!blog.category) return null;
    return {
      id: blog.category.id,
      name: blog.category.name,
      slug: blog.category.slug,
    };
  }

  private toAssetLinkDtos(blog: Blog): AssetSummaryDto[] {
    if (!blog.assets) return [];
    return [...blog.assets]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((link) => toAssetSummary(link.asset))
      .filter((asset): asset is AssetSummaryDto => Boolean(asset));
  }

  private toSummaryDto(blog: Blog): BlogSummaryDto {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      thumbnailUrl: blog.thumbnailUrl,
      thumbnail: toAssetSummary(blog.thumbnailAsset),
      category: this.toCategoryDto(blog),
      tags: (blog.tags ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
      status: blog.status,
      isFeatured: blog.isFeatured,
      publishedAt: blog.publishedAt,
      author: this.toAuthorDto(blog),
      seoTitle: blog.seoTitle,
      metaDescription: blog.metaDescription,
      focusKeyword: blog.focusKeyword,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  private toDetailDto(blog: Blog): BlogDetailDto {
    return {
      ...this.toSummaryDto(blog),
      coverImage: toAssetSummary(blog.coverImage),
      assets: this.toAssetLinkDtos(blog),
      tableOfContents: this.toToc(blog),
      contentHtml: blog.contentHtml,
      contentJson: blog.contentJson,
      contentText: blog.contentText,
    };
  }

  private toToc(blog: Blog): BlogTableOfContentsItemDto[] {
    if (!blog.contentJson) return [];
    return buildTableOfContents(
      blog.contentJson as unknown as Parameters<typeof buildTableOfContents>[0],
    );
  }

  private loadRelations() {
    return {
      author: true,
      category: true,
      tags: true,
      thumbnailAsset: true,
      coverImage: true,
      assets: { asset: true },
    } as const;
  }

  private async ensureAssetFromUrl(
    manager: EntityManager,
    url: string,
    ownerId: string,
    ownerType: AssetOwnerType = AssetOwnerType.BLOG,
  ): Promise<string | null> {
    if (!url) return null;

    const assetRepository = manager.getRepository(Asset);
    let asset = await assetRepository.findOne({
      where: { url },
      select: { id: true },
    });

    if (!asset) {
      asset = assetRepository.create({
        url,
        thumbnailUrl: url,
        mimeType: "image",
        ownerType,
        ownerId,
      });
      asset = await assetRepository.save(asset);
    }

    return asset.id;
  }

  private async syncAssets(
    manager: EntityManager,
    blogId: string,
    assets?: BlogAssetRefDto[] | null,
  ): Promise<void> {
    if (assets === undefined || assets === null) {
      return;
    }
    const blogAssetRepository = manager.getRepository(BlogAsset);
    const assetRepository = manager.getRepository(Asset);
    await blogAssetRepository.delete({ blogId });

    if (assets.length === 0) {
      return;
    }

    const seen = new Set<string>();
    const entries: BlogAsset[] = [];

    for (const asset of assets) {
      let assetId = asset.assetId;

      // If URL is provided instead of assetId, create or find existing Asset
      if (!assetId && asset.url) {
        let existingAsset = await assetRepository.findOne({
          where: { url: asset.url },
          select: { id: true },
        });

        if (!existingAsset) {
          existingAsset = assetRepository.create({
            url: asset.url,
            thumbnailUrl: asset.url,
            alt: asset.alt ?? null,
            caption: asset.caption ?? null,
            mimeType: "image",
            ownerType: AssetOwnerType.BLOG,
            ownerId: blogId,
          });
          existingAsset = await assetRepository.save(existingAsset);
        }
        assetId = existingAsset.id;
      }

      if (!assetId || seen.has(assetId)) continue;
      seen.add(assetId);

      entries.push(
        blogAssetRepository.create({
          blogId,
          assetId,
          sortOrder: asset.sortOrder ?? entries.length,
        }),
      );
    }

    if (entries.length > 0) {
      await blogAssetRepository.save(entries);
    }
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

  // ──────────────────────── Staff endpoints ────────────────────────

  async staffList(query: BlogListQueryDto): Promise<BlogListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.blogsRepository
      .createQueryBuilder("blog")
      .leftJoinAndSelect("blog.author", "author")
      .leftJoinAndSelect("blog.category", "category")
      .leftJoinAndSelect("blog.tags", "tags")
      .leftJoinAndSelect("blog.thumbnailAsset", "thumbnailAsset")
      .leftJoinAndSelect("blog.coverImage", "coverImage")
      .leftJoinAndSelect("blog.assets", "assets")
      .leftJoinAndSelect("assets.asset", "assetRef")
      .orderBy("blog.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere(
        "(blog.title ILIKE :search OR blog.slug ILIKE :search)",
        { search: `%${query.search.trim()}%` },
      );
    }

    if (query.status) {
      qb.andWhere("blog.status = :status", { status: query.status });
    }

    const [blogs, total] = await qb.getManyAndCount();

    return {
      items: blogs.map((b) => this.toSummaryDto(b)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async staffDetail(id: string): Promise<BlogDetailDto> {
    const blog = await this.blogsRepository.findOne({
      where: [{ id }, { slug: id }],
      relations: this.loadRelations(),
    });

    if (!blog) throw new NotFoundException("Blog not found");
    return this.toDetailDto(blog);
  }

  async create(dto: CreateBlogDto, authorId: string): Promise<BlogDetailDto> {
    try {
      return await this.blogsRepository.manager.transaction(
        async (manager) => {
          const blogRepository = manager.getRepository(Blog);

          // Create blog first to get ID
          const slug = this.resolveSlug(dto.title, dto.slug);
          const status = dto.status ?? BlogStatus.DRAFT;

          const blog = blogRepository.create({
            title: dto.title,
            slug,
            contentHtml: dto.contentHtml ?? null,
            contentJson: dto.contentJson ?? null,
            contentText: dto.contentText ?? null,
            seoTitle: dto.seoTitle ?? null,
            metaDescription: dto.metaDescription ?? null,
            focusKeyword: dto.focusKeyword ?? null,
            status,
            isFeatured: dto.isFeatured ?? false,
            publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
            authorId,
          });

          const saved = await blogRepository.save(blog);

          // Auto-create assets from URLs if provided
          if (dto.thumbnailUrl) {
            saved.thumbnailAssetId = await this.ensureAssetFromUrl(
              manager,
              dto.thumbnailUrl,
              saved.id,
              AssetOwnerType.BLOG,
            );
            saved.thumbnailUrl = dto.thumbnailUrl;
          } else if (dto.thumbnailAssetId) {
            saved.thumbnailAssetId = dto.thumbnailAssetId;
          }

          if (dto.coverImageAssetId) {
            saved.coverImageAssetId = dto.coverImageAssetId;
          }

          await blogRepository.save(saved);

          if (dto.assets) {
            await this.syncAssets(manager, saved.id, dto.assets);
          }

          const full = await blogRepository.findOne({
            where: { id: saved.id },
            relations: this.loadRelations(),
          });

          return this.toDetailDto(full!);
        },
      );
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Blog slug already exists");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBlogDto): Promise<BlogDetailDto> {
    try {
      return await this.blogsRepository.manager.transaction(
        async (manager) => {
          const blogRepository = manager.getRepository(Blog);
          const blog = await blogRepository.findOne({
            where: { id },
            relations: this.loadRelations(),
          });

          if (!blog) throw new NotFoundException("Blog not found");

          if (dto.title !== undefined || dto.slug !== undefined) {
            blog.slug = this.resolveSlug(dto.title ?? blog.title, dto.slug);
          }

          if (dto.title !== undefined) blog.title = dto.title;
          if (dto.contentHtml !== undefined)
            blog.contentHtml = dto.contentHtml ?? null;
          if (dto.contentJson !== undefined)
            blog.contentJson = dto.contentJson ?? null;
          if (dto.contentText !== undefined)
            blog.contentText = dto.contentText ?? null;

          // Handle thumbnailUrl - auto-create asset from URL
          if (dto.thumbnailUrl !== undefined) {
            blog.thumbnailUrl = dto.thumbnailUrl ?? null;
            if (dto.thumbnailUrl) {
              blog.thumbnailAssetId = await this.ensureAssetFromUrl(
                manager,
                dto.thumbnailUrl,
                blog.id,
                AssetOwnerType.BLOG,
              );
            } else {
              blog.thumbnailAssetId = null;
              blog.thumbnailAsset = null;
            }
          }
          if (dto.thumbnailAssetId !== undefined) {
            blog.thumbnailAssetId = dto.thumbnailAssetId ?? null;
            blog.thumbnailAsset = null;
          }

          // Handle coverImageAssetId
          if (dto.coverImageAssetId !== undefined) {
            blog.coverImageAssetId = dto.coverImageAssetId ?? null;
            blog.coverImage = null;
          }

          if (dto.seoTitle !== undefined) blog.seoTitle = dto.seoTitle ?? null;
          if (dto.metaDescription !== undefined)
            blog.metaDescription = dto.metaDescription ?? null;
          if (dto.focusKeyword !== undefined)
            blog.focusKeyword = dto.focusKeyword ?? null;
          if (dto.isFeatured !== undefined) blog.isFeatured = dto.isFeatured;

          if (dto.status !== undefined && dto.status !== blog.status) {
            blog.status = dto.status;
            if (dto.status === BlogStatus.PUBLISHED && !blog.publishedAt) {
              blog.publishedAt = new Date();
            }
          }

          const saved = await blogRepository.save(blog);

          if (dto.assets !== undefined) {
            await this.syncAssets(manager, saved.id, dto.assets);
          }

          const full = await blogRepository.findOne({
            where: { id: saved.id },
            relations: this.loadRelations(),
          });
          return this.toDetailDto(full!);
        },
      );
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Blog slug already exists");
      }
      throw error;
    }
  }

  async publish(id: string): Promise<BlogDetailDto> {
    return this.update(id, { status: BlogStatus.PUBLISHED });
  }

  async unpublish(id: string): Promise<BlogDetailDto> {
    return this.update(id, { status: BlogStatus.HIDDEN });
  }

  // ──────────────────────── Public endpoints ────────────────────────

  async publicList(query: BlogListQueryDto): Promise<BlogListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.blogsRepository
      .createQueryBuilder("blog")
      .leftJoinAndSelect("blog.author", "author")
      .leftJoinAndSelect("blog.category", "category")
      .leftJoinAndSelect("blog.tags", "tags")
      .leftJoinAndSelect("blog.thumbnailAsset", "thumbnailAsset")
      .where("blog.status = :status", { status: BlogStatus.PUBLISHED })
      .orderBy("blog.publishedAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere("(blog.title ILIKE :search OR blog.slug ILIKE :search)", {
        search: `%${query.search.trim()}%`,
      });
    }

    const [blogs, total] = await qb.getManyAndCount();

    return {
      items: blogs.map((b) => this.toSummaryDto(b)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async publicDetail(slug: string): Promise<BlogDetailDto> {
    const blog = await this.blogsRepository.findOne({
      where: { slug, status: BlogStatus.PUBLISHED },
      relations: this.loadRelations(),
    });

    if (!blog) throw new NotFoundException("Blog not found");
    return this.toDetailDto(blog);
  }

  // ──────────────────────── Category endpoints ────────────────────────

  async listCategories(): Promise<BlogCategoryResponseDto[]> {
    const categories = await this.categoriesRepository.find({
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  async listActiveCategories(): Promise<BlogCategoryResponseDto[]> {
    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }
}
