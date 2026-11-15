import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import type { PostAdminQuery, PostCategoryPayload, PostPayload } from 'shared';
import type { AuthenticatedRequest } from '../../common/auth';
import { UseImageUpload } from '../../common/decorators/use-image-upload.decorator';
import { uploadToFolder } from '../../common/decorators/use-folder-upload';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { AdminAuthGuard } from '../auth/admin.guard';
import { PostsService } from './posts.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class PostsAdminController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post('admin/posts/upload-image')
  @UseImageUpload()
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return uploadToFolder(this.cloudinary, file, 'JourniTrip/posts');
  }

  @Get('admin/posts/layout')
  layout() {
    return this.postsService.getLayout();
  }

  @Patch('admin/posts/layout')
  saveLayout(@Body() body: { slots?: unknown }) {
    return this.postsService.saveLayout(body.slots);
  }

  @Get('admin/posts/:id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getAdminPost(id);
  }

  @Get('admin/posts')
  findAllAdmin(@Query() query: PostAdminQuery) {
    return this.postsService.findAllAdmin(query);
  }

  @Post('admin/posts')
  create(@Req() req: AuthenticatedRequest, @Body() data: PostPayload) {
    return this.postsService.createPost(req.user.accountId, data);
  }

  @Patch('admin/posts/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: PostPayload,
  ) {
    return this.postsService.updatePost(id, data);
  }

  @Delete('admin/posts/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  @Get('admin/post-categories')
  findAllCats() {
    return this.postsService.findAllCategories();
  }

  @Post('admin/post-categories')
  createCat(@Body() data: PostCategoryPayload) {
    return this.postsService.createCategory(data);
  }
}
