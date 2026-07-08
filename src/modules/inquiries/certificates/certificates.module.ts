import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../../users/users.module";
import { Certificate } from "../entities/certificate.entity";
import { ProductCertificate } from "../../products/entities/product-certificate.entity";
import {
  PublicCertificatesController,
  StaffCertificatesController,
} from "./certificates.controller";
import { CertificatesService } from "./certificates.service";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Certificate, ProductCertificate]),
  ],
  controllers: [StaffCertificatesController, PublicCertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
