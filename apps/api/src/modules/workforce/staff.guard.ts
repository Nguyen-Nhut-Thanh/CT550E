import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WorkforceAccessService } from './workforce-access.service';

@Injectable()
export class StaffAuthGuard extends JwtAuthGuard {
    constructor(protected readonly access: WorkforceAccessService) { super(); }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authenticated = await super.canActivate(context);
        if (!authenticated) return false;
        const request = context.switchToHttp().getRequest();
        request.workforce = await this.access.actor(request.user.sub, request.user.accountId);
        return true;
    }
}
