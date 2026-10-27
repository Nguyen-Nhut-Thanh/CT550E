import { Controller, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsPublicController {
    constructor(private readonly posts: PostsService) {}
    @Get('layout')
    layout() { return this.posts.getPublicLayout(); }
    @Get(':slug')
    detail(@Param('slug') slug: string) { return this.posts.getPublicPost(slug); }
}
