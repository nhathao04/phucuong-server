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
  BlogDetailDto,
  BlogListResponseDto,
  BlogSummaryDto,
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
    };
  }

  private toSummaryDto(blog: Blog): BlogSummaryDto {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      thumbnailUrl: blog.thumbnailUrl,
      status: blog.status,
      isFeatured: blog.isFeatured,
      sortOrder: blog.sortOrder,
      isActive: blog.isActive,
      publishedAt: blog.publishedAt,
      author: this.toAuthorDto(blog),
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  private toDetailDto(blog: Blog): BlogDetailDto {
    return {
      ...this.toSummaryDto(blog),
      content: blog.content,
      seoTitle: blog.seoTitle,
      metaDescription: blog.metaDescription,
      focusKeyword: blog.focusKeyword,
    };
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
      relations: { author: true },
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
        content: dto.content ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
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
      const withAuthor = await this.blogsRepository.findOne({
        where: { id: saved.id },
        relations: { author: true },
      });

      return this.toDetailDto(withAuthor!);
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
      relations: { author: true },
    });

    if (!blog) throw new NotFoundException("Blog not found");

    try {
      if (dto.title || dto.slug) {
        blog.slug = this.resolveSlug(dto.title ?? blog.title, dto.slug);
      }

      if (dto.title !== undefined) blog.title = dto.title;
      if (dto.excerpt !== undefined) blog.excerpt = dto.excerpt ?? null;
      if (dto.content !== undefined) blog.content = dto.content ?? null;
      if (dto.thumbnailUrl !== undefined)
        blog.thumbnailUrl = dto.thumbnailUrl ?? null;
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
      return this.toDetailDto(saved);
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
      relations: { author: true },
    });

    if (!blog) throw new NotFoundException("Blog not found");
    return this.toDetailDto(blog);
  }
}
