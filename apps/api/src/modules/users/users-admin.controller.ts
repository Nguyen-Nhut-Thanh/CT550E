import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/auth';
import { AdminAuthGuard } from '../auth/admin.guard';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(AdminAuthGuard)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
    @Req() req: AuthenticatedRequest,
  ) {
    if (id === req.user.sub && status !== 1) {
      throw new BadRequestException('Không thể tự khóa tài khoản của mình.');
    }
    return this.usersService.updateStatus(id, status);
  }

  @Patch(':id/toggle-staff')
  async toggleStaff(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    if (id === req.user.sub) {
      throw new BadRequestException('Không thể tự thay đổi quyền nhân viên của mình.');
    }
    return this.usersService.toggleStaffStatus(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
