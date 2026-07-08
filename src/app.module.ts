import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { InquiriesModule } from "./modules/inquiries/inquiries.module";
import { BlogsModule } from "./modules/blogs/blogs.module";
import { UsersModule } from "./modules/users/users.module";
import { GeographyModule } from "./modules/geography/geography.module";
import { MediaModule } from "./modules/media/media.module";
import { MailModule } from "./modules/mail/mail.module";
import { typeOrmModuleAsyncOptions } from "./database/typeorm.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleAsyncOptions),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MediaModule,
    MailModule,
    ProductsModule,
    InquiriesModule,
    BlogsModule,
    GeographyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
