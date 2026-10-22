import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DashboardAdminController } from './dashboard-admin.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardAdminController],
  providers: [PrismaService, DashboardService],
})
export class DashboardModule {}
