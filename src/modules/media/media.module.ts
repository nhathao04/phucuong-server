import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Asset } from "./entities/asset.entity";
import { MediaService } from "./media.service";
import {
  PublicMediaController,
  StaffMediaController,
} from "./media.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  controllers: [StaffMediaController, PublicMediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
