import { Module } from '@nestjs/common';
import { PostsAdminController } from './posts-admin.controller';
import { PostsService } from './posts.service';
@Module({
    controllers: [PostsAdminController],
    providers: [PostsService],
})
export class PostsModule {
}
