import { Module } from "@nestjs/common";
import { MembershipController } from "./membership.controller";
import { MembershipService } from "./membership.service";
import { VouchersModule } from "../vouchers/vouchers.module";
import { WorkforceModule } from "../workforce/workforce.module";
import { MembershipAdminController } from "./membership-admin.controller";

@Module({
  imports: [VouchersModule, WorkforceModule],
  controllers: [MembershipController, MembershipAdminController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
