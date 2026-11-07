import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { StaffAuthGuard } from '../workforce/staff.guard';
import { ADMIN_CONTENT_DENIED, canAccessAdminContent } from 'shared';
@Injectable()
export class AdminAuthGuard extends StaffAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authenticated = await super.canActivate(context);
        if (!authenticated)
            return false;
        const request = context.switchToHttp().getRequest();
        if (!canAccessAdminContent(request.workforce, request.method || '')) {
            throw new ForbiddenException(ADMIN_CONTENT_DENIED);
        }
        return true;
    }
}
