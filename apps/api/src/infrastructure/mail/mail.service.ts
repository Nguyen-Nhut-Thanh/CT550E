import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { formatCurrency, formatDate, formatDateTime, renderInfoCard, renderLayout } from "./mail.templates";
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
        bookingId: number;
        tourName: string;
        totalAmount: number | string;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `Thanh toán thành công cho booking #${params.bookingId}`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Chúng tôi đã xác nhận khoản thanh toán của bạn.', `
          ${renderInfoCard([
                ['Mã booking', `#${params.bookingId}`],
                ['Tour', params.tourName],
                ['Số tiền', formatCurrency(params.totalAmount)],
                ['Trạng thái', 'Đã thanh toán'],
            ], 'success')}
          <p style="margin: 0;">Travol sẽ tiếp tục cập nhật các thông tin cần thiết cho chuyến đi của bạn.</p>
        `),
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
        refundAmount?: number | null;
    }) {
        const infoLines: Array<[
            string,
            string
        ]> = [
            ['Mã booking', `#${params.bookingId}`],
            ['Tour', params.tourName],
            ['Trạng thái', 'Đã hủy'],
        ];
        if (typeof params.refundAmount === 'number' &&
            Number.isFinite(params.refundAmount)) {
            infoLines.push([
                'Số tiền hoàn dự kiến',
                formatCurrency(params.refundAmount),
            ]);
        }
        await this.sendMail({
            to: params.email,
            subject: `Yêu cầu hủy booking #${params.bookingId} đã được duyệt`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Yêu cầu hủy booking của bạn đã được phê duyệt.', `
          ${renderInfoCard(infoLines, 'neutral')}
          <p style="margin: 0;">${infoLines.length > 3
                ? 'Số tiền hoàn dự kiến đã được ghi nhận ở trên. Khoản hoàn thực tế sẽ được xử lý theo quy trình của Travol.'
                : 'Nếu có khoản hoàn tiền, đội ngũ Travol sẽ liên hệ hoặc cập nhật cho bạn theo chính sách áp dụng.'}</p>
        `),
        });
    }
    async sendCancelRejectedEmail(params: {
        email: string;
        contactName: string;
        bookingId: number;
        tourName: string;
    }) {
        await this.sendMail({
            to: params.email,
            subject: `Yêu cầu hủy booking #${params.bookingId} chưa được chấp nhận`,
            html: renderLayout(`Xin chào ${params.contactName || 'quý khách'},`, 'Hiện tại yêu cầu hủy booking của bạn chưa được phê duyệt.', `
          ${renderInfoCard([
                ['Mã booking', `#${params.bookingId}`],
                ['Tour', params.tourName],
                ['Trạng thái', 'Tiếp tục giữ chỗ'],
            ], 'neutral')}
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
