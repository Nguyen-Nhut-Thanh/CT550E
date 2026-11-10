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

    @Get('analytics')
    async getComprehensiveAnalytics(
        @Query('range') range?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.dashboardService.getComprehensiveAnalytics(range, from, to);
    }

    @Get('export-excel')
    async exportExcel(
        @Query('range') range: string | undefined,
        @Query('from') from: string | undefined,
        @Query('to') to: string | undefined,
        @Res() res: Response,
    ) {
        const xmlData = await this.dashboardService.getComprehensiveExcel(range, from, to);
        const filename = `bao-cao-thong-ke-toan-dien-${new Date().toISOString().split('T')[0]}.xls`;
        res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(xmlData);
    }

    @Get('export-section-csv')
    @Header('Content-Type', 'text/csv; charset=utf-8')
    async exportSectionCsv(
        @Query('section') section: string,
        @Query('range') range: string | undefined,
        @Query('from') from: string | undefined,
        @Query('to') to: string | undefined,
        @Res() res: Response,
    ) {
        const csvData = await this.dashboardService.getSectionCsv(section, range, from, to);
        const filename = `bao-cao-${section || 'du-lieu'}-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csvData);
    }
}
