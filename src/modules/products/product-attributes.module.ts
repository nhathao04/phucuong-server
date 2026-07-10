import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { ProductAttribute } from "./entities/product-attribute.entity";
import { ProductAttributeOption } from "./entities/product-attribute-option.entity";
import { ProductAttributeValue } from "./entities/product-attribute-value.entity";
import { ProductAttributeMapping } from "./entities/product-attribute-mapping.entity";
import { Product } from "./entities/product.entity";
import { ProductAttributesService } from "./product-attributes.service";
import {
  ProductAttributesController,
  PublicProductAttributesController,
} from "./product-attributes.controller";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      ProductAttribute,
      ProductAttributeOption,
      ProductAttributeValue,
      ProductAttributeMapping,
      Product,
    ]),
  ],
  controllers: [
    ProductAttributesController,
    PublicProductAttributesController,
  ],
  providers: [ProductAttributesService],
  exports: [ProductAttributesService],
})
export class ProductAttributesModule {}