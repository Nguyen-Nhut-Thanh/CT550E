import { Module } from "@nestjs/common";
import { MailModule } from "../../infrastructure/mail/mail.module";
import { BookingServicesController } from "./booking-services-public.controller";
import { BookingsAdminController } from './bookings-admin.controller';
import { BookingsController } from "./bookings.controller";
import { BookingsAdminService } from './bookings-admin.service';
import { BookingsService } from "./bookings.service";
@Module({ imports: [MailModule], controllers: [BookingServicesController, BookingsController, BookingsAdminController], providers: [BookingsService, BookingsAdminService] })
export class BookingsModule {
}
