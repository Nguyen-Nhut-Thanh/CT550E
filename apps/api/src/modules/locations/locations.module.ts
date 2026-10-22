import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { LocationsAdminController } from './locations-admin.controller';
import { LocationsAdminService } from './locations-admin.service';
import { LocationsPublicController } from './locations-public.controller';
import { LocationsPublicService } from './locations-public.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [LocationsPublicController, LocationsAdminController],
  providers: [PrismaService, LocationsPublicService, LocationsAdminService],
  exports: [LocationsPublicService],
})
export class LocationsModule {}
