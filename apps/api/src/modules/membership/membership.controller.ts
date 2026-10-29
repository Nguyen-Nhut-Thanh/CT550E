import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { MembershipService } from "./membership.service";
import { VouchersService } from "../vouchers/vouchers.service";

@Controller("membership")
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(
    private readonly service: MembershipService,
    private readonly vouchers: VouchersService,
  ) {}
  @Get("me")
  me(@Req() req: any) {
    return this.service.forAccount(req.user.accountId);
  }
  @Post("notifications/read")
  read(@Req() req: any) {
    return this.service.readNotifications(req.user.accountId);
  }
  @Get("vouchers/validate")
  async validate(
    @Req() req: any,
    @Query("code") code: string,
    @Query("amount") rawAmount: string,
  ) {
    const amount = Number(rawAmount);
    if (
      !code?.trim() ||
      !rawAmount?.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    )
      throw new BadRequestException("Mã hoặc giá trị đơn không hợp lệ.");
    await this.service.forAccount(req.user.accountId);
    return this.vouchers.validateForAccount(
      req.user.accountId,
      code,
      rawAmount,
    );
  }
}
