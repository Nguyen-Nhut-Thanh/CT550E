import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { FlashDealsController } from "./flash-deals.controller";
import { FlashDealsService } from "./flash-deals.service";

@Module({
  controllers: [FlashDealsController],
  providers: [PrismaService, FlashDealsService],
  exports: [FlashDealsService],
})
export class FlashDealsModule {}
