import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";
import { ProductListQueryDto } from "./dto/product-list-query.dto";
import {
  ProductDetailDto,
  ProductListResponseDto,
} from "./dto/product-response.dto";
import { ProductsService } from "./products.service";

@ApiTags("staff-products")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get product list for staff" })
  @ApiResponse({ status: 200, type: ProductListResponseDto })
  list(@Query() query: ProductListQueryDto): Promise<ProductListResponseDto> {
    return this.productsService.listForStaff(query);
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
}
