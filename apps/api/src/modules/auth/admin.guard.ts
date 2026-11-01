import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { StaffAuthGuard } from '../workforce/staff.guard';
@Injectable()
export class AdminAuthGuard extends StaffAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authenticated = await super.canActivate(context);
        if (!authenticated)
            return false;
        const request = context.switchToHttp().getRequest();
        if (!request.workforce?.isAdmin) {
            throw new ForbiddenException('Tài khoản không có quyền quản trị.');
        }
        return true;
    }
}
