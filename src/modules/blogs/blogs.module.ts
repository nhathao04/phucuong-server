import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { MediaModule } from "../media/media.module";
import { Blog } from "./entities/blog.entity";
import { BlogAsset } from "./entities/blog-asset.entity";
import { BlogCategory } from "./entities/blog-category.entity";
import { BlogTag } from "./entities/blog-tag.entity";
import { BlogsService } from "./blogs.service";
import {
  StaffBlogsController,
  PublicBlogsController,
} from "./blogs.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, BlogCategory, BlogTag, BlogAsset]),
    UsersModule,
    MediaModule,
  ],
  controllers: [StaffBlogsController, PublicBlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
