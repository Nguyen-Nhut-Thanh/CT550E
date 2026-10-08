import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LocationsController } from './locations.controller';
import { LocationsPublicService } from './locations-public.service';

@Module({
  controllers: [LocationsController],
  providers: [PrismaService, LocationsPublicService],
  exports: [LocationsPublicService],
})
export class LocationsModule {}
