import { ConfigService } from "@nestjs/config";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { Certificate } from "../modules/inquiries/entities/certificate.entity";
import { EmailOutbox } from "../modules/inquiries/entities/email-outbox.entity";
import { EmailVerificationToken } from "../modules/auth/entities/email-verification-token.entity";
import { InquiryAssignment } from "../modules/inquiries/entities/inquiry-assignment.entity";
import { InquiryCertificate } from "../modules/inquiries/entities/inquiry-certificate.entity";
import { InquiryStepEvent } from "../modules/inquiries/entities/inquiry-step-event.entity";
import { Inquiry } from "../modules/inquiries/entities/inquiry.entity";
import { PasswordResetToken } from "../modules/auth/entities/password-reset-token.entity";
import { Product } from "../modules/products/entities/product.entity";
import { RefreshToken } from "../modules/auth/entities/refresh-token.entity";
import { Role } from "../modules/users/entities/role.entity";
import { User } from "../modules/users/entities/user.entity";

export const typeOrmAsyncConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get<string>("DB_HOST", "localhost"),
  port: configService.get<number>("DB_PORT", 5432),
  username: configService.get<string>("DB_USERNAME", "postgres"),
  password: configService.get<string>("DB_PASSWORD", "postgres"),
  database: configService.get<string>("DB_NAME", "phucuong_db"),
  entities: [
    User,
    Role,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
    Product,
    Inquiry,
    Certificate,
    InquiryCertificate,
    InquiryStepEvent,
    InquiryAssignment,
    EmailOutbox,
  ],
  synchronize: false,
  logging: configService.get<string>("NODE_ENV") === "development",
  migrations: ["dist/database/migrations/*.js"],
  migrationsRun: false,
  autoLoadEntities: true,
});

export const typeOrmModuleAsyncOptions: TypeOrmModuleAsyncOptions = {
  useFactory: typeOrmAsyncConfig,
  inject: [ConfigService],
};
