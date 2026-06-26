import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../modules/users/entities/role.entity";
import { User } from "../modules/users/entities/user.entity";
import { DatabaseSeederService } from "./database-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
