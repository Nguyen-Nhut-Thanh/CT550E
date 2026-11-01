import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin.guard";
import { StaffAuthGuard } from '../workforce/staff.guard';
import { WorkforceAccessService } from '../workforce/workforce-access.service';
import { MembershipService } from "./membership.service";
import { VouchersService } from "../vouchers/vouchers.service";

@Controller("admin/membership")
@UseGuards(StaffAuthGuard)
export class MembershipAdminController {
  constructor(
    private readonly service: MembershipService,
    private readonly vouchers: VouchersService,
    private readonly access: WorkforceAccessService,
  ) {}
  @Get()
  @UseGuards(AdminAuthGuard)
  list(@Query("page") rawPage = "1") {
    const page = Number(rawPage);
    if (!Number.isSafeInteger(page) || page < 1)
      throw new BadRequestException("Trang không hợp lệ.");
    return this.service.adminList(page);
  }
  @Patch("settings")
  @UseGuards(AdminAuthGuard)
  settings(@Body("tiers") tiers: unknown) {
    return this.service.updateSettings(tiers);
  }
  @Get("customers/:id")
  async customer(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    await this.access.customer(req.workforce, id);
    return this.service.syncUser(id);
  }
  @Get("customers/:id/vouchers/validate")
  async validate(
    @Param("id", ParseIntPipe) id: number,
    @Query("code") code: string,
    @Query("amount") amount: string,
    @Req() req: any,
  ) {
    await this.access.customer(req.workforce, id);
    await this.service.syncUser(id);
    return this.vouchers.validatePublicVoucher(code, amount, id);
  }
}
