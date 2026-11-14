import type { Prisma, PrismaClient } from '@prisma/client';
import { formatCurrency } from './booking.helpers';

export type BookingNotificationType =
    | 'created'
    | 'paid'
    | 'timeout_cancelled'
    | 'departed_cancelled'
    | 'cancel_requested'
    | 'cancel_approved'
    | 'cancel_rejected'
    | 'admin_cancelled'
    | 'staff_cancelled_pending'
    | 'rescheduled';

export interface BookingNotificationParams {
    type: BookingNotificationType;
    userId: number;
    bookingId: number;
    tourName: string;
    totalAmount?: number | string;
    refundAmount?: number | string;
    reason?: string;
    note?: string;
    startDate?: string | Date;
}

export function buildBookingNotificationContent(params: BookingNotificationParams): {
    title: string;
    message: string;
    eventKey: string;
} {
    const { type, bookingId, tourName, totalAmount, refundAmount, reason, note } = params;

    switch (type) {
        case 'created':
            return {
                title: `Đặt tour thành công (Chờ thanh toán 15 phút)`,
                message: `Bạn vừa đặt thành công tour "${tourName}". Đơn hàng #${bookingId} đang được giữ chỗ trong 15 phút. Vui lòng hoàn tất thanh toán trước khi hết thời gian giữ chỗ.`,
                eventKey: `booking:created:${bookingId}`,
            };

        case 'paid':
            return {
                title: `Thanh toán thành công tour #${bookingId}`,
                message: `Đơn đặt tour "${tourName}" (#${bookingId}) đã được thanh toán thành công với số tiền ${formatCurrency(totalAmount || 0)}đ. Chúc bạn có một chuyến đi tuyệt vời và an toàn!`,
                eventKey: `booking:paid:${bookingId}`,
            };

        case 'timeout_cancelled':
            return {
                title: `Đơn đặt tour #${bookingId} đã hết hạn thanh toán`,
                message: `Đơn đặt tour "${tourName}" (#${bookingId}) đã tự động hủy do quá thời hạn thanh toán 15 phút. Bạn có thể đặt lại tour bất cứ lúc nào khi sẵn sàng.`,
                eventKey: `booking:timeout_cancelled:${bookingId}`,
            };

        case 'departed_cancelled':
            return {
                title: `Đơn đặt tour #${bookingId} đã bị hủy do đến ngày đi`,
                message: `Đơn đặt tour "${tourName}" (#${bookingId}) đã tự động hủy do đợt khởi hành đã đến ngày đi mà đơn chưa hoàn tất thanh toán.`,
                eventKey: `booking:departed_cancelled:${bookingId}`,
            };

        case 'cancel_requested':
            return {
                title: `Đã tiếp nhận yêu cầu hủy tour #${bookingId}`,
                message: `Yêu cầu hủy tour "${tourName}" (#${bookingId}) của bạn${reason ? ` với lý do "${reason}"` : ''} đã được tiếp nhận. Ban quản trị sẽ đối soát và xử lý hoàn tiền theo quy định trong 24 - 48 giờ làm việc.`,
                eventKey: `booking:cancel_requested:${bookingId}`,
            };

        case 'cancel_approved':
            return {
                title: `Yêu cầu hủy tour #${bookingId} đã được phê duyệt`,
                message: `Ban quản trị đã phê duyệt yêu cầu hủy tour "${tourName}" (#${bookingId}).${refundAmount ? ` Số tiền hoàn: ${formatCurrency(refundAmount)}đ.` : ''}${note ? ` Ghi chú: ${note}.` : ''} Tiền sẽ được chuyển khoản về tài khoản ngân hàng của bạn.`,
                eventKey: `booking:cancel_approved:${bookingId}`,
            };

        case 'cancel_rejected':
            return {
                title: `Yêu cầu hủy tour #${bookingId} không được chấp thuận`,
                message: `Yêu cầu hủy tour "${tourName}" (#${bookingId}) của bạn không được phê duyệt.${note ? ` Lý do: ${note}.` : ''} Vui lòng liên hệ bộ phận hỗ trợ khách hàng để được hướng dẫn thêm.`,
                eventKey: `booking:cancel_rejected:${bookingId}`,
            };

        case 'admin_cancelled':
            return {
                title: `Đơn đặt tour #${bookingId} đã bị hủy bởi Ban quản trị`,
                message: `Ban quản trị đã hủy đơn đặt tour "${tourName}" (#${bookingId}).${reason ? ` Lý do: ${reason}.` : ''}${refundAmount ? ` Số tiền hoàn: ${formatCurrency(refundAmount)}đ.` : ''}${note ? ` Ghi chú: ${note}.` : ''}`,
                eventKey: `booking:admin_cancelled:${bookingId}`,
            };

        case 'staff_cancelled_pending':
            return {
                title: `Đơn giữ chỗ #${bookingId} đã bị hủy`,
                message: `Đơn giữ chỗ tour "${tourName}" (#${bookingId}) đã bị hủy bởi nhân viên điều hành.${reason ? ` Lý do: ${reason}.` : ''}`,
                eventKey: `booking:staff_cancelled_pending:${bookingId}`,
            };

        case 'rescheduled':
            return {
                title: `Lịch khởi hành tour #${bookingId} đã được dời lịch`,
                message: `Đơn đặt tour "${tourName}" (#${bookingId}) đã được ban quản trị hỗ trợ dời sang đợt khởi hành mới.${note ? ` Chi tiết: ${note}.` : ''} Quý khách có thể kiểm tra vé và lịch trình mới tại mục Chi tiết booking.`,
                eventKey: `booking:rescheduled:${bookingId}:${Date.now()}`,
            };

        default:
            return {
                title: `Cập nhật đơn đặt tour #${bookingId}`,
                message: `Đơn đặt tour "${tourName}" (#${bookingId}) đã có cập nhật mới từ hệ thống.`,
                eventKey: `booking:update:${bookingId}:${Date.now()}`,
            };
    }
}

/**
 * Gửi thông báo chuyến đi vào bảng membership_notifications của khách hàng
 * Sử dụng upsert theo event_key để đảm bảo an toàn, không sinh lỗi trùng lặp
 */
export async function sendBookingNotification(
    prismaClient: Prisma.TransactionClient | PrismaClient,
    params: BookingNotificationParams,
): Promise<void> {
    try {
        if (!params.userId || !params.bookingId) return;

        const { title, message, eventKey } = buildBookingNotificationContent(params);

        await (prismaClient as any).membership_notifications.upsert({
            where: { event_key: eventKey },
            create: {
                user_id: params.userId,
                booking_id: params.bookingId,
                event_key: eventKey,
                title,
                message,
            },
            update: {
                title,
                message,
            },
        });
    } catch (error) {
        // Ghi log nhẹ và không làm gián đoạn transaction chính
        console.warn(`[BookingNotification] Không thể gửi thông báo booking #${params.bookingId}:`, error instanceof Error ? error.message : error);
    }
}

