import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import type { CreateStaffPayload } from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { UsersService } from './users.service';
@Controller('admin/users')
@UseGuards(AdminAuthGuard)
export class UsersAdminController {
    constructor(private readonly usersService: UsersService) { }
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }
    @Get(':id')
    async findOne(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.usersService.findOne(id);
    }
    @Post('staff')
    async createStaff(
    @Body()
    dto: CreateStaffPayload) {
        return this.usersService.createStaff(dto);
    }
    @Patch(':id/status')
    async updateStatus(
    @Param('id', ParseIntPipe)
    id: number,
    @Body('status', ParseIntPipe)
    status: number) {
        return this.usersService.updateStatus(id, status);
    }
    @Patch(':id/toggle-staff')
    async toggleStaff(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.usersService.toggleStaffStatus(id);
    }
    @Delete(':id')
    async deleteUser(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.usersService.deleteUser(id);
    }
}
