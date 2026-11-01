import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards, } from '@nestjs/common';
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
        throw new BadRequestException('Vui lòng tạo nhân viên tại mục Nhân sự & điều hành để chọn vai trò và miền phụ trách.');
    }
    @Patch(':id/status')
    async updateStatus(
    @Param('id', ParseIntPipe)
    id: number,
    @Body('status', ParseIntPipe)
    status: number, @Req() req: any) {
        if (id === req.user.sub && status !== 1) throw new BadRequestException('Không thể tự khóa tài khoản của mình.');
        return this.usersService.updateStatus(id, status);
    }
    @Patch(':id/toggle-staff')
    async toggleStaff(
    @Param('id', ParseIntPipe)
    id: number, @Req() req: any) {
        if (id === req.user.sub) throw new BadRequestException('Không thể tự thay đổi quyền nhân viên của mình.');
        return this.usersService.toggleStaffStatus(id);
    }
    @Delete(':id')
    async deleteUser(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.usersService.deleteUser(id);
    }
}
