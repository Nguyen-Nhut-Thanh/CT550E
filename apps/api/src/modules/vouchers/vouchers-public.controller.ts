import { Controller, Get, Query } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
@Controller('public/vouchers')
export class VouchersPublicController {
    constructor(private readonly vouchersService: VouchersService) { }
    @Get('validate')
    validate(
    @Query('code')
    code: string,
    @Query('amount')
    rawAmount: string) {
        return this.vouchersService.validatePublicVoucher(code, rawAmount);
    }
}
