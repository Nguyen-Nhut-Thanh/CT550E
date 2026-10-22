import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PostsAdminController } from './posts-admin.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsAdminController],
  providers: [PrismaService, PostsService],
})
export class PostsModule {}
