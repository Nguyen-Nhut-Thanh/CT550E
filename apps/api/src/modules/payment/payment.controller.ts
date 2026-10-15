import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { PaymentService } from "./payment.service";
import { PrismaService } from "../../prisma.service";

@Controller("payment")
export class PaymentController {
  constructor(private readonly payment: PaymentService, private readonly prisma: PrismaService) {}
  @UseGuards(JwtAuthGuard)
  @Post("create-url")
  async create(@Body() body: { bookingId: number }, @Req() req: any) {
    if (!Number.isInteger(body.bookingId) || body.bookingId < 1) throw new BadRequestException("Mã đơn không hợp lệ.");
    const user = await this.prisma.users.findUnique({ where: { account_id: req.user.accountId }, select: { user_id: true } });
    const booking = user && await this.prisma.bookings.findFirst({ where: { booking_id: body.bookingId, user_id: user.user_id } });
    if (!booking) throw new NotFoundException("Không tìm thấy đơn đặt tour.");
    if (booking.status !== "pending") throw new BadRequestException("Đơn đặt tour không ở trạng thái chờ thanh toán.");
    const ip = String(req.ip || req.socket?.remoteAddress || "127.0.0.1").replace("::ffff:", "").replace("::1", "127.0.0.1");
    return this.payment.createPaymentUrl(booking.booking_id, Number(booking.total_amount), ip);
  }
  @Get("vnpay-ipn") async ipn(@Query() query: Record<string, string>) { return this.payment.verifyIpn(query); }
  @Get("vnpay-return") async result(@Query() query: Record<string, string>, @Res() response: any) {
    const result = await this.payment.verifyIpn(query);
    const successful = (result.RspCode === "00" && result.Message === "Confirm Success") || result.RspCode === "02";
    const frontend = (process.env.FRONTEND_PUBLIC_URL || "http://localhost:3000").replace(/\/+$/, "");
    return response.redirect(`${frontend}/booking/result?status=${successful ? "success" : "failed"}&orderId=${encodeURIComponent(String(query.vnp_TxnRef || "").split("_")[0])}`);
  }
}
