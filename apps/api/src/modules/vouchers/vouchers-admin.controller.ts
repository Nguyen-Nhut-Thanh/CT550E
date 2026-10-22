import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import type { VoucherPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { VouchersService } from './vouchers.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class VouchersAdminController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('admin/marketing/vouchers')
  async findAll() {
    return this.vouchersService.findAll();
  }

  @Get('admin/marketing/vouchers/:id')
  async findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(Number(id));
  }

  @Post('admin/marketing/vouchers')
  async create(@Body() data: VoucherPayload) {
    return this.vouchersService.create(data);
  }

  @Patch('admin/marketing/vouchers/:id')
  async update(@Param('id') id: string, @Body() data: VoucherPayload) {
    return this.vouchersService.update(Number(id), data);
  }

  @Delete('admin/marketing/vouchers/:id')
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(Number(id));
  }
}
