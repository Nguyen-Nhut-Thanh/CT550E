import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
    @Param('id', ParseIntPipe)
    id: number) {
        return this.toursAdminService.detail(id);
    }
    @Patch('admin/tours/:id')
    update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    body: TourAdminPayload) {
        return this.toursAdminService.update(id, body);
    }
    @Patch('admin/tours/:id/status')
    toggleStatus(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.toursAdminService.toggleStatus(id);
    }
    @Delete('admin/tours/:id')
    deleteTour(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.toursAdminService.deleteTour(id);
    }
}
