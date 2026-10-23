import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, } from '@nestjs/common';
import type { AuthRequest, PostAdminQuery, PostCategoryPayload, PostPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { PostsService } from './posts.service';
@Controller()
@UseGuards(AdminAuthGuard)
export class PostsAdminController {
    constructor(private readonly postsService: PostsService) { }
    @Get('admin/posts')
    findAllAdmin(
    @Query()
    query: PostAdminQuery) {
        return this.postsService.findAllAdmin(query);
    }
    @Post('admin/posts')
    create(
    @Req()
    req: AuthRequest,
    @Body()
    data: PostPayload) {
        return this.postsService.createPost(req.user.accountId!, data);
    }
    @Patch('admin/posts/:id')
    update(
    @Param('id')
    id: string,
    @Body()
    data: PostPayload) {
        return this.postsService.updatePost(Number(id), data);
    }
    @Delete('admin/posts/:id')
    remove(
    @Param('id')
    id: string) {
        return this.postsService.deletePost(Number(id));
    }
    @Get('admin/post-categories')
    findAllCats() {
        return this.postsService.findAllCategories();
    }
    @Post('admin/post-categories')
    createCat(
    @Body()
    data: PostCategoryPayload) {
        return this.postsService.createCategory(data);
    }
}
