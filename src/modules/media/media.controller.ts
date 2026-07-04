import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
  CreateAssetDto,
  ListAssetsQueryDto,
} from "./dto/asset-request.dto";
import { AssetSummaryDto } from "./dto/asset.dto";
import { AssetListResponseDto } from "./dto/asset-response.dto";
import { MediaService } from "./media.service";

@ApiTags("media")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("media")
export class StaffMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Upload / register a media asset",
    description:
      "Used by FE editor to register an image (uploaded elsewhere) or paste image flow. Returns the canonical asset object.",
  })
  @ApiResponse({ status: 201, type: AssetSummaryDto })
  create(
    @Body() dto: CreateAssetDto,
    @Request() req: { user: { sub?: string } },
  ): Promise<AssetSummaryDto> {
    return this.mediaService.create(dto, req.user?.sub ?? null);
  }
}

@ApiTags("media")
@Controller("media")
export class PublicMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: "List public assets (optionally filtered by owner)" })
  @ApiResponse({ status: 200, type: AssetListResponseDto })
  list(@Query() query: ListAssetsQueryDto): Promise<AssetListResponseDto> {
    return this.mediaService.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get public asset by id" })
  @ApiResponse({ status: 200, type: AssetSummaryDto })
  detail(@Param("id") id: string): Promise<AssetSummaryDto> {
    return this.mediaService.findById(id);
  }
}
