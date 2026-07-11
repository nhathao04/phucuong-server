import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";
import {
  CreateProductDto,
  CREATE_PRODUCT_SWAGGER_EXAMPLE,
  CREATE_PRODUCT_AUTO_DERIVE_SWAGGER_EXAMPLE,
  UPDATE_PRODUCT_PARTIAL_SWAGGER_EXAMPLE,
  UPDATE_PRODUCT_REPLACE_CONFIGS_SWAGGER_EXAMPLE,
  UpdateProductDto,
} from "./dto/product-request.dto";
import { ProductListQueryDto } from "./dto/product-list-query.dto";
import {
  ProductDetailDto,
  ProductListResponseDto,
  ProductOrderConfigDto,
  ProductCategorySummaryDto,
} from "./dto/product-response.dto";
import { ProductsService } from "./products.service";
import { ProductListQueryDto as PublicProductListQueryDto } from "./dto/product-list-query.dto";
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "./dto/product-category.dto";

@ApiTags("staff-products")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get product list for staff" })
  @ApiResponse({
    status: 200,
    type: ProductListResponseDto,
    description:
      "Returns paginated products with full relations: category, attributeMappings, containerConfigs, and tradeTerms.",
  })
  list(@Query() query: ProductListQueryDto): Promise<ProductListResponseDto> {
    return this.productsService.listForStaff(query);
  }

  @Post()
  @ApiOperation({
    summary: "Create product for staff",
    description:
      "Create product core data and optional normalized configurations.\n\n" +
      "**Auto-derivation (since feature)**: if you send `attributeValues` with codes " +
      "`container_load` + `container_type`, the server auto-creates `containerConfigs`. " +
      "If you send `attributeValues` with code `moq`, the server auto-fills `quoteConfig.moq` " +
      "in the parser-friendly form `<N> x <CODE>`. Explicit `containerConfigs` and `quoteConfig.moq` always win.",
  })
  @ApiBody({
    type: CreateProductDto,
    description:
      "Two patterns are supported. Pattern A: send everything explicitly (recommended for complex SKUs). " +
      "Pattern B: send only `attributeValues` and rely on auto-derivation for `containerConfigs` + `quoteConfig.moq`.",
    examples: {
      full: {
        summary: "Pattern A — explicit containerConfigs + quoteConfig.moq",
        value: CREATE_PRODUCT_SWAGGER_EXAMPLE,
      },
      autoDerive: {
        summary:
          "Pattern B — only attributeValues (container load + MOQ auto-derived)",
        value: CREATE_PRODUCT_AUTO_DERIVE_SWAGGER_EXAMPLE,
      },
    },
  })
  @ApiResponse({ status: 201, type: ProductDetailDto })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductDetailDto> {
    return this.productsService.createStaffProduct(createProductDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product detail for staff" })
  @ApiResponse({ status: 200, type: ProductDetailDto })
  @ApiParam({
    name: "id",
    description: "Product UUID or slug",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  detail(@Param("id") id: string): Promise<ProductDetailDto> {
    return this.productsService.getStaffDetail(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product for staff" })
  @ApiBody({
    type: UpdateProductDto,
    description:
      "Update product core data and optionally replace normalized configurations. Sending config arrays replaces existing records; sending empty arrays clears them.\n\n" +
      "**Auto-derivation** applies the same as POST: if `attributeValues` contains codes " +
      "`container_load`/`container_type`/`moq` and the corresponding `containerConfigs`/`quoteConfig.moq` " +
      "are omitted, the server derives them automatically. Explicit values always win.",
    examples: {
      replaceConfigs: {
        summary: "Replace attribute/container/trade-term configurations",
        value: UPDATE_PRODUCT_REPLACE_CONFIGS_SWAGGER_EXAMPLE,
      },
      partialOnly: {
        summary: "Partial update only (no configuration replacement)",
        value: UPDATE_PRODUCT_PARTIAL_SWAGGER_EXAMPLE,
      },
    },
  })
  @ApiResponse({ status: 200, type: ProductDetailDto })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDetailDto> {
    return this.productsService.updateStaffProduct(id, updateProductDto);
  }

  @Patch(":id/soft-delete")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft delete product (status → hidden)" })
  @ApiParam({ name: "id", description: "Product UUID" })
  @ApiResponse({ status: 200, type: ProductDetailDto })
  softDelete(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ProductDetailDto> {
    return this.productsService.softDeleteProduct(id);
  }

  @Get(":id/order-config")
  @ApiOperation({
    summary: "Get inquiry order config (staff)",
    description:
      "Returns attribute mappings with full options + container configs + country MOQ + trade terms. Used by staff to preview the public inquiry form for a product.",
  })
  @ApiParam({
    name: "id",
    description: "Product UUID or slug",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({ status: 200, type: ProductOrderConfigDto })
  orderConfig(@Param("id") id: string): Promise<ProductOrderConfigDto> {
    return this.productsService.getOrderConfig(id);
  }
}

// ─────────────────────── Public ───────────────────────

@ApiTags("public-products")
@Controller("products")
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: "List published products (public)",
    description:
      "Returns only published and active products. Supports search, pagination.",
  })
  @ApiResponse({
    status: 200,
    type: ProductListResponseDto,
    description: "Paginated list of published products with full relations.",
  })
  list(
    @Query() query: PublicProductListQueryDto,
  ): Promise<ProductListResponseDto> {
    return this.productsService.listPublic(query);
  }

  @Get("categories")
  @ApiOperation({ summary: "List active product categories (public)" })
  @ApiResponse({ status: 200, type: [ProductCategorySummaryDto] })
  listCategories(): Promise<ProductCategorySummaryDto[]> {
    return this.productsService.listActiveCategories();
  }

  @Get(":identifier")
  @ApiOperation({
    summary: "Get published product detail (public)",
    description: "Accepts product UUID or slug.",
  })
  @ApiParam({
    name: "identifier",
    description: "Product UUID or slug",
    example: "whole-dried-coconut",
  })
  @ApiResponse({ status: 200, type: ProductDetailDto })
  detail(@Param("identifier") identifier: string): Promise<ProductDetailDto> {
    return this.productsService.getPublicDetail(identifier);
  }

  @Get(":identifier/order-config")
  @ApiOperation({
    summary: "Get inquiry order config (public)",
    description:
      "Returns the trimmed payload (attribute mappings + options + container + country MOQ + trade terms) used to render the Inquiry Step 2 / Step 3 form. Accepts UUID or slug.",
  })
  @ApiParam({
    name: "identifier",
    description: "Product UUID or slug",
    example: "whole-dried-coconut",
  })
  @ApiResponse({ status: 200, type: ProductOrderConfigDto })
  orderConfig(
    @Param("identifier") identifier: string,
  ): Promise<ProductOrderConfigDto> {
    return this.productsService.getPublicOrderConfig(identifier);
  }
}

// ─────────────────────── Staff (categories) ────────────────────────

@ApiTags("staff-product-categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/product-categories")
export class StaffProductCategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "List all product categories (staff)" })
  @ApiResponse({ status: 200, type: [ProductCategorySummaryDto] })
  list(): Promise<ProductCategorySummaryDto[]> {
    return this.productsService.listCategories();
  }

  @Post()
  @ApiOperation({ summary: "Create product category" })
  @ApiResponse({ status: 201, type: ProductCategorySummaryDto })
  @ApiResponse({ status: 409, description: "Slug already exists" })
  create(
    @Body() dto: CreateProductCategoryDto,
  ): Promise<ProductCategorySummaryDto> {
    return this.productsService.createCategory(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product category detail" })
  @ApiParam({ name: "id", description: "Category ID", example: 12 })
  @ApiResponse({ status: 200, type: ProductCategorySummaryDto })
  @ApiResponse({ status: 404, description: "Category not found" })
  detail(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductCategorySummaryDto> {
    return this.productsService.getCategoryDetail(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product category" })
  @ApiParam({ name: "id", description: "Category ID", example: 12 })
  @ApiResponse({ status: 200, type: ProductCategorySummaryDto })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({ status: 409, description: "Slug already exists" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductCategoryDto,
  ): Promise<ProductCategorySummaryDto> {
    return this.productsService.updateCategory(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Soft delete product category (sets isActive = false)",
  })
  @ApiParam({ name: "id", description: "Category ID", example: 12 })
  @ApiResponse({ status: 200, type: ProductCategorySummaryDto })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({
    status: 409,
    description: "Cannot delete: category is still referenced by products",
  })
  softDelete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductCategorySummaryDto> {
    return this.productsService.softDeleteCategory(id);
  }
}
