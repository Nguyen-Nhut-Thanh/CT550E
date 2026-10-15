import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { MailModule } from "../mail/mail.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
@Module({ imports: [MailModule], controllers: [PaymentController], providers: [PaymentService, PrismaService] })
export class PaymentModule {}
