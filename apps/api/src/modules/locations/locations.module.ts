import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../infrastructure/storage/cloudinary.module';
import { LocationsAdminController } from './locations-admin.controller';
import { LocationsPublicController } from './locations-public.controller';
import { LocationsAdminService } from './locations-admin.service';
import { LocationsPublicService } from './locations-public.service';
@Module({
    imports: [CloudinaryModule],
    controllers: [LocationsPublicController, LocationsAdminController],
    providers: [LocationsPublicService, LocationsAdminService],
    exports: [LocationsPublicService],
})
export class LocationsModule {
}
