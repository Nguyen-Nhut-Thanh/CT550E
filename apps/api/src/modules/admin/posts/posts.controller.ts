import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { AdminAuthGuard } from '../../auth/admin.guard';
import type {
  PostAdminQuery,
  PostCategoryPayload,
  PostPayload,
} from './posts.types';
import type { AuthRequestUser } from 'shared';

type AuthRequest = Request & {
  user: AuthRequestUser;
};

@Controller()

@UseGuards(AdminAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AdminAuthGuard)
  @Get('admin/posts')
  findAllAdmin(@Query() query: PostAdminQuery) {
    return this.postsService.findAllAdmin(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/posts')
  create(@Req() req: AuthRequest, @Body() data: PostPayload) {
    return this.postsService.createPost(req.user.accountId!, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/posts/:id')
  update(@Param('id') id: string, @Body() data: PostPayload) {
    return this.postsService.updatePost(Number(id), data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/posts/:id')
  remove(@Param('id') id: string) {
    return this.postsService.deletePost(Number(id));
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/post-categories')
  findAllCats() {
    return this.postsService.findAllCategories();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/post-categories')
  createCat(@Body() data: PostCategoryPayload) {
    return this.postsService.createCategory(data);
  }
}
