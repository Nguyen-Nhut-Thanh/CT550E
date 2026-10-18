import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { AdminAuthGuard } from '../../auth/admin.guard';

@Controller(['admin/dashboard', 'dashboard'])
@UseGuards(AdminAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query('range') range?: string) {
    return this.dashboardService.getStats(range);
  }

  @Get('report')
  async getReport() {
    return this.dashboardService.getReport();
  }

  @Get('export-csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Res() res: Response) {
    const csvData = await this.dashboardService.getReportCsv();
    const filename = `bao-cao-booking-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvData);
  }
}
