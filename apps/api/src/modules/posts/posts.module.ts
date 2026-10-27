import { Module } from '@nestjs/common';
import { PostsAdminController } from './posts-admin.controller';
import { PostsService } from './posts.service';
import { PostsPublicController } from './posts-public.controller';
import { CloudinaryModule } from '../../infrastructure/storage/cloudinary.module';
@Module({
    imports: [CloudinaryModule],
    controllers: [PostsAdminController, PostsPublicController],
    providers: [PostsService],
})
export class PostsModule {
}
