import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DestinationPortDto {
  @ApiProperty({ example: "uuid-of-port" })
  id!: string;

  @ApiProperty({ example: "SGN" })
  code!: string | null;

  @ApiProperty({ example: "Ho Chi Minh Port" })
  name!: string;

  @ApiProperty({ example: true })
  isMajor!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class DestinationCountryDto {
  @ApiProperty({ example: "uuid-of-destination-country" })
  id!: string;

  @ApiProperty({ example: "VN" })
  code!: string;

  @ApiProperty({ example: "Vietnam" })
  name!: string;

  @ApiPropertyOptional({ example: "Asia" })
  region!: string | null;

  @ApiProperty({ example: true })
  isPriorityMarket!: boolean;

  @ApiPropertyOptional({ example: 1 })
  priorityOrder!: number | null;

  @ApiProperty({ type: [DestinationPortDto] })
  ports!: DestinationPortDto[];
}

export class DestinationListResponseDto {
  @ApiProperty({
    type: [DestinationCountryDto],
    description:
      "Active destination countries with their active ports, sorted " +
      "priority-market-first then alphabetical.",
  })
  countries!: DestinationCountryDto[];
}
