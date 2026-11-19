import { BadRequestException, Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from 'express';
import { JwtAuthGuard, OptionalJwtAuthGuard } from "../auth/jwt.guard";
import { PaymentService } from "./payment.service";
import { resolveClientOrigin } from "../../config/urls";

@Controller("payment")
export class PaymentController {
    constructor(private readonly payment: PaymentService) { }

    @UseGuards(JwtAuthGuard)
    @Post("create-url")
    async create(
        @Body() body: { bookingId: number },
        @Req() req: Request & { user: { accountId: number } }
    ) {
        if (!Number.isSafeInteger(body?.bookingId) || body.bookingId < 1) {
            throw new BadRequestException("Mã đơn không hợp lệ.");
        }
        const clientOrigin = resolveClientOrigin(req);
        return this.payment.createPaymentUrl(
            body.bookingId,
            req.user.accountId,
            req.ip || req.socket.remoteAddress,
            clientOrigin,
        );
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('status')
    status(@Query('reference') reference: string, @Req() req: Request & { user?: { accountId?: number } | null }) {
        return this.payment.getPaymentStatus(reference, req.user?.accountId);
    }

    @Get("vnpay-ipn")
    async ipn(
    @Query()
    query: Record<string, unknown>) { return this.payment.verifyIpn(query); }
    @Get("vnpay-return")
    async result(
    @Query()
    query: Record<string, unknown>,
    @Res()
    response: Response) {
        return response.redirect(await this.payment.handleReturn(query));
    }
}
