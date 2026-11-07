import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type { PaymentStatusResponse, PaymentUrlResponse } from 'shared';
import { getAccountUserId } from '../../common/auth/account-user';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { formatVnpayDate, parseVnpayDate, signedVnpayQuery, verifyVnpayQuery, vnpayIp, type VnpayFields, type VnpayQuery } from './vnpay';

type IpnResponse = { RspCode: string; Message: string };
const response = (RspCode: string, Message: string): IpnResponse => ({ RspCode, Message });

function minorUnits(value: Prisma.Decimal | string | number) {
    const amount = new Prisma.Decimal(value);
    const minor = amount.mul(100);
    if (!amount.isFinite() || amount.lte(0) || !minor.isInteger() || minor.gte('1000000000000')) {
        throw new BadRequestException('Số tiền thanh toán VNPay không hợp lệ.');
    }
    return minor.toFixed(0);
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) {}

    private config() {
        const merchant = process.env.VNP_TMN_CODE?.trim();
        const secret = process.env.VNP_HASH_SECRET?.trim();
        if (!merchant || !secret) throw new ServiceUnavailableException('VNPay chưa được cấu hình. Vui lòng thử lại sau.');
        const gateway = process.env.VNP_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const api = (process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/+$/, '');
        const site = process.env.FRONTEND_PUBLIC_URL?.replace(/\/+$/, '');
        const returnUrl = process.env.VNP_RETURN_URL || (site ? `${site}/api/payment/vnpay-return` : `${api}/payment/vnpay-return`);
        const minutes = Number(process.env.VNP_EXPIRE_MINUTES || 15);
        if (![gateway, returnUrl].every(url => /^https?:\/\//.test(url)) || !Number.isInteger(minutes) || minutes < 1 || minutes > 60) {
            throw new ServiceUnavailableException('Cấu hình URL hoặc thời hạn thanh toán VNPay không hợp lệ.');
        }
        return { merchant, secret, gateway, returnUrl, minutes };
    }

    async createPaymentUrl(bookingId: number, accountId: number, ipAddress?: string): Promise<PaymentUrlResponse> {
        if (!Number.isSafeInteger(bookingId) || bookingId < 1) throw new BadRequestException('Mã đơn không hợp lệ.');
        const config = this.config();
        const userId = await getAccountUserId(this.prisma, accountId, 'Không tìm thấy người dùng.');
        const owned = await this.prisma.bookings.findFirst({ where: { booking_id: bookingId, user_id: userId }, select: { booking_id: true } });
        if (!owned) throw new NotFoundException('Không tìm thấy đơn đặt tour.');

        const attempt = await this.prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT booking_id FROM bookings WHERE booking_id = ${bookingId} FOR UPDATE`;
            const booking = await tx.bookings.findUniqueOrThrow({ where: { booking_id: bookingId }, include: { tour_schedules: { select: { start_date: true, status: true } } } });
            if (booking.status !== 'pending') throw new BadRequestException('Đơn đặt tour không ở trạng thái chờ thanh toán.');
            const now = new Date();
            if (booking.tour_schedules.status !== 1 || booking.tour_schedules.start_date <= now) {
                throw new BadRequestException('Đợt khởi hành này không còn nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
            }
            minorUnits(booking.total_amount);
            const review = await tx.payments.findFirst({ where: { booking_id: bookingId, status: 'review' } });
            if (review) throw new BadRequestException('Giao dịch của đơn đang được đối soát. Vui lòng liên hệ hỗ trợ trước khi thanh toán thêm.');
            // Reuse a live attempt so double clicks and multiple tabs do not create new transactions.
            const pending = await tx.payments.findFirst({ where: { booking_id: bookingId, method: 'vnpay', status: 'pending', provider_reference: { not: null }, expires_at: { gt: now } }, orderBy: { payment_id: 'desc' } });
            if (pending && pending.amount.equals(booking.total_amount)) return pending;
            const expiresAt = new Date(Math.min(now.getTime() + config.minutes * 60000, booking.tour_schedules.start_date.getTime()));
            return tx.payments.create({ data: {
                booking_id: bookingId, method: 'vnpay', amount: booking.total_amount, status: 'pending',
                provider_reference: `B${bookingId}${Date.now()}${randomBytes(8).toString('hex')}`,
                created_at: now, expires_at: expiresAt,
            } });
        });
        const { query, signature } = signedVnpayQuery({
            vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: config.merchant,
            vnp_Locale: 'vn', vnp_CurrCode: 'VND', vnp_TxnRef: attempt.provider_reference!,
            vnp_OrderInfo: `Thanh toan tour don hang ${bookingId}`, vnp_OrderType: 'other',
            vnp_Amount: minorUnits(attempt.amount), vnp_ReturnUrl: config.returnUrl,
            vnp_IpAddr: vnpayIp(ipAddress), vnp_CreateDate: formatVnpayDate(attempt.created_at),
            vnp_ExpireDate: formatVnpayDate(attempt.expires_at!),
        }, config.secret);
        return { paymentUrl: `${config.gateway}?${query}&vnp_SecureHash=${signature}`, reference: attempt.provider_reference!, expiresAt: attempt.expires_at!.toISOString() };
    }

    private callback(query: VnpayQuery) {
        const { merchant, secret } = this.config();
        const fields = verifyVnpayQuery(query, secret, merchant);
        if (!fields) return { error: response('97', 'Invalid Checksum') };
        if (!/^[A-Za-z0-9]{1,100}$/.test(fields.vnp_TxnRef || '') || !/^\d{1,12}$/.test(fields.vnp_Amount || '') ||
            !/^\d{2}$/.test(fields.vnp_ResponseCode || '') || !/^\d{2}$/.test(fields.vnp_TransactionStatus || '') ||
            !/^\d{1,15}$/.test(fields.vnp_TransactionNo || '') ||
            (fields.vnp_PayDate && !parseVnpayDate(fields.vnp_PayDate)) ||
            (fields.vnp_CurrCode && fields.vnp_CurrCode !== 'VND')) {
            return { error: response('99', 'Invalid payment data') };
        }
        if (fields.vnp_ResponseCode === '00' && fields.vnp_TransactionStatus === '00' && Number(fields.vnp_TransactionNo) === 0) {
            return { error: response('99', 'Invalid transaction number') };
        }
        return { fields };
    }

    private async processCallback(fields: VnpayFields) {
        const attempt = await this.prisma.payments.findUnique({ where: { provider_reference: fields.vnp_TxnRef }, select: { booking_id: true } });
        if (!attempt) return { result: response('01', 'Order not found') };
        const outcome = await this.prisma.$transaction(async tx => {
            // Serialize callbacks and payment creation against the same booking.
            await tx.$queryRaw`SELECT booking_id FROM bookings WHERE booking_id = ${attempt.booking_id} FOR UPDATE`;
            const current = await tx.payments.findUniqueOrThrow({ where: { provider_reference: fields.vnp_TxnRef }, include: { bookings: { include: { tour_schedules: { include: { tours: { select: { name: true } } } } } } } });
            const booking = current.bookings;
            if (fields.vnp_Amount !== minorUnits(current.amount) || fields.vnp_Amount !== minorUnits(booking.total_amount)) return { result: response('04', 'Invalid Amount') };
            if (['completed', 'review'].includes(current.status)) return { result: response('02', 'Order already confirmed') };
            const successful = fields.vnp_ResponseCode === '00' && fields.vnp_TransactionStatus === '00';
            if (!successful && current.status === 'failed') return { result: response('02', 'Order already confirmed') };
            const transactionCode = fields.vnp_TransactionNo === '0' ? null : fields.vnp_TransactionNo;
            if (fields.vnp_ResponseCode === '07' || fields.vnp_TransactionStatus === '04') {
                await tx.payments.update({ where: { payment_id: current.payment_id }, data: {
                    status: 'review', transaction_code: transactionCode, response_code: fields.vnp_ResponseCode,
                    provider_status: fields.vnp_TransactionStatus,
                } });
                return { result: response('00', 'Payment recorded for review') };
            }
            if (successful) {
                // Keep late/double payments in the ledger for reconciliation without reopening a cancelled booking.
                const payable = booking.status === 'pending';
                await tx.payments.update({ where: { payment_id: current.payment_id }, data: {
                    status: payable || booking.status === 'cancel_requested' ? 'completed' : 'review', transaction_code: transactionCode,
                    response_code: fields.vnp_ResponseCode, provider_status: fields.vnp_TransactionStatus,
                    paid_at: fields.vnp_PayDate ? parseVnpayDate(fields.vnp_PayDate) : new Date(),
                } });
                if (payable) {
                    await tx.bookings.update({ where: { booking_id: booking.booking_id }, data: { status: 'paid' } });
                    return { result: response('00', 'Confirm Success'), notification: {
                        email: booking.contact_email, contactName: booking.contact_name, bookingId: booking.booking_id,
                        tourName: booking.tour_schedules.tours.name, totalAmount: booking.total_amount.toString(),
                    } };
                }
                return { result: response('00', 'Payment recorded for review') };
            }
            await tx.payments.update({ where: { payment_id: current.payment_id }, data: {
                status: 'failed', transaction_code: transactionCode, response_code: fields.vnp_ResponseCode,
                provider_status: fields.vnp_TransactionStatus,
            } });
            return { result: response('00', 'Confirm Success') };
        });
        if ('notification' in outcome && outcome.notification) {
            await this.mailService.sendBookingPaidEmail(outcome.notification).catch(() => this.logger.warn('Thanh toán đã được lưu; không thể gửi email xác nhận.'));
        }
        return outcome;
    }

    async verifyIpn(query: VnpayQuery): Promise<IpnResponse> {
        try {
            const parsed = this.callback(query);
            if (parsed.error) return parsed.error;
            return (await this.processCallback(parsed.fields!)).result;
        } catch {
            this.logger.error('Không thể xử lý IPN VNPay; yêu cầu sẽ được đối tác gửi lại.');
            return response('99', 'Unable to process payment');
        }
    }

    async handleReturn(query: VnpayQuery) {
        const frontend = (process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000').replace(/\/+$/, '');
        const target = new URL(`${frontend}/booking/result`);
        try {
            const parsed = this.callback(query);
            if (parsed.error) { target.searchParams.set('status', 'invalid'); return target.toString(); }
            // The same verified VNPay receipt can arrive via Return or IPN, in either order.
            // Settle it once so a delayed/missing IPN does not leave a completed payment pending.
            const { result } = await this.processCallback(parsed.fields!);
            if (['01', '04', '97', '99'].includes(result.RspCode)) target.searchParams.set('status', 'invalid');
            else target.searchParams.set('reference', parsed.fields!.vnp_TxnRef);
        } catch {
            target.searchParams.set('status', 'unavailable');
        }
        return target.toString();
    }

    async getPaymentStatus(reference: string, accountId: number): Promise<PaymentStatusResponse> {
        if (typeof reference !== 'string' || !/^[A-Za-z0-9]{1,100}$/.test(reference)) throw new BadRequestException('Mã giao dịch không hợp lệ.');
        const userId = await getAccountUserId(this.prisma, accountId, 'Không tìm thấy người dùng.');
        const attempt = await this.prisma.payments.findFirst({ where: { provider_reference: reference, bookings: { user_id: userId } }, include: { bookings: { select: { booking_id: true, status: true } } } });
        if (!attempt) throw new NotFoundException('Không tìm thấy giao dịch của bạn.');
        const status = attempt.status === 'review' ? 'review'
            : attempt.status === 'completed' ? (['paid', 'confirmed', 'completed'].includes(attempt.bookings.status) ? 'success' : 'review')
            : attempt.status === 'failed' ? (attempt.response_code === '24' ? 'cancelled' : 'failed')
            : attempt.expires_at && attempt.expires_at.getTime() <= Date.now() ? 'expired' : 'pending';
        return { bookingId: attempt.booking_id, reference, status, amount: attempt.amount.toString(),
            expiresAt: attempt.expires_at?.toISOString() ?? null, responseCode: attempt.response_code, bookingStatus: attempt.bookings.status };
    }
}
