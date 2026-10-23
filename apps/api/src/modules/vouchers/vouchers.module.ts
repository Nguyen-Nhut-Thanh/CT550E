import { Module } from '@nestjs/common';
import { VouchersAdminController } from './vouchers-admin.controller';
import { VouchersPublicController } from './vouchers-public.controller';
import { VouchersService } from './vouchers.service';
@Module({
    controllers: [VouchersPublicController, VouchersAdminController],
    providers: [VouchersService],
})
export class VouchersModule {
}
