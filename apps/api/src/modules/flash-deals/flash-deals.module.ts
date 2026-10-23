import { Module } from "@nestjs/common";
import { FlashDealsAdminController } from "./flash-deals-admin.controller";
import { FlashDealsPublicController } from "./flash-deals-public.controller";
import { FlashDealsService } from "./flash-deals.service";
@Module({
    controllers: [FlashDealsPublicController, FlashDealsAdminController],
    providers: [FlashDealsService],
    exports: [FlashDealsService],
})
export class FlashDealsModule {
}
