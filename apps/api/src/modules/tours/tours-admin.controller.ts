import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { TourAdminPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { ToursAdminService } from './tours-admin.service';
@Controller()
@UseGuards(AdminAuthGuard)
export class ToursAdminController {
    constructor(private readonly toursAdminService: ToursAdminService) { }
    @Get('admin/tours')
    list(
    @Query('search')
    search?: string,
    @Query('status')
    status?: string) {
        return this.toursAdminService.list({ search, status });
    }
    @Post('admin/tours')
    create(
    @Body()
    body: TourAdminPayload) {
        return this.toursAdminService.create(body);
    }
    @Get('admin/tours/:id')
    detail(
    @Param('id')
    id: string) {
        return this.toursAdminService.detail(Number(id));
    }
    @Patch('admin/tours/:id')
    update(
    @Param('id')
    id: string,
    @Body()
    body: TourAdminPayload) {
        return this.toursAdminService.update(Number(id), body);
    }
    @Patch('admin/tours/:id/status')
    toggleStatus(
    @Param('id')
    id: string) {
        return this.toursAdminService.toggleStatus(Number(id));
    }
    @Delete('admin/tours/:id')
    deleteTour(
    @Param('id')
    id: string) {
        return this.toursAdminService.deleteTour(Number(id));
    }
}
