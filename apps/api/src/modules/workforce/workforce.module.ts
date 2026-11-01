import { Global, Module } from '@nestjs/common';
import { WorkforceAccessService } from './workforce-access.service';
import { WorkforceService } from './workforce.service';
import { WorkforceController } from './workforce.controller';

@Global()
@Module({ controllers: [WorkforceController], providers: [WorkforceAccessService, WorkforceService], exports: [WorkforceAccessService, WorkforceService] })
export class WorkforceModule {}
