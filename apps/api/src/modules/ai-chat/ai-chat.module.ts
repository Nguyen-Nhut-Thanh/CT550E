import { Module } from "@nestjs/common";
import { VouchersModule } from "../vouchers/vouchers.module";
import { AiChatController } from "./ai-chat.controller";
import { AiChatService } from "./ai-chat.service";
import { AiChatTours } from "./ai-chat-tours.service";

@Module({
  imports: [VouchersModule],
  controllers: [AiChatController],
  providers: [AiChatService, AiChatTours],
})
export class AiChatModule {}

