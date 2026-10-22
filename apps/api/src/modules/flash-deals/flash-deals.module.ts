import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { FlashDealsAdminController } from "./flash-deals-admin.controller";
import { FlashDealsPublicController } from "./flash-deals-public.controller";
import { FlashDealsService } from "./flash-deals.service";

@Module({
  controllers: [FlashDealsPublicController, FlashDealsAdminController],
  providers: [PrismaService, FlashDealsService],
  exports: [FlashDealsService],
})
export class FlashDealsModule {}
