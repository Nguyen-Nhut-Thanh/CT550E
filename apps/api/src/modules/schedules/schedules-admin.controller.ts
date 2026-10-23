import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { ScheduleAdminPayload } from 'shared';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { AdminAuthGuard } from '../auth/admin.guard';
import { SchedulesAdminService } from "./schedules-admin.service";
@Controller()
@UseGuards(AdminAuthGuard)
export class SchedulesAdminController {
    constructor(private readonly toursAdminService: SchedulesAdminService, private readonly cloudinaryService: CloudinaryService) { }
    @Post('admin/tours/upload-schedule-image')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async uploadScheduleImage(
    @UploadedFile()
    file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy file');
        }
        try {
            const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
                folder: 'travel_v2/schedules',
                resource_type: 'auto',
            });
            return { url: result.secure_url };
        }
        catch (error) {
            const uploadError = error as Error;
            throw new InternalServerErrorException(`Lỗi upload ảnh: ${uploadError.message}`);
        }
    }
    @Get('admin/tours/schedules/:scheduleId')
    findOneSchedule(
    @Param('scheduleId')
    scheduleId: string) {
        return this.toursAdminService.findOneSchedule(Number(scheduleId));
    }
    @Post('admin/tours/schedules/:scheduleId/delete')
    deleteSchedule(
    @Param('scheduleId')
    scheduleId: string) {
        return this.toursAdminService.deleteSchedule(Number(scheduleId));
    }
    @Delete('admin/tours/schedules/:scheduleId')
    deleteScheduleByDelete(
    @Param('scheduleId')
    scheduleId: string) {
        return this.toursAdminService.deleteSchedule(Number(scheduleId));
    }
    @Patch('admin/tours/schedules/:scheduleId')
    updateSchedule(
    @Param('scheduleId')
    scheduleId: string,
    @Body()
    body: ScheduleAdminPayload) {
        return this.toursAdminService.updateSchedule(Number(scheduleId), body);
    }
    @Get('admin/tours/:id/schedules')
    listSchedules(
    @Param('id')
    id: string) {
        return this.toursAdminService.listSchedules(Number(id));
    }
    @Post('admin/tours/:id/schedules')
    createSchedule(
    @Param('id')
    id: string,
    @Body()
    body: ScheduleAdminPayload) {
        return this.toursAdminService.createSchedule(Number(id), body);
    }
}
