import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quote } from "./entities/quote.entity";
import { QuoteItem } from "./entities/quote-item.entity";
import { QuoteCertificate } from "./entities/quote-certificate.entity";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quote, QuoteItem, QuoteCertificate, User]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
