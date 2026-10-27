import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import type { AuthRequest, PostAdminQuery, PostCategoryPayload, PostPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { PostsService } from './posts.service';
@Controller()
@UseGuards(AdminAuthGuard)
export class PostsAdminController {
    constructor(private readonly postsService: PostsService, private readonly cloudinary: CloudinaryService) { }
    @Post('admin/posts/upload-image')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_req, file, callback) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.'), false);
            callback(null, true);
        },
    }))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file?.size) throw new BadRequestException('Vui lòng chọn ảnh.');
        try {
            const image = await this.cloudinary.uploadBuffer(file.buffer, { folder: 'JourniTrip/posts', resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1920, height: 1920, crop: 'limit' }] });
            return { url: image.secure_url };
        } catch { throw new InternalServerErrorException('Không thể tải ảnh bài viết. Vui lòng thử lại.'); }
    }
    @Get('admin/posts/layout')
    layout() { return this.postsService.getLayout(); }
    @Patch('admin/posts/layout')
    saveLayout(@Body() body: { slots?: unknown }) { return this.postsService.saveLayout(body.slots); }
    @Get('admin/posts/:id')
    detail(@Param('id') id: string) { return this.postsService.getAdminPost(Number(id)); }
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
