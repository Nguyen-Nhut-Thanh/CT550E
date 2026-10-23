import { Controller, Get, Header, Query, Res, UseGuards, } from '@nestjs/common';
import type { Response } from 'express';
import { AdminAuthGuard } from '../auth/admin.guard';
import { DashboardService } from './dashboard.service';
@Controller(['admin/dashboard', 'dashboard'])
@UseGuards(AdminAuthGuard)
export class DashboardAdminController {
    constructor(private readonly dashboardService: DashboardService) { }
    @Get('stats')
    async getStats(
    @Query('range')
    range?: string) {
        return this.dashboardService.getStats(range);
    }
    @Get('report')
    async getReport() {
        return this.dashboardService.getReport();
    }
    @Get('export-csv')
    @Header('Content-Type', 'text/csv; charset=utf-8')
    async exportCsv(
    @Res()
    res: Response) {
        const csvData = await this.dashboardService.getReportCsv();
        const filename = `bao-cao-booking-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csvData);
    }
}
