import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

import { Product } from "../products/entities/product.entity";
import { Inquiry } from "../inquiries/entities/inquiry.entity";
import { InquiryActivity } from "../inquiries/entities/inquiry-activity.entity";
import { User } from "../users/entities/user.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inquiry, InquiryActivity, User]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}