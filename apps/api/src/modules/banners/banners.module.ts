import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { BannersAdminController } from './banners-admin.controller';
import { BannersPublicController } from './banners-public.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [BannersPublicController, BannersAdminController],
  providers: [BannersService, PrismaService],
  exports: [BannersService],
})
export class BannersModule {}
