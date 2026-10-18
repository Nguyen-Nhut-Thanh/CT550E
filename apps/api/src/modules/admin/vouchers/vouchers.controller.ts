import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { AdminAuthGuard } from '../../auth/admin.guard';
import type { VoucherPayload } from './vouchers.types';

@Controller()

@UseGuards(AdminAuthGuard)
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @UseGuards(AdminAuthGuard)
  @Get('admin/marketing/vouchers')
  async findAll() {
    return this.vouchersService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/marketing/vouchers/:id')
  async findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(Number(id));
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/marketing/vouchers')
  async create(@Body() data: VoucherPayload) {
    return this.vouchersService.create(data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/marketing/vouchers/:id')
  async update(@Param('id') id: string, @Body() data: VoucherPayload) {
    return this.vouchersService.update(Number(id), data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/marketing/vouchers/:id')
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(Number(id));
  }
}
