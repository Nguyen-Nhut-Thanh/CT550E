import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import type { BannerPayload, SeasonalThemeConfig } from 'shared';
import { UseImageUpload } from '../../common/decorators/use-image-upload.decorator';
import { AdminAuthGuard } from '../auth/admin.guard';
import { BannersService } from './banners.service';

@Controller('banners')
@UseGuards(AdminAuthGuard)
export class BannersAdminController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('admin')
  async findAll() {
    return this.bannersService.findAll();
  }

  @Get('admin/seasonal-theme')
  async getSeasonalTheme() {
    return this.bannersService.getSeasonalTheme();
  }

  @Post('admin/seasonal-theme')
  async updateSeasonalTheme(@Body() data: Partial<SeasonalThemeConfig>) {
    return this.bannersService.updateSeasonalTheme(data);
  }

  @Get('admin/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findOne(id);
  }

  @Post('admin')
  async create(@Body() data: BannerPayload) {
    return this.bannersService.create(data);
  }

  @Patch('admin/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: BannerPayload,
  ) {
    return this.bannersService.update(id, data);
  }

  @Delete('admin/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.remove(id);
  }

  @Post('admin/upload')
  @UseImageUpload()
  async uploadBanner(@UploadedFile() file: Express.Multer.File) {
    return this.bannersService.uploadBanner(file);
  }
}
