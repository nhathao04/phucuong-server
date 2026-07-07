import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InquiriesController } from "./inquiries.controller";
import { StaffInquiriesController } from "./inquiries-admin.controller";
import { InquiriesService } from "./inquiries.service";
import { InquiriesAdminService } from "./inquiries-admin.service";

import { Inquiry } from "./entities/inquiry.entity";
import { InquiryActivity } from "./entities/inquiry-activity.entity";
import { InquiryAssignment } from "./entities/inquiry-assignment.entity";
import { InquiryStepEvent } from "./entities/inquiry-step-event.entity";
import { InquiryProduct } from "./entities/inquiry-product.entity";
import { InquiryProductAttribute } from "./entities/inquiry-product-attribute.entity";
import { InquiryCommercial } from "./entities/inquiry-commercial.entity";
import { InquiryRequirement } from "./entities/inquiry-requirement.entity";
import { InquiryCertificate } from "./entities/inquiry-certificate.entity";
import { Certificate } from "./entities/certificate.entity";
import { Notification } from "./entities/notification.entity";
import { EmailOutbox } from "./entities/email-outbox.entity";

import { Customer } from "../customers/entities/customer.entity";
import { Product } from "../products/entities/product.entity";
import { ProductAttribute } from "../products/entities/product-attribute.entity";
import { ProductAttributeOption } from "../products/entities/product-attribute-option.entity";
import { ProductContainerConfig } from "../products/entities/product-container-config.entity";
import { ProductCountryConfig } from "../products/entities/product-country-config.entity";
import { Country } from "../geography/entities/country.entity";
import { Port } from "../geography/entities/port.entity";
import { User } from "../users/entities/user.entity";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry,
      Customer,
      Product,
      ProductContainerConfig,
      ProductCountryConfig,
      Country,
      Port,
      User,
      InquiryActivity,
      InquiryAssignment,
      InquiryStepEvent,
      InquiryProduct,
      InquiryProductAttribute,
      InquiryCommercial,
      InquiryRequirement,
      InquiryCertificate,
      Certificate,
      Notification,
      EmailOutbox,
      ProductAttribute,
      ProductAttributeOption,
    ]),
    UsersModule,
    MailModule,
  ],
  controllers: [InquiriesController, StaffInquiriesController],
  providers: [InquiriesService, InquiriesAdminService],
  exports: [InquiriesService, InquiriesAdminService],
})
export class InquiriesModule {}
