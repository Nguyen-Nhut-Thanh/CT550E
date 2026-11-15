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
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import type { LocationAdminPayload } from 'shared';
import { UseImageUpload } from '../../common/decorators/use-image-upload.decorator';
import { uploadToFolder } from '../../common/decorators/use-folder-upload';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { AdminAuthGuard } from '../auth/admin.guard';
import { LocationsAdminService } from './locations-admin.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class LocationsAdminController {
  constructor(
    private readonly locationsAdminService: LocationsAdminService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('admin/locations')
  async findAll(
    @Query('search') search?: string,
    @Query('level_id') level_id?: string,
  ) {
    return this.locationsAdminService.findAll({ search, level_id });
  }

  @Get('admin/locations/by-level')
  async listByLevel(
    @Query('level_id', ParseIntPipe) level_id: number,
    @Query('parent_id') parent_id?: string,
  ) {
    return this.locationsAdminService.listByLevel(
      level_id,
      parent_id ? Number(parent_id) : undefined,
    );
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationsAdminService.findOne(id);
  }

  @Post('admin/locations')
  async create(@Body() body: LocationAdminPayload) {
    return this.locationsAdminService.create(body);
  }

  @Patch('admin/locations/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: LocationAdminPayload,
  ) {
    return this.locationsAdminService.update(id, body);
  }

  @Delete('admin/locations/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationsAdminService.remove(id);
  }

  @Post('admin/locations/upload')
  @UseImageUpload()
  async uploadLocationImage(@UploadedFile() file: Express.Multer.File) {
    return uploadToFolder(this.cloudinaryService, file, 'JourniTrip/locations');
  }
}
