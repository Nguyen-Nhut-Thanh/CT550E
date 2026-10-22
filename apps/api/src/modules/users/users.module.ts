import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UsersAdminController } from './users-admin.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersAdminController],
  providers: [PrismaService, UsersService],
})
export class UsersModule {}
