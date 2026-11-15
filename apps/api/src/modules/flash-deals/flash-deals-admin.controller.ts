import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import type { FlashDealPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { FlashDealsService } from './flash-deals.service';
@Controller()
@UseGuards(AdminAuthGuard)
export class FlashDealsAdminController {
    constructor(private readonly flashDealsService: FlashDealsService) { }
    @Get('admin/marketing/flash-deals')
    async findAllAdmin() {
        return this.flashDealsService.findAllAdmin();
    }
    @Post('admin/marketing/flash-deals')
    async create(
    @Body()
    data: FlashDealPayload) {
        return this.flashDealsService.create(data);
    }
    @Patch('admin/marketing/flash-deals/:id')
    async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    data: FlashDealPayload) {
        return this.flashDealsService.update(id, data);
    }
    @Delete('admin/marketing/flash-deals/:id')
    async remove(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.flashDealsService.remove(id);
    }
}
