import { Module } from "@nestjs/common";
import { MembershipController } from "./membership.controller";
import { MembershipService } from "./membership.service";
import { VouchersModule } from "../vouchers/vouchers.module";
import { MembershipAdminController } from "./membership-admin.controller";

@Module({
  imports: [VouchersModule],
  controllers: [MembershipController, MembershipAdminController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
