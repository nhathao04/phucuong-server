import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StaffRoleGuard } from "../../common/guards/staff-role.guard";
import { ProductAttributesService } from "./product-attributes.service";
import {
  AddAttributeOptionDto,
  CreateProductAttributeDto,
  ProductAttributeListQueryDto,
  ProductAttributeResponseDto,
  UpdateAttributeOptionDto,
  UpdateProductAttributeDto,
} from "./dto/product-attribute.dto";

@ApiTags("staff-product-attributes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffRoleGuard)
@Controller("staff/product-attributes")
export class ProductAttributesController {
  constructor(
    private readonly attributesService: ProductAttributesService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List product attributes (staff)" })
  @ApiResponse({
    status: 200,
    type: ProductAttributeResponseDto,
    isArray: true,
  })
  list(
    @Query() query: ProductAttributeListQueryDto,
  ): Promise<ProductAttributeResponseDto[]> {
    return this.attributesService.list(query);
  }

  @Get(":identifier")
  @ApiOperation({ summary: "Get attribute detail by id or code (staff)" })
  @ApiParam({
    name: "identifier",
    description: "Attribute ID or code",
    example: "shell_color",
  })
  @ApiResponse({ status: 200, type: ProductAttributeResponseDto })
  detail(
    @Param("identifier") identifier: string,
  ): Promise<ProductAttributeResponseDto> {
    return this.attributesService.getDetail(identifier);
  }

  @Post()
  @ApiOperation({ summary: "Create product attribute master (staff)" })
  @ApiResponse({ status: 201, type: ProductAttributeResponseDto })
  create(
    @Body() dto: CreateProductAttributeDto,
  ): Promise<ProductAttributeResponseDto> {
    return this.attributesService.create(dto);
  }

  @Patch(":identifier")
  @ApiOperation({ summary: "Update product attribute (staff)" })
  @ApiResponse({ status: 200, type: ProductAttributeResponseDto })
  update(
    @Param("identifier") identifier: string,
    @Body() dto: UpdateProductAttributeDto,
  ): Promise<ProductAttributeResponseDto> {
    return this.attributesService.update(identifier, dto);
  }

  @Delete(":identifier")
  @ApiOperation({ summary: "Soft-delete attribute (set isActive=false)" })
  @ApiParam({
    name: "identifier",
    description: "Attribute ID or code",
    example: "shell_color",
  })
  softDelete(
    @Param("identifier") identifier: string,
  ): Promise<{ code: string }> {
    return this.attributesService.softDelete(identifier);
  }

  @Post(":identifier/options")
  @ApiOperation({ summary: "Add option to a select-type attribute (staff)" })
  @ApiResponse({ status: 201, type: ProductAttributeResponseDto })
  addOption(
    @Param("identifier") identifier: string,
    @Body() dto: AddAttributeOptionDto,
  ): Promise<ProductAttributeResponseDto> {
    return this.attributesService.addOption(identifier, dto);
  }

  @Patch(":identifier/options/:optionId")
  @ApiOperation({ summary: "Update option (staff)" })
  @ApiResponse({ status: 200, type: ProductAttributeResponseDto })
  updateOption(
    @Param("identifier") identifier: string,
    @Param("optionId") optionId: string,
    @Body() dto: UpdateAttributeOptionDto,
  ): Promise<ProductAttributeResponseDto> {
    return this.attributesService.updateOption(
      identifier,
      Number(optionId),
      dto,
    );
  }

  @Delete(":identifier/options/:optionId")
  @ApiOperation({ summary: "Delete option (staff)" })
  deleteOption(
    @Param("identifier") identifier: string,
    @Param("optionId") optionId: string,
  ): Promise<{ id: number }> {
    return this.attributesService.deleteOption(
      identifier,
      Number(optionId),
    );
  }
}

@ApiTags("public-product-attributes")
@Controller("product-attributes")
export class PublicProductAttributesController {
  constructor(
    private readonly attributesService: ProductAttributesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "List product attributes (public)",
    description:
      "Returns active attributes. FE uses groupKey to split into Specifications / Packing sections.",
  })
  @ApiResponse({
    status: 200,
    type: ProductAttributeResponseDto,
    isArray: true,
  })
  list(
    @Query() query: ProductAttributeListQueryDto,
  ): Promise<ProductAttributeResponseDto[]> {
    return this.attributesService.list({ ...query, isActive: true });
  }
}