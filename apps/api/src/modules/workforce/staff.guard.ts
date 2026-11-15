import { ExecutionContext, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WorkforceAccessService } from './workforce-access.service';

@Injectable()
export class StaffAuthGuard extends JwtAuthGuard {
  constructor(
    @Optional() protected access?: WorkforceAccessService,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) return false;
    const request = context.switchToHttp().getRequest();
    const accessService =
      this.access ||
      this.moduleRef?.get(WorkforceAccessService, { strict: false });
    if (accessService) {
      request.workforce = await accessService.actor(
        request.user.sub,
        request.user.accountId,
      );
    }
    return true;
  }
}
