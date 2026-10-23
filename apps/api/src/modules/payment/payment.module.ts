import { Module } from "@nestjs/common";
import { MailModule } from "../../infrastructure/mail/mail.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
@Module({ imports: [MailModule], controllers: [PaymentController], providers: [PaymentService] })
export class PaymentModule {
}
