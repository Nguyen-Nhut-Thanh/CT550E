import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailModule } from '../mail/mail.module';
import { ToursAdminController } from './tours-admin.controller';
import { ToursAdminService } from './tours-admin.service';
import { ToursPublicController } from './tours-public.controller';
import { ToursPublicService } from './tours-public.service';

@Module({
  imports: [MailModule, CloudinaryModule],
  controllers: [ToursPublicController, ToursAdminController],
  providers: [PrismaService, ToursPublicService, ToursAdminService],
  exports: [ToursPublicService],
})
export class ToursModule {}
