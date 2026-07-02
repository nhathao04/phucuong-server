import "reflect-metadata";
import { DataSource } from "typeorm";
import { Customer } from "../modules/customers/entities/customer.entity";
import { Certificate } from "../modules/inquiries/entities/certificate.entity";
import { EmailOutbox } from "../modules/inquiries/entities/email-outbox.entity";
import { EmailLog } from "../modules/inquiries/entities/email-log.entity";
import { EmailVerificationToken } from "../modules/auth/entities/email-verification-token.entity";
import { InquiryActivity } from "../modules/inquiries/entities/inquiry-activity.entity";
import { InquiryAssignment } from "../modules/inquiries/entities/inquiry-assignment.entity";
import { InquiryCertificate } from "../modules/inquiries/entities/inquiry-certificate.entity";
import { InquiryCommercial } from "../modules/inquiries/entities/inquiry-commercial.entity";
import { InquiryProduct } from "../modules/inquiries/entities/inquiry-product.entity";
import { InquiryProductAttribute } from "../modules/inquiries/entities/inquiry-product-attribute.entity";
import { InquiryRequirement } from "../modules/inquiries/entities/inquiry-requirement.entity";
import { InquiryStepEvent } from "../modules/inquiries/entities/inquiry-step-event.entity";
import { Inquiry } from "../modules/inquiries/entities/inquiry.entity";
import { PasswordResetToken } from "../modules/auth/entities/password-reset-token.entity";
import { Notification } from "../modules/inquiries/entities/notification.entity";
import { Country } from "../modules/geography/entities/country.entity";
import { Port } from "../modules/geography/entities/port.entity";
import { Product } from "../modules/products/entities/product.entity";
import { ProductAttribute } from "../modules/products/entities/product-attribute.entity";
import { ProductAttributeMapping } from "../modules/products/entities/product-attribute-mapping.entity";
import { ProductAttributeOption } from "../modules/products/entities/product-attribute-option.entity";
import { ProductCertificate } from "../modules/products/entities/product-certificate.entity";
import { ProductCategory } from "../modules/products/entities/product-category.entity";
import { ProductContainerConfig } from "../modules/products/entities/product-container-config.entity";
import { ProductCountryConfig } from "../modules/products/entities/product-country-config.entity";
import { ProductFaq } from "../modules/products/entities/product-faq.entity";
import { ProductTradeTerm } from "../modules/products/entities/product-trade-term.entity";
import { TradeTerm } from "../modules/products/entities/trade-term.entity";
import { RefreshToken } from "../modules/auth/entities/refresh-token.entity";
import { Role } from "../modules/users/entities/role.entity";
import { User } from "../modules/users/entities/user.entity";

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "phucuong_db",
  entities: [
    User,
    Role,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
    Country,
    Port,
    Customer,
    Product,
    ProductCategory,
    ProductAttribute,
    ProductAttributeOption,
    ProductAttributeMapping,
    ProductContainerConfig,
    ProductCountryConfig,
    ProductCertificate,
    ProductFaq,
    TradeTerm,
    ProductTradeTerm,
    Inquiry,
    Certificate,
    InquiryCertificate,
    InquiryStepEvent,
    InquiryAssignment,
    InquiryProduct,
    InquiryProductAttribute,
    InquiryCommercial,
    InquiryRequirement,
    InquiryActivity,
    EmailOutbox,
    EmailLog,
    Notification,
  ],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: true,
});
