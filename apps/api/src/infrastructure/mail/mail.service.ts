import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
    formatCurrency,
    formatDate,
    formatDateTime,
    renderInfoCard,
    renderLayout,
    renderReceiptEmailHtml,
    renderRefundStatementEmailHtml,
} from "./mail.templates";
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.MAIL_PORT) || 587,
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    private getSystemEmail() {
        return process.env.MAIL_INTERNAL_EMAIL || process.env.MAIL_USER || '';
    }
    private async sendMail(options: {
        to: string;
        subject: string;
        html: string;
    }) {
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME || 'JourniTrip'}" <${process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER}>`,
            ...options,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`[MAIL] Sent "${options.subject}" to ${options.to}`);
        }
        catch (error) {
            this.logger.error('[MAIL] Send error', error);
        }
    }
    async sendVerificationEmail(email: string, code: string) {
        await this.sendMail({
            to: email,
            subject: 'Xác thực tài khoản JourniTrip',
            html: renderLayout('Xác thực tài khoản', 'Cảm ơn bạn đã đăng ký. Vui lòng nhập mã xác thực bên dưới để hoàn tất tạo tài khoản.', `
          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 16px;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0f172a;">${code}</div>
          </div>
          <p style="margin: 0;">Mã có hiệu lực trong 15 phút. Nếu bạn không thực hiện yêu cầu này, có thể bỏ qua email.</p>
        `),
        });
    }
    async sendBookingCreatedEmail(params: {
        email: string;
        contactName: string;
        bookingId: number;
        tourName: string;
        startDate?: string | Date | null;
        totalAmount: number | string;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `Đã ghi nhận booking #${params.bookingId}`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Booking của bạn đã được tạo thành công và đang chờ thanh toán.', `
          ${renderInfoCard([
                ['Mã booking', `#${params.bookingId}`],
                ['Tour', params.tourName],
                ['Khởi hành', formatDate(params.startDate)],
                ['Tổng thanh toán', formatCurrency(params.totalAmount)],
                ['Trạng thái', 'Chờ thanh toán'],
            ], 'neutral')}
          <p style="margin: 0;">Bạn có thể kiểm tra chi tiết và hoàn tất thanh toán trong mục tài khoản của mình.</p>
        `),
        });
    }
    async sendBookingPaidEmail(params: {
        email: string;
        contactName: string;
        contactPhone?: string;
        bookingId: number;
        tourName: string;
        tourCode?: string;
        startDate?: string | Date | null;
        duration?: string;
        departureName?: string;
        totalAmount: number | string;
        subtotal?: number | string;
        discountAmount?: number | string;
        method?: string;
        transactionCode?: string;
        paidAt?: string | Date | null;
        adultCount?: number;
        adultPrice?: number | string;
        childCount?: number;
        childPrice?: number | string;
        infantCount?: number;
        infantPrice?: number | string;
        voucherCode?: string;
        pickupName?: string;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `[JourniTrip] Biên lai thanh toán booking #${params.bookingId}`,
            html: renderReceiptEmailHtml({
                contactName: params.contactName,
                contactPhone: params.contactPhone,
                contactEmail: params.email,
                bookingId: params.bookingId,
                tourName: params.tourName,
                tourCode: params.tourCode,
                startDate: params.startDate,
                duration: params.duration,
                departureName: params.departureName,
                totalAmount: params.totalAmount,
                subtotal: params.subtotal,
                discountAmount: params.discountAmount,
                method: params.method,
                transactionCode: params.transactionCode,
                paidAt: params.paidAt,
                adultCount: params.adultCount,
                adultPrice: params.adultPrice,
                childCount: params.childCount,
                childPrice: params.childPrice,
                infantCount: params.infantCount,
                infantPrice: params.infantPrice,
                voucherCode: params.voucherCode,
                pickupName: params.pickupName,
            }),
        });
    }
    async sendCancelRequestEmail(params: {
        email: string;
        contactName: string;
        bookingId: number;
        tourName: string;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `Đã nhận yêu cầu hủy booking #${params.bookingId}`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Chúng tôi đã ghi nhận yêu cầu hủy tour của bạn và đang chờ bộ phận vận hành xử lý.', `
          ${renderInfoCard([
                ['Mã booking', `#${params.bookingId}`],
                ['Tour', params.tourName],
                ['Trạng thái', 'Đang chờ xử lý yêu cầu hủy'],
            ], 'warning')}
          <p style="margin: 0;">Kết quả xử lý và thông tin hoàn tiền, nếu có, sẽ được gửi tới bạn trong email tiếp theo.</p>
        `),
        });
    }
    async sendCancelRequestAdminNotification(params: {
        bookingId: number;
        tourName: string;
        contactName: string;
        contactEmail: string;
        contactPhone?: string | null;
        reason?: string;
    }) {
        const systemEmail = this.getSystemEmail();
        if (!systemEmail)
            return;
        await this.sendMail({
            to: systemEmail,
            subject: `Yêu cầu hủy mới cho booking #${params.bookingId}`,
            html: renderLayout('Có yêu cầu hủy booking mới', 'Hệ thống vừa ghi nhận một yêu cầu hủy từ khách hàng. Vui lòng kiểm tra và xử lý sớm.', renderInfoCard([
                ['Mã booking', `#${params.bookingId}`],
                ['Tour', params.tourName],
                ['Khách hàng', params.contactName],
                ['Email', params.contactEmail],
                ['Số điện thoại', params.contactPhone || 'Chưa cập nhật'],
                ['Lý do', params.reason || 'Khách chưa cung cấp lý do'],
            ], 'warning'), 'Email này được gửi tự động để hỗ trợ đội ngũ vận hành theo dõi yêu cầu hủy tour.'),
        });
    }
    async sendCancelApprovedEmail(params: {
        email: string;
        contactName: string;
        bookingId: number;
        tourName: string;
        totalAmount?: number | string;
        refundAmount?: number | null;
        cancellationFee?: number | string;
        reason?: string;
        bankName?: string;
        bankAccountNumber?: string;
        bankAccountName?: string;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `[JourniTrip] Biên nhận xác nhận hủy tour & Quyết toán hoàn tiền #${params.bookingId}`,
            html: renderRefundStatementEmailHtml({
                contactName: params.contactName,
                bookingId: params.bookingId,
                tourName: params.tourName,
                totalAmount: params.totalAmount || params.refundAmount || 0,
                refundAmount: params.refundAmount || 0,
                cancellationFee: params.cancellationFee,
                reason: params.reason,
                bankName: params.bankName,
                bankAccountNumber: params.bankAccountNumber,
                bankAccountName: params.bankAccountName,
            }),
        });
    }
    async sendCancelRejectedEmail(params: {
        email: string;
        contactName: string;
        bookingId: number;
        tourName: string;
        reason?: string;
    }) {
        const infoItems: [string, string][] = [
            ['Mã booking', `#${params.bookingId}`],
            ['Tour', params.tourName],
            ['Trạng thái', 'Tiếp tục giữ chỗ'],
        ];
        if (params.reason) {
            infoItems.push(['Lý do từ chối', params.reason]);
        }
        await this.sendMail({
            to: params.email,
            subject: `Yêu cầu hủy booking #${params.bookingId} chưa được chấp nhận`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Hiện tại yêu cầu hủy booking của bạn chưa được phê duyệt.', `
          ${renderInfoCard(infoItems, 'neutral')}
          <p style="margin: 0;">Nếu cần thêm hỗ trợ, bạn có thể liên hệ bộ phận chăm sóc khách hàng để được hướng dẫn.</p>
        `),
        });
    }
    async sendScheduleUpdatedEmail(params: {
        email: string;
        contactName: string;
        bookingId: number;
        tourName: string;
        oldStartDate?: string | Date | null;
        newStartDate?: string | Date | null;
        oldEndDate?: string | Date | null;
        newEndDate?: string | Date | null;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `Lịch khởi hành booking #${params.bookingId} đã được cập nhật`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Chúng tôi xin thông báo lịch khởi hành của tour bạn đã đặt vừa được điều chỉnh.', `
          ${renderInfoCard([
                ['Mã booking', `#${params.bookingId}`],
                ['Tour', params.tourName],
                ['Khởi hành cũ', formatDateTime(params.oldStartDate)],
                ['Khởi hành mới', formatDateTime(params.newStartDate)],
                ['Kết thúc cũ', formatDateTime(params.oldEndDate)],
                ['Kết thúc mới', formatDateTime(params.newEndDate)],
            ], 'warning')}
          <p style="margin: 0;">Vui lòng kiểm tra lại kế hoạch di chuyển của bạn. Nếu cần hỗ trợ, đội ngũ Travol luôn sẵn sàng hỗ trợ.</p>
        `),
        });
    }
}
