import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { MailModule } from "../mail/mail.module";
import { BookingServicesController, BookingsController, BookingVoucherController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

@Module({ imports: [MailModule], controllers: [BookingServicesController, BookingsController, BookingVoucherController], providers: [PrismaService, BookingsService] })
export class BookingsModule {}
