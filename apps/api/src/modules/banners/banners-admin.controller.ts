import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Logger, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { BannerPayload } from 'shared';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { AdminAuthGuard } from '../auth/admin.guard';
import { BannersService } from './banners.service';
@Controller('banners')
@UseGuards(AdminAuthGuard)
export class BannersAdminController {
    private readonly logger = new Logger(BannersAdminController.name);
    constructor(private readonly bannersService: BannersService, private readonly cloudinaryService: CloudinaryService) { }
    @Get('admin')
    async findAll() {
        return this.bannersService.findAll();
    }
    @Get('admin/:id')
    async findOne(
    @Param('id')
    id: string) {
        return this.bannersService.findOne(Number(id));
    }
    @Post('admin')
    async create(
    @Body()
    data: BannerPayload) {
        return this.bannersService.create(data);
    }
    @Patch('admin/:id')
    async update(
    @Param('id')
    id: string,
    @Body()
    data: BannerPayload) {
        return this.bannersService.update(Number(id), data);
    }
    @Delete('admin/:id')
    async remove(
    @Param('id')
    id: string) {
        return this.bannersService.remove(Number(id));
    }
    @Post('admin/upload')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async uploadBanner(
    @UploadedFile()
    file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy file để upload');
        }
        try {
            this.logger.log(`[Upload Banner] Received file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);
            if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY) {
                throw new InternalServerErrorException('Cấu hình Cloudinary bị thiếu trên server');
            }
            const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
                folder: 'travel_v2/banners',
                resource_type: 'auto',
            });
            return { url: result.secure_url };
        }
        catch (error) {
            this.logger.error('[Upload Banner Final Error]', error);
            const uploadError = error as Error;
            const message = uploadError.message || 'Lỗi không xác định';
            throw new InternalServerErrorException(`Lỗi upload: ${message}`);
        }
    }
}
