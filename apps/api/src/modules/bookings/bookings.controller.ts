import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { BookingsService } from "./bookings.service";
import { BOOKING_EXTRAS } from "./booking-extras";
import type { BookingPayload } from "shared";
import { PrismaService } from "../../prisma.service";

@Controller("public/vouchers")
export class BookingVoucherController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("validate") async validate(@Query("code") code: string, @Query("amount") rawAmount: string) {
    const amount = Number(rawAmount);
    if (!code?.trim() || !Number.isFinite(amount) || amount < 0) throw new BadRequestException("Mã giảm giá hoặc giá trị đơn không hợp lệ.");
    const voucher = await this.prisma.vouchers.findFirst({ where: { code: code.trim(), status: 1, start_date: { lte: new Date() }, expiry_date: { gte: new Date() } } });
    if (!voucher || voucher.used_count >= voucher.usage_limit || amount < Number(voucher.min_order_value)) throw new BadRequestException("Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện áp dụng.");
    let discount = voucher.discount_type === "percentage" ? amount * Number(voucher.discount_value) / 100 : Number(voucher.discount_value);
    if (voucher.discount_type === "percentage" && voucher.max_discount_amount != null) discount = Math.min(discount, Number(voucher.max_discount_amount));
    discount = Math.min(Math.max(discount, 0), amount);
    return { voucher_id: voucher.voucher_id, code: voucher.code, discount_amount: discount, final_amount: amount - discount };
  }
}

@Controller("public/booking-services")
export class BookingServicesController {
  @Get() list() { return BOOKING_EXTRAS; }
}

@UseGuards(JwtAuthGuard)
@Controller("bookings")
export class BookingsController {
  constructor(private readonly service: BookingsService) {}
  @Post() create(@Body() dto: BookingPayload, @Req() req: any) {
    return this.service.createForAccount(req.user.accountId, dto);
  }
  @Get("my") list(@Req() req: any) { return this.service.listForAccount(req.user.accountId); }
  @Get("stats") stats(@Req() req: any) { return this.service.statsForAccount(req.user.accountId); }
  @Get("admin/list") adminList(@Req() req: any, @Query("page") page?: string, @Query("limit") limit?: string) {
    return this.service.listAdminBookings(Boolean(req.user.isStaff), Number(page || 1), Number(limit || 10));
  }
  @Get("admin/:id") adminDetail(@Param("id", ParseIntPipe) id: number, @Req() req: any) { return this.service.getAdminBookingDetail(id, Boolean(req.user.isStaff)); }
  @Post(":id/cancel-request") cancel(@Param("id", ParseIntPipe) id: number, @Body() dto: { reason?: string }, @Req() req: any) {
    return this.service.cancelForAccount(id, req.user.accountId, dto.reason);
  }
  @Post("admin/:id/approve-cancel") approve(@Param("id", ParseIntPipe) id: number, @Body() dto: { note?: string; refundAmount?: number }, @Req() req: any) {
    return this.service.approveCancel(id, Boolean(req.user.isStaff), dto.note, dto.refundAmount);
  }
  @Post("admin/:id/reject-cancel") reject(@Param("id", ParseIntPipe) id: number, @Body() dto: { note?: string }, @Req() req: any) {
    return this.service.rejectCancel(id, Boolean(req.user.isStaff), dto.note);
  }
  @Get(":id") detail(@Param("id", ParseIntPipe) id: number, @Req() req: any) { return this.service.detailForAccount(id, req.user.accountId); }
}
