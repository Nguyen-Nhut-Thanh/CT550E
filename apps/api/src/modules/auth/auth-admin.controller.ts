import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { AdminLoginPayload, AuthRequest } from 'shared';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from './auth.service';
@Controller()
export class AuthAdminController {
    constructor(private readonly authService: AuthService) { }
    @Post('admin/auth/login')
    async adminLogin(
    @Body()
    body: AdminLoginPayload) {
        return this.authService.adminLogin(body.email, body.password);
    }
    @UseGuards(JwtAuthGuard)
    @Get('admin/auth/me')
    async adminMe(
    @Req()
    req: AuthRequest) {
        if (!req.user.isStaff) {
            throw new ForbiddenException('Bạn không có quyền quản trị');
        }
        const user = await this.authService.getMe(req.user.sub);
        if (!user || !user.is_staff) {
            throw new ForbiddenException('Quyền quản trị đã bị thu hồi');
        }
        return { user };
    }
}
