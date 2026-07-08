import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GeographyController } from "./geography.controller";
import { GeographyService } from "./geography.service";
import { Country } from "./entities/country.entity";
import { Port } from "./entities/port.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Country, Port])],
  controllers: [GeographyController],
  providers: [GeographyService],
  exports: [GeographyService],
})
export class GeographyModule {}
