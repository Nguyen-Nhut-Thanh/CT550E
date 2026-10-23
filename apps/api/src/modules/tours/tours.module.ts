import { Module } from '@nestjs/common';
import { ToursAdminController } from './tours-admin.controller';
import { ToursPublicController } from './tours-public.controller';
import { ToursAdminService } from './tours-admin.service';
import { ToursPublicService } from './tours-public.service';
@Module({
    imports: [],
    controllers: [ToursPublicController, ToursAdminController],
    providers: [ToursPublicService, ToursAdminService],
    exports: [ToursPublicService],
})
export class ToursModule {
}
