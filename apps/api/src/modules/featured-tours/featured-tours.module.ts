import { Module } from '@nestjs/common';
import { FeaturedToursController } from './featured-tours.controller';
import { FeaturedToursService } from './featured-tours.service';
@Module({
    controllers: [FeaturedToursController],
    providers: [FeaturedToursService],
    exports: [FeaturedToursService],
})
export class FeaturedToursModule {
}
