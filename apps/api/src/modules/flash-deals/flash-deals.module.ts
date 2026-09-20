import { Module } from "@nestjs/common";
import { FlashDealsController } from "./flash-deals.controller";

@Module({
  controllers: [FlashDealsController]
})
export class FlashDealsModule {}
