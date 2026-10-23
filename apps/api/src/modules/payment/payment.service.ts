import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import * as crypto from "node:crypto";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { MailService } from "../../infrastructure/mail/mail.service";
@Injectable()
export class PaymentService {
    tmnCode = process.env.VNP_TMN_CODE;
    hashSecret = process.env.VNP_HASH_SECRET;
    vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    apiBaseUrl = process.env.API_PUBLIC_URL ||
        process.env.NEXT_PUBLIC_API_BASE ||
        'https://api.nhutthanh.id.vn';
    returnUrl = `${this.apiBaseUrl.replace(/\/+$/, '')}/payment/vnpay-return`;
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) {}
    private sortObject(obj: any) {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
            sorted[key] = obj[key];
        }
        return sorted;
    }
    private createSignedQuery(params: any) {
        const sortedParams = this.sortObject(params);
        const query = Object.keys(sortedParams)
            .map((key: any) => `${encodeURIComponent(key)}=${encodeURIComponent(String(sortedParams[key])).replace(/%20/g, '+')}`)
            .join('&');
        if (!this.hashSecret)
            throw new BadRequestException("Chưa cấu hình VNPay.");
        const hmac = crypto.createHmac('sha512', this.hashSecret);
        const signature = hmac.update(Buffer.from(query, 'utf-8')).digest('hex');
        return { query, signature };
    }
    private async markBookingPaid(orderId: any, transactionCode: any) {
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: orderId },
            include: {
                tour_schedules: {
                    include: {
                        tours: {
                            select: { name: true },
                        },
                    },
                },
            },
        });
        if (!booking) {
            return null;
        }
        if (booking.status === 'paid') {
            return booking;
        }
        const changed = await this.prisma.$transaction(async (tx: any) => {
            const claimed = await tx.bookings.updateMany({ where: { booking_id: orderId, status: "pending" }, data: { status: "paid" } });
            if (claimed.count !== 1)
                return false;
            await tx.payments.create({ data: { booking_id: orderId, amount: booking.total_amount, method: "vnpay", status: "completed", transaction_code: transactionCode } });
            return true;
        });
        if (!changed)
            return booking;
        await this.mailService.sendBookingPaidEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            totalAmount: Number(booking.total_amount),
        }).catch(() => { new Logger("PaymentService").warn("Không thể gửi email thanh toán; thanh toán đã được lưu."); });
        return booking;
    }
    createPaymentUrl(bookingId: any, amount: any, ipAddr: any) {
        if (!this.tmnCode || !this.hashSecret) {
            throw new Error('VNPay configuration is missing in .env file');
        }
        const date = new Date();
        const createDate = date.getFullYear() +
            `0${date.getMonth() + 1}`.slice(-2) +
            `0${date.getDate()}`.slice(-2) +
            `0${date.getHours()}`.slice(-2) +
            `0${date.getMinutes()}`.slice(-2) +
            `0${date.getSeconds()}`.slice(-2);
        const vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: `${bookingId}_${date.getTime()}`,
            vnp_OrderInfo: `Thanh toan don hang ${bookingId}`,
            vnp_OrderType: 'other',
            vnp_Amount: Math.round(amount * 100),
            vnp_ReturnUrl: this.returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };
        const { query, signature } = this.createSignedQuery(vnpParams);
        return {
            paymentUrl: `${this.vnpUrl}?${query}&vnp_SecureHash=${signature}`,
        };
    }
    async verifyIpn(query: any) {
        if (!this.hashSecret) {
            return { RspCode: '99', Message: 'Missing HashSecret' };
        }
        const normalizedQuery = Object.fromEntries(Object.entries(query)
            .filter(([, value]: any) => typeof value === 'string')
            .map(([key, value]: any) => [key, value]));
        const secureHash = normalizedQuery.vnp_SecureHash;
        delete normalizedQuery.vnp_SecureHash;
        delete normalizedQuery.vnp_SecureHashType;
        const { signature } = this.createSignedQuery(normalizedQuery);
        if (secureHash !== signature) {
            return { RspCode: '97', Message: 'Invalid Checksum' };
        }
        const orderId = normalizedQuery.vnp_TxnRef?.split('_')[0];
        const rspCode = normalizedQuery.vnp_ResponseCode;
        if (!orderId) {
            return { RspCode: '01', Message: 'Order not found' };
        }
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: Number(orderId) },
        });
        if (!booking) {
            return { RspCode: '01', Message: 'Order not found' };
        }
        if (Number(normalizedQuery.vnp_Amount) !== Math.round(Number(booking.total_amount) * 100)) {
            return { RspCode: '04', Message: 'Invalid Amount' };
        }
        if (!["pending", "paid"].includes(booking.status))
            return { RspCode: '02', Message: 'Order not payable' };
        if (booking.status === 'paid') {
            return { RspCode: '02', Message: 'Order already confirmed' };
        }
        if (rspCode !== '00') {
            return { RspCode: '00', Message: 'Success' };
        }
        await this.markBookingPaid(Number(orderId), normalizedQuery.vnp_TransactionNo);
        return { RspCode: '00', Message: 'Confirm Success' };
    }
}
