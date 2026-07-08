import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Country } from "./entities/country.entity";
import { Port } from "./entities/port.entity";
import {
  DestinationCountryDto,
  DestinationListResponseDto,
  DestinationPortDto,
} from "./dto/destination-response.dto";

interface DestinationQuery {
  includeEmptyCountries?: boolean; // true = countries with no ports still appear
  priorityOnly?: boolean; // true = only isPriorityMarket=true
}

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Port)
    private readonly portRepository: Repository<Port>,
  ) {}

  // ── Public: load destinations used by the inquiry Step 1 form ────────────
  //
  // Returns active countries + active ports grouped under each country.
  // Priority markets come first, then alphabetical by name. Caller can
  // narrow down with ?priorityOnly=true (hot markets) or
  // ?includeEmptyCountries=true (countries without a configured port).
  async listDestinations(
    query: DestinationQuery = {},
  ): Promise<DestinationListResponseDto> {
    const countries = await this.countryRepository.find({
      where: {
        isActive: true,
        ...(query.priorityOnly ? { isPriorityMarket: true } : {}),
      },
      relations: { ports: true },
      order: {
        priorityOrder: "ASC",
        name: "ASC",
      },
    });

    const mapped: DestinationCountryDto[] = [];
    for (const country of countries) {
      const ports = (country.ports ?? [])
        .filter((port) => port.isActive)
        .sort((a, b) => {
          // major ports first, then alphabetical
          if (a.isMajor !== b.isMajor) return a.isMajor ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

      if (!query.includeEmptyCountries && ports.length === 0) {
        // skip countries with no active port — useless for Step 1 dropdown
        continue;
      }

      mapped.push({
        id: country.id,
        code: country.code,
        name: country.name,
        region: country.region ?? null,
        isPriorityMarket: country.isPriorityMarket,
        priorityOrder: country.priorityOrder ?? null,
        ports: ports.map(
          (port): DestinationPortDto => ({
            id: port.id,
            code: port.code ?? null,
            name: port.name,
            isMajor: port.isMajor,
            isActive: port.isActive,
          }),
        ),
      });
    }

    return { countries: mapped };
  }

  // ── Public: list countries (flat, no ports) — useful for a wide autocomplete ──

  async listCountries(): Promise<DestinationCountryDto[]> {
    const countries = await this.countryRepository.find({
      where: { isActive: true },
      order: { priorityOrder: "ASC", name: "ASC" },
    });
    return countries.map(
      (country): DestinationCountryDto => ({
        id: country.id,
        code: country.code,
        name: country.name,
        region: country.region ?? null,
        isPriorityMarket: country.isPriorityMarket,
        priorityOrder: country.priorityOrder ?? null,
        ports: [],
      }),
    );
  }

  // ── Public: ports for one country — used when buyer picks a country in Step 1 ──

  async listPortsForCountry(countryId: string): Promise<DestinationPortDto[]> {
    const ports = await this.portRepository.find({
      where: { countryId, isActive: true },
      order: { isMajor: "DESC", name: "ASC" },
    });
    return ports.map(
      (port): DestinationPortDto => ({
        id: port.id,
        code: port.code ?? null,
        name: port.name,
        isMajor: port.isMajor,
        isActive: port.isActive,
      }),
    );
  }
}
