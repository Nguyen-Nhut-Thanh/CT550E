import { Module } from "@nestjs/common";
import { CloudinaryModule } from "../../infrastructure/storage/cloudinary.module";
import { ReviewsAdminController } from './reviews-admin.controller';
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
@Module({
    imports: [CloudinaryModule],
    controllers: [ReviewsController, ReviewsAdminController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule {
}
