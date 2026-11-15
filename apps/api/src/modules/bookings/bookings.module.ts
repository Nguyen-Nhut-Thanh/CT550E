import { Module } from "@nestjs/common";
import { MailModule } from "../../infrastructure/mail/mail.module";
import { BookingServicesController } from "./booking-services-public.controller";
import { BookingsAdminController } from './bookings-admin.controller';
import { BookingsController } from "./bookings.controller";
import { BookingsAdminService } from './bookings-admin.service';
import { BookingsService } from "./bookings.service";
import { MembershipModule } from "../membership/membership.module";
import { WorkforceModule } from "../workforce/workforce.module";

@Module({
  imports: [MailModule, MembershipModule, WorkforceModule],
  controllers: [BookingServicesController, BookingsController, BookingsAdminController],
  providers: [BookingsService, BookingsAdminService],
})
export class BookingsModule {}
