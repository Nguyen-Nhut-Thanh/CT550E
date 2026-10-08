import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ToursPublicController } from './tours-public.controller';
import { ToursPublicService } from './tours-public.service';

@Module({
  controllers: [ToursPublicController],
  providers: [PrismaService, ToursPublicService],
  exports: [ToursPublicService],
})
export class ToursModule {}
