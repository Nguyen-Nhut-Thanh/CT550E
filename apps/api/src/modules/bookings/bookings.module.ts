import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { MailModule } from "../mail/mail.module";
import { BookingServicesController, BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

@Module({ imports: [MailModule], controllers: [BookingServicesController, BookingsController], providers: [PrismaService, BookingsService] })
export class BookingsModule {}
