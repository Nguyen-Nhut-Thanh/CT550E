import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, } from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin.guard";
import { BookingsAdminService } from "./bookings-admin.service";
import { BookingsService } from "./bookings.service";
import type { BookingPayload, AdminBookingFilters } from "shared";
@Controller("bookings")
@UseGuards(AdminAuthGuard)
export class BookingsAdminController {
    constructor(private readonly service: BookingsAdminService, private readonly bookings: BookingsService) { }
    @Get("admin/customer/:id")
    customer(@Param("id", ParseIntPipe) id: number) { return this.bookings.customerForStaff(id); }
    @Post("admin/customer/:id")
    createForCustomer(@Param("id", ParseIntPipe) id: number, @Body() body: BookingPayload) {
        return this.bookings.createForCustomer(id, body);
    }
    @Get("admin/list")
    adminList(
    @Req()
    req: any,
    @Query("page")
    page?: string,
    @Query("limit")
    limit?: string,
    @Query() filters?: AdminBookingFilters) {
        return this.service.listAdminBookings(Boolean(req.user.isStaff), Number(page || 1), Number(limit || 10), filters);
    }
    @Get("admin/:id")
    adminDetail(
    @Param("id", ParseIntPipe)
    id: number,
    @Req()
    req: any) {
        return this.service.getAdminBookingDetail(id, Boolean(req.user.isStaff));
    }
    @Post("admin/:id/approve-cancel")
    approve(
    @Param("id", ParseIntPipe)
    id: number,
    @Body()
    dto: {
        note?: string;
        refundAmount?: number;
    },
    @Req()
    req: any) {
        return this.service.approveCancel(id, Boolean(req.user.isStaff), dto.note, dto.refundAmount);
    }
    @Post("admin/:id/reject-cancel")
    reject(
    @Param("id", ParseIntPipe)
    id: number,
    @Body()
    dto: {
        note?: string;
    },
    @Req()
    req: any) {
        return this.service.rejectCancel(id, Boolean(req.user.isStaff), dto.note);
    }
}
