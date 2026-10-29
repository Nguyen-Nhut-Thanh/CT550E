import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin.guard";
import { MembershipService } from "./membership.service";
import { VouchersService } from "../vouchers/vouchers.service";

@Controller("admin/membership")
@UseGuards(AdminAuthGuard)
export class MembershipAdminController {
  constructor(
    private readonly service: MembershipService,
    private readonly vouchers: VouchersService,
  ) {}
  @Get()
  list(@Query("page") rawPage = "1") {
    const page = Number(rawPage);
    if (!Number.isSafeInteger(page) || page < 1)
      throw new BadRequestException("Trang không hợp lệ.");
    return this.service.adminList(page);
  }
  @Patch("settings")
  settings(@Body("tiers") tiers: unknown) {
    return this.service.updateSettings(tiers);
  }
  @Get("customers/:id")
  customer(@Param("id", ParseIntPipe) id: number) {
    return this.service.syncUser(id);
  }
  @Get("customers/:id/vouchers/validate")
  async validate(
    @Param("id", ParseIntPipe) id: number,
    @Query("code") code: string,
    @Query("amount") amount: string,
  ) {
    await this.service.syncUser(id);
    return this.vouchers.validatePublicVoucher(code, amount, id);
  }
}
