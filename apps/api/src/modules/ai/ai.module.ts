import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot/chatbot.controller';

@Module({ controllers: [ChatbotController] })
export class AiModule {}
