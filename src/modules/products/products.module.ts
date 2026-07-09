import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { MediaModule } from "../media/media.module";
import { ProductAttribute } from "./entities/product-attribute.entity";
import { ProductAttributeMapping } from "./entities/product-attribute-mapping.entity";
import { ProductAttributeOption } from "./entities/product-attribute-option.entity";
import { ProductAttributeValue } from "./entities/product-attribute-value.entity";
import { ProductCertificate } from "./entities/product-certificate.entity";
import { ProductFaq } from "./entities/product-faq.entity";
import { ProductImage } from "./entities/product-image.entity";
import { Product } from "./entities/product.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { ProductContainerConfig } from "./entities/product-container-config.entity";
import { ProductCountryConfig } from "./entities/product-country-config.entity";
import { ProductPackagingOption } from "./entities/product-packaging-option.entity";
import { ProductTargetBuyer } from "./entities/product-target-buyer.entity";
import { ProductTechnicalSpecification } from "./entities/product-technical-specification.entity";
import { ProductTradeTerm } from "./entities/product-trade-term.entity";
import { ProductWhyChooseUs } from "./entities/product-why-choose-us.entity";
import { TradeTerm } from "./entities/trade-term.entity";
import { Country } from "../geography/entities/country.entity";
import { Certificate } from "../inquiries/entities/certificate.entity";
import {
  ProductsController,
  PublicProductsController,
} from "./products.controller";
import { ProductsService } from "./products.service";
import { ProductAttributesModule } from "./product-attributes.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductAttribute,
      ProductAttributeOption,
      ProductAttributeMapping,
      ProductAttributeValue,
      ProductContainerConfig,
      ProductCountryConfig,
      ProductFaq,
      ProductCertificate,
      ProductImage,
      ProductTechnicalSpecification,
      ProductPackagingOption,
      ProductTargetBuyer,
      ProductWhyChooseUs,
      TradeTerm,
      ProductTradeTerm,
      Country,
      Certificate,
    ]),
    UsersModule,
    MediaModule,
    ProductAttributesModule,
  ],
  controllers: [ProductsController, PublicProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
