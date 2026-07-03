import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { Blog } from "./entities/blog.entity";
import { BlogsService } from "./blogs.service";
import {
  StaffBlogsController,
  PublicBlogsController,
} from "./blogs.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), UsersModule],
  controllers: [StaffBlogsController, PublicBlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
