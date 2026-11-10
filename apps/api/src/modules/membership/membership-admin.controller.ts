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
import { MEMBERSHIP_TIERS } from "shared";

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
  list(@Query("page") rawPage = "1", @Query("search") search = "", @Query("tier") tier = "all", @Query("limit") rawLimit = "20") {
    const page = Number(rawPage);
    const limit = Number(rawLimit);
    if (!Number.isSafeInteger(page) || page < 1 || page > 1_000_000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100 || search.length > 200 || (tier !== 'all' && !MEMBERSHIP_TIERS.some(item => item.id === tier)))
      throw new BadRequestException("Bộ lọc hoặc trang không hợp lệ.");
    return this.service.adminList(page, search, tier, limit);
  }
  @Patch("settings")
  @UseGuards(AdminAuthGuard)
  settings(@Body("tiers") tiers: unknown) {
    return this.service.updateSettings(tiers);
  }
  @Get("customers/:id")
  async customer(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    if (!req.workforce.isManager) await this.access.customer(req.workforce, id);
    return this.service.syncUser(id);
  }
  @Get("customers/:id/vouchers/validate")
  async validate(
    @Param("id", ParseIntPipe) id: number,
    @Query("code") code: string,
    @Query("amount") amount: string,
    @Query("tour_id") tourId: string | undefined,
    @Req() req: any,
  ) {
    if (!req.workforce.isManager) await this.access.customer(req.workforce, id);
    await this.service.syncUser(id);
    return this.vouchers.validatePublicVoucher(code, amount, id, tourId ? Number(tourId) : undefined);
  }
}
