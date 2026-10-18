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
import { FlashDealsService } from './flash-deals.service';
import { AdminAuthGuard } from '../../auth/admin.guard';
import type { FlashDealPayload } from './flash-deals.types';

@Controller()

@UseGuards(AdminAuthGuard)
export class FlashDealsController {
  constructor(private readonly flashDealsService: FlashDealsService) {}

  @UseGuards(AdminAuthGuard)
  @Get('admin/marketing/flash-deals')
  async findAllAdmin() {
    return this.flashDealsService.findAllAdmin();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/marketing/flash-deals')
  async create(@Body() data: FlashDealPayload) {
    return this.flashDealsService.create(data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/marketing/flash-deals/:id')
  async update(@Param('id') id: string, @Body() data: FlashDealPayload) {
    return this.flashDealsService.update(Number(id), data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/marketing/flash-deals/:id')
  async remove(@Param('id') id: string) {
    return this.flashDealsService.remove(Number(id));
  }
}
