import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Blog, BlogStatus } from "./entities/blog.entity";
import { CreateBlogDto, UpdateBlogDto } from "./dto/blog.dto";
import { BlogListQueryDto } from "./dto/blog-list-query.dto";
import {
  BlogAuthorDto,
  BlogCategoryDto,
  BlogDetailDto,
  BlogListResponseDto,
  BlogSummaryDto,
  BlogTagDto,
} from "./dto/blog-response.dto";

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
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

  private toTagDtos(blog: Blog): BlogTagDto[] {
    return (blog.tags ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    }));
  }

  private toSummaryDto(blog: Blog): BlogSummaryDto {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      thumbnailUrl: blog.thumbnailUrl,
      category: this.toCategoryDto(blog),
      tags: this.toTagDtos(blog),
      readTimeMinutes: blog.readTimeMinutes,
      status: blog.status,
      isFeatured: blog.isFeatured,
      sortOrder: blog.sortOrder,
      isActive: blog.isActive,
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
      coverImageUrl: blog.coverImageUrl,
      contentHtml: blog.contentHtml,
      contentJson: blog.contentJson,
      contentText: blog.contentText,
    };
  }

  private loadRelations() {
    return { author: true, category: true, tags: true } as const;
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
      .orderBy("blog.sortOrder", "ASC")
      .addOrderBy("blog.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere(
        "(blog.title ILIKE :search OR blog.slug ILIKE :search OR blog.excerpt ILIKE :search)",
        { search: `%${query.search.trim()}%` },
      );
    }

    if (query.status) {
      qb.andWhere("blog.status = :status", { status: query.status });
    }

    if (typeof query.isActive === "boolean") {
      qb.andWhere("blog.isActive = :isActive", { isActive: query.isActive });
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
      const slug = this.resolveSlug(dto.title, dto.slug);
      const status = dto.status ?? BlogStatus.DRAFT;

      const blog = this.blogsRepository.create({
        title: dto.title,
        slug,
        excerpt: dto.excerpt ?? null,
        contentHtml: dto.contentHtml ?? null,
        contentJson: dto.contentJson ?? null,
        contentText: dto.contentText ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        readTimeMinutes: dto.readTimeMinutes ?? null,
        seoTitle: dto.seoTitle ?? null,
        metaDescription: dto.metaDescription ?? null,
        focusKeyword: dto.focusKeyword ?? null,
        status,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
        authorId,
      });

      const saved = await this.blogsRepository.save(blog);
      const full = await this.blogsRepository.findOne({
        where: { id: saved.id },
        relations: this.loadRelations(),
      });

      return this.toDetailDto(full!);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Blog slug already exists");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBlogDto): Promise<BlogDetailDto> {
    const blog = await this.blogsRepository.findOne({
      where: { id },
      relations: this.loadRelations(),
    });

    if (!blog) throw new NotFoundException("Blog not found");

    try {
      if (dto.title !== undefined || dto.slug !== undefined) {
        blog.slug = this.resolveSlug(dto.title ?? blog.title, dto.slug);
      }

      if (dto.title !== undefined) blog.title = dto.title;
      if (dto.excerpt !== undefined) blog.excerpt = dto.excerpt ?? null;
      if (dto.contentHtml !== undefined)
        blog.contentHtml = dto.contentHtml ?? null;
      if (dto.contentJson !== undefined)
        blog.contentJson = dto.contentJson ?? null;
      if (dto.contentText !== undefined)
        blog.contentText = dto.contentText ?? null;
      if (dto.thumbnailUrl !== undefined)
        blog.thumbnailUrl = dto.thumbnailUrl ?? null;
      if (dto.coverImageUrl !== undefined)
        blog.coverImageUrl = dto.coverImageUrl ?? null;
      if (dto.readTimeMinutes !== undefined)
        blog.readTimeMinutes = dto.readTimeMinutes ?? null;
      if (dto.seoTitle !== undefined) blog.seoTitle = dto.seoTitle ?? null;
      if (dto.metaDescription !== undefined)
        blog.metaDescription = dto.metaDescription ?? null;
      if (dto.focusKeyword !== undefined)
        blog.focusKeyword = dto.focusKeyword ?? null;
      if (dto.isFeatured !== undefined) blog.isFeatured = dto.isFeatured;
      if (dto.sortOrder !== undefined) blog.sortOrder = dto.sortOrder;
      if (dto.isActive !== undefined) blog.isActive = dto.isActive;

      if (dto.status !== undefined && dto.status !== blog.status) {
        blog.status = dto.status;
        if (dto.status === BlogStatus.PUBLISHED && !blog.publishedAt) {
          blog.publishedAt = new Date();
        }
      }

      const saved = await this.blogsRepository.save(blog);
      const full = await this.blogsRepository.findOne({
        where: { id: saved.id },
        relations: this.loadRelations(),
      });
      return this.toDetailDto(full!);
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
      .where("blog.status = :status", { status: BlogStatus.PUBLISHED })
      .andWhere("blog.isActive = true")
      .orderBy("blog.sortOrder", "ASC")
      .addOrderBy("blog.publishedAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere("(blog.title ILIKE :search OR blog.excerpt ILIKE :search)", {
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
      where: { slug, status: BlogStatus.PUBLISHED, isActive: true },
      relations: this.loadRelations(),
    });

    if (!blog) throw new NotFoundException("Blog not found");
    return this.toDetailDto(blog);
  }
}
