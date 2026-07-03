import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { ProductAttribute } from "./entities/product-attribute.entity";
import { ProductAttributeMapping } from "./entities/product-attribute-mapping.entity";
import { ProductAttributeOption } from "./entities/product-attribute-option.entity";
import { Product } from "./entities/product.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { ProductContainerConfig } from "./entities/product-container-config.entity";
import { ProductCountryConfig } from "./entities/product-country-config.entity";
import { ProductTradeTerm } from "./entities/product-trade-term.entity";
import { TradeTerm } from "./entities/trade-term.entity";
import { Country } from "../geography/entities/country.entity";
import {
  ProductsController,
  PublicProductsController,
} from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductAttribute,
      ProductAttributeOption,
      ProductAttributeMapping,
      ProductContainerConfig,
      ProductCountryConfig,
      TradeTerm,
      ProductTradeTerm,
      Country,
    ]),
    UsersModule,
  ],
  controllers: [ProductsController, PublicProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
