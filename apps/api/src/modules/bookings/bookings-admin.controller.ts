import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, } from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin.guard";
import { StaffAuthGuard } from '../workforce/staff.guard';
import { WorkforceAccessService } from '../workforce/workforce-access.service';
import { BookingsAdminService } from "./bookings-admin.service";
import { BookingsService } from "./bookings.service";
import type { BookingPayload, AdminBookingFilters } from "shared";
@Controller("bookings")
@UseGuards(StaffAuthGuard)
export class BookingsAdminController {
    constructor(private readonly service: BookingsAdminService, private readonly bookings: BookingsService, private readonly access: WorkforceAccessService) { }
    @Get("admin/customer/:id")
    async customer(@Param("id", ParseIntPipe) id: number, @Req() req: any) { await this.access.customer(req.workforce, id); return this.bookings.customerForStaff(id); }
    @Post("admin/customer/:id")
    async createForCustomer(@Param("id", ParseIntPipe) id: number, @Body() body: BookingPayload, @Req() req: any) {
        await this.access.customer(req.workforce, id);
        return this.bookings.createForCustomer(id, body);
    }
    @Get("admin/list")
    @UseGuards(AdminAuthGuard)
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
    @UseGuards(AdminAuthGuard)
    adminDetail(
    @Param("id", ParseIntPipe)
    id: number,
    @Req()
    req: any) {
        return this.service.getAdminBookingDetail(id, Boolean(req.user.isStaff));
    }
    @Post("admin/:id/approve-cancel")
    @UseGuards(AdminAuthGuard)
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
    @UseGuards(AdminAuthGuard)
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
