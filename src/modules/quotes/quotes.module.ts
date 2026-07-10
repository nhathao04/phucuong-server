import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TradeTerm } from "../products/entities/trade-term.entity";
import { Quote } from "./entities/quote.entity";
import { User } from "../users/entities/user.entity";
import { QuotesController } from "./quotes.controller";
import { TradeTermsController } from "./trade-terms.controller";
import { QuotesService } from "./quotes.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quote,
      User,
      TradeTerm,
    ]),
  ],
  controllers: [QuotesController, TradeTermsController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
