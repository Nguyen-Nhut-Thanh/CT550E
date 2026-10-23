import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { LocationAdminPayload } from 'shared';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { AdminAuthGuard } from '../auth/admin.guard';
import { LocationsAdminService } from './locations-admin.service';
@Controller()
@UseGuards(AdminAuthGuard)
export class LocationsAdminController {
    constructor(private readonly locationsAdminService: LocationsAdminService, private readonly cloudinaryService: CloudinaryService) { }
    @Get('admin/locations')
    async findAll(
    @Query('search')
    search?: string,
    @Query('level_id')
    level_id?: string) {
        return this.locationsAdminService.findAll({ search, level_id });
    }
    @Get('admin/locations/by-level')
    async listByLevel(
    @Query('level_id')
    level_id: string,
    @Query('parent_id')
    parent_id?: string) {
        return this.locationsAdminService.listByLevel(Number(level_id), parent_id ? Number(parent_id) : undefined);
    }
    @Get('admin/locations/levels')
    async listLevels() {
        return this.locationsAdminService.listLevels();
    }
    @Get('admin/locations/parents')
    async listParents() {
        return this.locationsAdminService.listParents();
    }
    @Get('admin/locations/featured')
    async getFeatured() {
        return this.locationsAdminService.getFeatured();
    }
    @Get('admin/locations/:id')
    async findOne(
    @Param('id')
    id: string) {
        return this.locationsAdminService.findOne(Number(id));
    }
    @Post('admin/locations')
    async create(
    @Body()
    body: LocationAdminPayload) {
        return this.locationsAdminService.create(body);
    }
    @Patch('admin/locations/:id')
    async update(
    @Param('id')
    id: string,
    @Body()
    body: LocationAdminPayload) {
        return this.locationsAdminService.update(Number(id), body);
    }
    @Delete('admin/locations/:id')
    async remove(
    @Param('id')
    id: string) {
        return this.locationsAdminService.remove(Number(id));
    }
    @Post('admin/locations/upload')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async uploadLocationImage(
    @UploadedFile()
    file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy file để upload');
        }
        try {
            const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
                folder: 'travel_v2/locations',
                resource_type: 'auto',
            });
            return { url: result.secure_url };
        }
        catch (error) {
            const uploadError = error as Error;
            throw new InternalServerErrorException(`Lỗi upload ảnh địa điểm: ${uploadError.message}`);
        }
    }
}
