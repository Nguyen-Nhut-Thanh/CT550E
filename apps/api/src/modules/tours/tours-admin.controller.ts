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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { ScheduleAdminPayload, TourAdminPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ToursAdminService } from './tours-admin.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class ToursAdminController {
  constructor(
    private readonly toursAdminService: ToursAdminService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('admin/tours/upload-schedule-image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadScheduleImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file');
    }

    try {
      const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
        folder: 'travel_v2/schedules',
        resource_type: 'auto',
      });

      return { url: result.secure_url };
    } catch (error) {
      const uploadError = error as Error;
      throw new InternalServerErrorException(
        `Lỗi upload ảnh: ${uploadError.message}`,
      );
    }
  }

  @Get('admin/catalogs/hotels')
  listHotels() {
    return this.toursAdminService.listHotels();
  }

  @Get('admin/catalogs/hotels/:id/room-types')
  listRoomTypes(@Param('id') id: string) {
    return this.toursAdminService.listHotelRoomTypes(Number(id));
  }

  @Get('admin/catalogs/transports')
  listAllTransports() {
    return this.toursAdminService.listAllTransports();
  }

  @Get('admin/transports')
  async listTransportOptions() {
    return { items: await this.toursAdminService.listAllTransports() };
  }

  @Get('admin/tours')
  list(@Query('search') search?: string, @Query('status') status?: string) {
    return this.toursAdminService.list({ search, status });
  }

  @Post('admin/tours')
  create(@Body() body: TourAdminPayload) {
    return this.toursAdminService.create(body);
  }

  @Get('admin/tours/schedules/:scheduleId')
  findOneSchedule(@Param('scheduleId') scheduleId: string) {
    return this.toursAdminService.findOneSchedule(Number(scheduleId));
  }

  @Post('admin/tours/schedules/:scheduleId/delete')
  deleteSchedule(@Param('scheduleId') scheduleId: string) {
    return this.toursAdminService.deleteSchedule(Number(scheduleId));
  }

  @Delete('admin/tours/schedules/:scheduleId')
  deleteScheduleByDelete(@Param('scheduleId') scheduleId: string) {
    return this.toursAdminService.deleteSchedule(Number(scheduleId));
  }

  @Patch('admin/tours/schedules/:scheduleId')
  updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() body: ScheduleAdminPayload,
  ) {
    return this.toursAdminService.updateSchedule(Number(scheduleId), body);
  }

  @Get('admin/tours/:id')
  detail(@Param('id') id: string) {
    return this.toursAdminService.detail(Number(id));
  }

  @Patch('admin/tours/:id')
  update(@Param('id') id: string, @Body() body: TourAdminPayload) {
    return this.toursAdminService.update(Number(id), body);
  }

  @Patch('admin/tours/:id/status')
  toggleStatus(@Param('id') id: string) {
    return this.toursAdminService.toggleStatus(Number(id));
  }

  @Delete('admin/tours/:id')
  deleteTour(@Param('id') id: string) {
    return this.toursAdminService.deleteTour(Number(id));
  }

  @Get('admin/tours/:id/schedules')
  listSchedules(@Param('id') id: string) {
    return this.toursAdminService.listSchedules(Number(id));
  }

  @Post('admin/tours/:id/schedules')
  createSchedule(@Param('id') id: string, @Body() body: ScheduleAdminPayload) {
    return this.toursAdminService.createSchedule(Number(id), body);
  }
}
