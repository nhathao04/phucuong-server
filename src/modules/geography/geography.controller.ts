import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { GeographyService } from "./geography.service";
import {
  DestinationCountryDto,
  DestinationListResponseDto,
  DestinationPortDto,
} from "./dto/destination-response.dto";

@ApiTags("Geography")
@Controller("geography")
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  // ── GET /api/geography/destinations ────────────────────────────────────────
  // Primary endpoint for Step 1 — returns countries + nested ports, sorted
  // priority-first. By default countries with no active ports are excluded
  // (would never be useful to a buyer).
  @Get("destinations")
  @ApiOperation({
    summary: "List destination countries with their ports (Step 1 dropdown data)",
    description:
      "Returns active countries grouped with their active ports. " +
      "Priority markets come first then alphabetical. Countries without " +
      "any active port are excluded unless `includeEmptyCountries=true`.",
  })
  @ApiQuery({
    name: "priorityOnly",
    required: false,
    type: Boolean,
    description:
      "When true, only returns countries flagged as priority markets.",
  })
  @ApiQuery({
    name: "includeEmptyCountries",
    required: false,
    type: Boolean,
    description:
      "When true, countries without any active port are also included.",
  })
  @ApiOkResponse({ type: DestinationListResponseDto })
  async destinations(
    @Query("priorityOnly") priorityOnly?: string,
    @Query("includeEmptyCountries") includeEmptyCountries?: string,
  ): Promise<DestinationListResponseDto> {
    return this.geographyService.listDestinations({
      priorityOnly: priorityOnly === "true",
      includeEmptyCountries: includeEmptyCountries === "true",
    });
  }

  // ── GET /api/geography/countries ───────────────────────────────────────────
  // Flat list — useful for a wide country autocomplete / typeahead.
  @Get("countries")
  @ApiOperation({
    summary: "List all active destination countries (flat, no ports)",
  })
  @ApiOkResponse({ type: [DestinationCountryDto] })
  async countries(): Promise<DestinationCountryDto[]> {
    return this.geographyService.listCountries();
  }

  // ── GET /api/geography/countries/:id/ports ─────────────────────────────────
  // Sub-endpoint — used when buyer chooses a country and Step 1 needs to
  // refresh the port dropdown.
  @Get("countries/:id/ports")
  @ApiOperation({
    summary: "List active ports for a specific destination country",
  })
  @ApiOkResponse({ type: [DestinationPortDto] })
  async portsForCountry(
    @Param("id", new ParseUUIDPipe()) countryId: string,
  ): Promise<DestinationPortDto[]> {
    return this.geographyService.listPortsForCountry(countryId);
  }
}
