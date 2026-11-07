import { Global, Module } from '@nestjs/common';
import { WorkforceAccessService } from './workforce-access.service';
import { WorkforceService } from './workforce.service';
import { WorkforceController } from './workforce.controller';
import { CrewFinalizationService } from './crew-finalization.service';

@Global()
@Module({ controllers: [WorkforceController], providers: [WorkforceAccessService, WorkforceService, CrewFinalizationService], exports: [WorkforceAccessService, WorkforceService] })
export class WorkforceModule {}
