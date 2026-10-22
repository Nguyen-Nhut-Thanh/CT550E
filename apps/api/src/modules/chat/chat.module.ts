import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { PrismaService } from '../../prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

const jwtExpiresIn: StringValue = (process.env.JWT_EXPIRES_IN ?? '86400') as StringValue;

@Module({
  imports: [
    CloudinaryModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, PrismaService],
})
export class ChatModule {}
