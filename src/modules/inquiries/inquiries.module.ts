import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InquiriesController } from "./inquiries.controller";
import { InquiriesService } from "./inquiries.service";
import { Inquiry } from "./entities/inquiry.entity";
import { Customer } from "../customers/entities/customer.entity";
import { Product } from "../products/entities/product.entity";
import { Country } from "../geography/entities/country.entity";
import { Port } from "../geography/entities/port.entity";
import { InquiryStepEvent } from "./entities/inquiry-step-event.entity";
import { InquiryProduct } from "./entities/inquiry-product.entity";
import { InquiryCommercial } from "./entities/inquiry-commercial.entity";
import { InquiryRequirement } from "./entities/inquiry-requirement.entity";
import { InquiryCertificate } from "./entities/inquiry-certificate.entity";
import { Notification } from "./entities/notification.entity";
import { EmailOutbox } from "./entities/email-outbox.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry,
      Customer,
      Product,
      Country,
      Port,
      InquiryStepEvent,
      InquiryProduct,
      InquiryCommercial,
      InquiryRequirement,
      InquiryCertificate,
      Notification,
      EmailOutbox,
    ]),
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
