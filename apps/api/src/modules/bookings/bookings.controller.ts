import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { BookingPayload } from "shared";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { BookingsService } from "./bookings.service";

@Controller("public/booking-services")
export class BookingServicesController {
  constructor(private readonly service: BookingsService) {}

  @Get() list() {
    return this.service.getExtraServices();
  }
}

@UseGuards(JwtAuthGuard)
@Controller("bookings")
export class BookingsController {
  constructor(private readonly service: BookingsService) {}
  @Post() create(@Body() dto: BookingPayload, @Req() req: any) {
    return this.service.createForAccount(req.user.accountId, dto);
  }
  @Get("my") list(@Req() req: any) {
    return this.service.listForAccount(req.user.accountId);
  }
  @Get("stats") stats(@Req() req: any) {
    return this.service.statsForAccount(req.user.accountId);
  }
  @Get("admin/list") adminList(
    @Req() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.listAdminBookings(
      Boolean(req.user.isStaff),
      Number(page || 1),
      Number(limit || 10),
    );
  }
  @Get("admin/:id") adminDetail(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.service.getAdminBookingDetail(id, Boolean(req.user.isStaff));
  }
  @Post(":id/cancel-request") cancel(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: { reason?: string },
    @Req() req: any,
  ) {
    return this.service.cancelForAccount(id, req.user.accountId, dto.reason);
  }
  @Post("admin/:id/approve-cancel") approve(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: { note?: string; refundAmount?: number },
    @Req() req: any,
  ) {
    return this.service.approveCancel(
      id,
      Boolean(req.user.isStaff),
      dto.note,
      dto.refundAmount,
    );
  }
  @Post("admin/:id/reject-cancel") reject(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: { note?: string },
    @Req() req: any,
  ) {
    return this.service.rejectCancel(id, Boolean(req.user.isStaff), dto.note);
  }
  @Get(":id") detail(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    return this.service.detailForAccount(id, req.user.accountId);
  }
}
