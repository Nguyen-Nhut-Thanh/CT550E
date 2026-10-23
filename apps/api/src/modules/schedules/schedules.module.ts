import { Module } from '@nestjs/common';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { CloudinaryModule } from '../../infrastructure/storage/cloudinary.module';
import { SchedulesAdminController } from './schedules-admin.controller';
import { SchedulesAdminService } from './schedules-admin.service';
@Module({ imports: [MailModule, CloudinaryModule], controllers: [SchedulesAdminController], providers: [SchedulesAdminService] })
export class SchedulesModule {
}
