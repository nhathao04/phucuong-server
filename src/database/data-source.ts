import "reflect-metadata";
import { DataSource } from "typeorm";
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
    Product,
    Inquiry,
    Certificate,
    InquiryCertificate,
    InquiryStepEvent,
    InquiryAssignment,
    EmailOutbox,
  ],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
});
