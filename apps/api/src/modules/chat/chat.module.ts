import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { CloudinaryModule } from '../../infrastructure/storage/cloudinary.module';
import { WorkforceModule } from '../workforce/workforce.module';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [CloudinaryModule, SecurityModule, WorkforceModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
