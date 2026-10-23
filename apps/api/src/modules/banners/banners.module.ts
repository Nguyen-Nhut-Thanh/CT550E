import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../infrastructure/storage/cloudinary.module';
import { BannersAdminController } from './banners-admin.controller';
import { BannersPublicController } from './banners-public.controller';
import { BannersService } from './banners.service';
@Module({
    imports: [CloudinaryModule],
    controllers: [BannersPublicController, BannersAdminController],
    providers: [BannersService],
    exports: [BannersService],
})
export class BannersModule {
}
