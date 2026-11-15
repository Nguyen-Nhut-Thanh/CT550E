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
  Put,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import type { ScheduleAdminPayload } from 'shared';
import { UseImageUpload } from '../../common/decorators/use-image-upload.decorator';
import { uploadToFolder } from '../../common/decorators/use-folder-upload';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { AdminAuthGuard } from '../auth/admin.guard';
import { SchedulesAdminService } from './schedules-admin.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class SchedulesAdminController {
  constructor(
    private readonly toursAdminService: SchedulesAdminService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('admin/tours/:id/schedule-template')
  getScheduleTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.toursAdminService.getScheduleTemplate(id);
  }

  @Patch('admin/tours/:id/schedule-template')
  saveScheduleTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    return this.toursAdminService.saveScheduleTemplate(id, body);
  }

  @Post('admin/tours/upload-schedule-image')
  @UseImageUpload()
  async uploadScheduleImage(@UploadedFile() file: Express.Multer.File) {
    return uploadToFolder(this.cloudinaryService, file, 'JourniTrip/schedules');
  }

  @Get('admin/tours/schedules/:scheduleId')
  findOneSchedule(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.toursAdminService.findOneSchedule(scheduleId);
  }

  @Post('admin/tours/schedules/:scheduleId/delete')
  deleteSchedule(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.toursAdminService.deleteSchedule(scheduleId);
  }

  @Delete('admin/tours/schedules/:scheduleId')
  deleteScheduleByDelete(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    return this.toursAdminService.deleteSchedule(scheduleId);
  }

  @Patch('admin/tours/schedules/:scheduleId')
  updateSchedule(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() body: ScheduleAdminPayload,
  ) {
    return this.toursAdminService.updateSchedule(scheduleId, body);
  }

  @Get('admin/tours/:id/schedules')
  listSchedules(@Param('id', ParseIntPipe) id: number) {
    return this.toursAdminService.listSchedules(id);
  }

  @Post('admin/tours/:id/schedules')
  createSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ScheduleAdminPayload,
  ) {
    return this.toursAdminService.createSchedule(id, body);
  }

  @Get('admin/schedules/:scheduleId/manifest')
  getScheduleManifest(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.toursAdminService.getScheduleManifest(scheduleId);
  }

  @Get('admin/schedules/:scheduleId/promotion')
  getSchedulePromotion(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    return this.toursAdminService.getSchedulePromotion(scheduleId);
  }

  @Put('admin/schedules/:scheduleId/promotion')
  saveSchedulePromotion(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() body: any,
  ) {
    return this.toursAdminService.saveSchedulePromotion(scheduleId, body);
  }

  @Delete('admin/schedules/:scheduleId/promotion')
  deleteSchedulePromotion(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    return this.toursAdminService.deleteSchedulePromotion(scheduleId);
  }
}
