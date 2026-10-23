import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import type { BookingPayload } from "shared";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { BookingsService } from "./bookings.service";
@UseGuards(JwtAuthGuard)
@Controller("bookings")
export class BookingsController {
    constructor(private readonly service: BookingsService) { }
    @Post()
    create(
    @Body()
    dto: BookingPayload,
    @Req()
    req: any) {
        return this.service.createForAccount(req.user.accountId, dto);
    }
    @Get("my")
    list(
    @Req()
    req: any) {
        return this.service.listForAccount(req.user.accountId);
    }
    @Get("stats")
    stats(
    @Req()
    req: any) {
        return this.service.statsForAccount(req.user.accountId);
    }
    @Post(":id/cancel-request")
    cancel(
    @Param("id", ParseIntPipe)
    id: number,
    @Body()
    dto: {
        reason?: string;
    },
    @Req()
    req: any) {
        return this.service.cancelForAccount(id, req.user.accountId, dto.reason);
    }
    @Get(":id")
    detail(
    @Param("id", ParseIntPipe)
    id: number,
    @Req()
    req: any) {
        return this.service.detailForAccount(id, req.user.accountId);
    }
}
