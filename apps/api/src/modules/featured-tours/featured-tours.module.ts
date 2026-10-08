import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FeaturedToursController } from './featured-tours.controller';
import { FeaturedToursService } from './featured-tours.service';

@Module({
  controllers: [FeaturedToursController],
  providers: [PrismaService, FeaturedToursService],
  exports: [FeaturedToursService],
})
export class FeaturedToursModule {}
