import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { VouchersAdminController } from './vouchers-admin.controller';
import { VouchersPublicController } from './vouchers-public.controller';
import { VouchersService } from './vouchers.service';

@Module({
  controllers: [VouchersPublicController, VouchersAdminController],
  providers: [PrismaService, VouchersService],
})
export class VouchersModule {}
