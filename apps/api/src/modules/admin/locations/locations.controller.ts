import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { memoryStorage } from 'multer';
import { LocationsAdminService } from './locations-admin.service';
import { LocationsPublicService } from '../../locations/locations-public.service';
import { AdminAuthGuard } from '../../auth/admin.guard';
import type { LocationAdminPayload } from './locations.types';

type CloudinaryUploadResult = {
  secure_url: string;
};

@Controller()

@UseGuards(AdminAuthGuard)
export class LocationsController {
  constructor(
    private readonly locationsAdminService: LocationsAdminService,
    private readonly locationsPublicService: LocationsPublicService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/locations')
  async findAll(
    @Query('search') search?: string,
    @Query('level_id') level_id?: string,
  ) {
    return this.locationsAdminService.findAll({ search, level_id });
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/locations/by-level')
  async listByLevel(
    @Query('level_id') level_id: string,
    @Query('parent_id') parent_id?: string,
  ) {
    return this.locationsAdminService.listByLevel(
      Number(level_id),
      parent_id ? Number(parent_id) : undefined,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/locations/levels')
  async listLevels() {
    return this.locationsAdminService.listLevels();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/locations/parents')
  async listParents() {
    return this.locationsAdminService.listParents();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/locations/featured')
  async getFeatured() {
    return this.locationsAdminService.getFeatured();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/locations/:id')
  async findOne(@Param('id') id: string) {
    return this.locationsAdminService.findOne(Number(id));
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/locations')
  async create(@Body() body: LocationAdminPayload) {
    return this.locationsAdminService.create(body);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/locations/:id')
  async update(@Param('id') id: string, @Body() body: LocationAdminPayload) {
    return this.locationsAdminService.update(Number(id), body);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/locations/:id')
  async remove(@Param('id') id: string) {
    return this.locationsAdminService.remove(Number(id));
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/locations/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadLocationImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    try {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'travel_v2/locations',
            resource_type: 'auto',
          },
          (error, uploadResult) => {
            if (error || !uploadResult) return reject(error);
            resolve(uploadResult as CloudinaryUploadResult);
          },
        );
        uploadStream.end(file.buffer);
      });

      return { url: result.secure_url };
    } catch (error) {
      const uploadError = error as Error;
      throw new InternalServerErrorException(
        `Lỗi upload ảnh địa điểm: ${uploadError.message}`,
      );
    }
  }
}
