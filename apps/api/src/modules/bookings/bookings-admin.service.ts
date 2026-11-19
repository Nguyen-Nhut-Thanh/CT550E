import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { MailService } from "../../infrastructure/mail/mail.service";
import {
  buildBookingListWhere,
  formatCurrency,
  mergeBookingNote,
  resolveRollbackStatus,
  sendBookingNotification,
} from "./helpers";
import type { AdminBookingFilters, BookingCancellationMeta } from "shared";
import { BookingsService } from "./bookings.service";
@Injectable()
export class BookingsAdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
        private readonly bookingsService: BookingsService,
    ) { }
    adminBookingInclude = {
        users: {
            select: {
                full_name: true,
                phone: true,
                accounts: {
                    select: {
                        email: true,
                    },
                },
            },
        },
        tour_schedules: {
            include: {
                departure_location: true,
                tours: {
                    include: {
                        tour_images: { where: { is_cover: 1 }, take: 1 },
                        departure_locations: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        },
        booking_travelers: true,
        payments: true,
        vouchers: true,
    };
    ensureStaffAccess(isStaff: any) {
        if (!isStaff) {
            throw new ForbiddenException('Bạn không có quyền truy cập.');
        }
    }
    async findAdminBookingOrThrow(bookingId: any) {
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: bookingId },
            include: this.adminBookingInclude,
        });
        if (!booking) {
            throw new NotFoundException('Không tìm thấy booking.');
        }
        return booking;
    }
    async findBookingForCancelActionOrThrow(bookingId: any) {
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: bookingId },
            include: {
                payments: {
                    where: { status: { in: ['completed', 'review'] } },
                    orderBy: { payment_id: 'desc' },
                    take: 1,
                },
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
            throw new NotFoundException('Không tìm thấy booking.');
        }
        return booking;
    }
    async getAdminBookingDetail(bookingId: any, isStaff: any) {
        this.ensureStaffAccess(isStaff);
        return this.findAdminBookingOrThrow(bookingId);
    }
    async listAdminBookings(isStaff: any, page: number = 1, limit: number = 10, filters: AdminBookingFilters = {}) {
        this.ensureStaffAccess(isStaff);
        await this.bookingsService.cancelExpiredPendingBookings();
        if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new BadRequestException('Phân trang không hợp lệ.');
        const where = buildBookingListWhere(filters);
        const skip = (page - 1) * limit;
        const [items, total, groups] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                skip,
                take: limit,
                include: {
                    users: {
                        select: {
                            full_name: true,
                        },
                    },
                    tour_schedules: {
                        include: {
                            tours: {
                                select: {
                                    name: true,
                                    code: true,
                                    tour_id: true,
                                    tour_images: { orderBy: { sort_order: 'asc' }, take: 1, select: { image_url: true } },
                                },
                            },
                        },
                    },
                    payments: true,
                },
                orderBy: [{ created_at: 'desc' }, { booking_id: 'desc' }],
            }),
            this.prisma.bookings.count({ where }),
            this.prisma.bookings.groupBy({ by: ['status'], _count: { _all: true } }),
        ]);
        const count = (status: string) => groups.find(group => group.status === status)?._count._all ?? 0;
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            stats: { total: groups.reduce((sum, group) => sum + group._count._all, 0), paid: count('paid'), pending: count('pending'), cancelled: count('cancelled'), cancelRequested: count('cancel_requested') },
        };
    }
    async approveCancel(bookingId: any, isStaff: any, note: any, refundAmount: any) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.findBookingForCancelActionOrThrow(bookingId);
        if (booking.status !== 'cancel_requested') {
            throw new BadRequestException('Booking này không ở trạng thái yêu cầu hủy.');
        }
        if (booking.tour_schedules?.start_date && new Date(booking.tour_schedules.start_date).getTime() <= Date.now()) {
            throw new BadRequestException('Chuyến đi đã hoặc đang trong thời gian khởi hành, không thể duyệt hủy đơn.');
        }
        const totalGuests = booking.adult_count + booking.child_count + booking.infant_count;
        const adminNote = note?.trim();
        const normalizedRefundAmount = typeof refundAmount === 'number' && Number.isFinite(refundAmount)
            ? Math.max(refundAmount, 0)
            : null;
        const updated = await this.prisma.$transaction(async (tx: any) => {
            const existingMeta = (booking.cancellation_meta as BookingCancellationMeta) || {};
            const cancellationMeta: BookingCancellationMeta = {
                ...existingMeta,
                type: 'customer_request_approved',
                actor: 'Khách hàng',
                title: 'Hủy theo yêu cầu của khách hàng (Ban quản trị đã duyệt)',
                reason: existingMeta.cancelRequest?.reason || existingMeta.reason || 'Khách hàng gửi yêu cầu hủy và đã được Ban quản trị phê duyệt',
                time: existingMeta.cancelRequest?.requestedAt || existingMeta.time || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                cancelledAt: new Date().toISOString(),
                refundAmount: normalizedRefundAmount !== null ? `${formatCurrency(normalizedRefundAmount)}đ` : existingMeta.refundAmount,
                note: adminNote || undefined,
                adminApproval: {
                    approvedAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                    note: adminNote || undefined,
                    refundAmount: normalizedRefundAmount !== null ? `${formatCurrency(normalizedRefundAmount)}đ` : undefined,
                },
            };
            const claimed = await tx.bookings.updateMany({
                where: { booking_id: bookingId, status: 'cancel_requested' },
                data: {
                    status: 'cancelled',
                    cancellation_meta: cancellationMeta as any,
                },
            });
            if (claimed.count !== 1) throw new BadRequestException('Yêu cầu hủy này đã được xử lý.');
            const cancelled = await tx.bookings.findUnique({ where: { booking_id: bookingId } });
            
            // Giảm an toàn số lượng chỗ đã đặt
            if (totalGuests > 0 && booking.tour_schedule_id) {
                const currentSchedule = await tx.tour_schedules.findUnique({
                    where: { tour_schedule_id: booking.tour_schedule_id },
                    select: { booked_count: true },
                });
                const newCount = Math.max(0, (currentSchedule?.booked_count || 0) - totalGuests);
                await tx.tour_schedules.update({
                    where: { tour_schedule_id: booking.tour_schedule_id },
                    data: { booked_count: newCount },
                });
            }

            // Hoàn lại voucher nếu có
            if (booking.voucher_id) {
                await tx.vouchers.updateMany({ where: { voucher_id: booking.voucher_id, used_count: { gt: 0 } }, data: { used_count: { decrement: 1 } } });
            }

            // Hoàn lại lượt ưu đãi đợt khởi hành nếu có
            if (booking.tour_schedule_id) {
                const guestSlots = (booking.adult_count || 0) + (booking.child_count || 0);
                if (guestSlots > 0) {
                    await tx.schedule_promotions.updateMany({
                        where: { tour_schedule_id: booking.tour_schedule_id, used_slots: { gt: 0 } },
                        data: { used_slots: { decrement: guestSlots } },
                    });
                }
            }

            return cancelled;
        });
        await this.mailService.sendCancelApprovedEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            totalAmount: booking.total_amount ? booking.total_amount.toString() : 0,
            refundAmount: normalizedRefundAmount,
            reason: adminNote,
        });
        await sendBookingNotification(this.prisma, {
            type: 'cancel_approved',
            userId: booking.user_id,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            refundAmount: normalizedRefundAmount ?? undefined,
            note: adminNote,
        });
        return updated;
    }
    async rejectCancel(bookingId: any, isStaff: any, note: any) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.findBookingForCancelActionOrThrow(bookingId);
        if (booking.status !== 'cancel_requested') {
            throw new BadRequestException('Booking này không ở trạng thái yêu cầu hủy.');
        }
        if (booking.tour_schedules?.start_date && new Date(booking.tour_schedules.start_date).getTime() <= Date.now()) {
            throw new BadRequestException('Chuyến đi đã hoặc đang trong thời gian khởi hành, không thể duyệt hủy đơn.');
        }
        const adminNote = note?.trim();
        const updated = await this.prisma.$transaction(async tx => {
            // Read paid funds after the same lock used by VNPay callbacks.
            await tx.$queryRaw`SELECT booking_id FROM bookings WHERE booking_id = ${bookingId} FOR UPDATE`;
            const current = await tx.bookings.findUniqueOrThrow({ where: { booking_id: bookingId }, include: {
                payments: { where: { status: { in: ['completed', 'review'] } }, orderBy: { payment_id: 'desc' }, take: 1 },
            } });
            if (current.status !== 'cancel_requested') throw new BadRequestException('Yêu cầu hủy này đã được xử lý.');
            const existingMeta = (current.cancellation_meta as BookingCancellationMeta) || {};
            const cancellationMeta: BookingCancellationMeta = {
                ...existingMeta,
                type: 'admin_cancel_rejected',
                adminRejection: {
                    rejectedAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                    note: adminNote || undefined,
                },
            };
            return tx.bookings.update({
                where: { booking_id: bookingId },
                data: {
                    status: resolveRollbackStatus(current.payments[0]?.status),
                    cancellation_meta: cancellationMeta as any,
                },
            });
        });
        await this.mailService.sendCancelRejectedEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            reason: adminNote,
        });
        await sendBookingNotification(this.prisma, {
            type: 'cancel_rejected',
            userId: booking.user_id,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            note: adminNote,
        });
        return updated;
    }

    async cancelPendingBooking(bookingId: number, isStaff: boolean, reason?: string) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: bookingId },
            include: {
                tour_schedules: {
                    include: {
                        tours: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new NotFoundException('Không tìm thấy đơn đặt tour.');
        }
        if (booking.status !== 'pending') {
            throw new BadRequestException('Chỉ có thể hủy và nhả chỗ trực tiếp cho đơn đang ở trạng thái Chờ thanh toán (Pending).');
        }

        const totalGuests = (booking.adult_count || 0) + (booking.child_count || 0) + (booking.infant_count || 0);
        const cancelReason = reason?.trim() || 'Nhân viên hủy do khách xác nhận không đi / quá hạn giữ chỗ';
        const cancellationMeta: BookingCancellationMeta = {
            type: 'staff_cancelled_pending',
            actor: 'Ban quản trị / Nhân viên',
            title: 'Hủy đơn giữ chỗ bởi Nhân viên điều hành',
            reason: cancelReason,
            cancelledAt: new Date().toISOString(),
            time: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        };

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.bookings.update({
                where: { booking_id: bookingId },
                data: {
                    status: 'cancelled',
                    cancellation_meta: cancellationMeta as any,
                },
            });

            // Giảm booked_count để giải phóng chỗ cho người khác đặt
            if (totalGuests > 0 && booking.tour_schedule_id) {
                const currentSchedule = await tx.tour_schedules.findUnique({
                    where: { tour_schedule_id: booking.tour_schedule_id },
                    select: { booked_count: true },
                });
                const newCount = Math.max(0, (currentSchedule?.booked_count || 0) - totalGuests);
                await tx.tour_schedules.update({
                    where: { tour_schedule_id: booking.tour_schedule_id },
                    data: { booked_count: newCount },
                });
            }

            // Hoàn trả voucher nếu có
            if (booking.voucher_id) {
                await tx.vouchers.updateMany({
                    where: { voucher_id: booking.voucher_id, used_count: { gt: 0 } },
                    data: { used_count: { decrement: 1 } },
                });
            }

            // Hoàn lại lượt ưu đãi đợt khởi hành nếu có
            if (booking.tour_schedule_id) {
                const guestSlots = (booking.adult_count || 0) + (booking.child_count || 0);
                if (guestSlots > 0) {
                    await tx.schedule_promotions.updateMany({
                        where: { tour_schedule_id: booking.tour_schedule_id, used_slots: { gt: 0 } },
                        data: { used_slots: { decrement: guestSlots } },
                    });
                }
            }

            // Gửi thông báo đến trang Thông báo trong tài khoản của khách
            await sendBookingNotification(tx, {
                type: 'staff_cancelled_pending',
                userId: booking.user_id,
                bookingId: booking.booking_id,
                tourName: booking.tour_schedules?.tours?.name || 'Tour',
                reason: cancelReason,
            });

            return updated;
        });
    }

    async adminCancelBooking(
        bookingId: number,
        isStaff: boolean,
        reason?: string,
        refundAmount?: number,
        note?: string,
        cancelType: 'operator_fault' | 'customer_request' = 'customer_request',
        resolutionOption: 'full_refund' | 'reschedule' = 'full_refund',
        newScheduleId?: number,
        allowedOptions?: ('full_refund' | 'reschedule')[],
        waiveDifference?: boolean,
    ) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: bookingId },
            include: {
                tour_schedules: {
                    include: {
                        tours: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new NotFoundException('Không tìm thấy đơn đặt tour.');
        }
        if (['cancelled', 'canceled'].includes(booking.status)) {
            throw new BadRequestException('Booking này đã bị hủy trước đó.');
        }

        const isDeparted = booking.tour_schedules?.start_date && new Date(booking.tour_schedules.start_date).getTime() <= Date.now();
        if (isDeparted) {
            throw new BadRequestException('Chuyến đi đã hoặc đang trong thời gian khởi hành, không thể thực hiện hủy hoặc dời lịch tour.');
        }

        const totalGuests = (booking.adult_count || 0) + (booking.child_count || 0) + (booking.infant_count || 0);
        const cancelReason = reason?.trim() || (cancelType === 'operator_fault' ? 'Hủy do sự cố vận hành / thời tiết' : 'Khách hàng yêu cầu hủy tour');
        const adminNote = note?.trim();

        // 1. TRƯỜNG HỢP: Sự cố vận hành / Công ty hủy tour -> Đưa ra phương án giải quyết (để khách tự chọn)
        if (cancelType === 'operator_fault') {
            const finalOptions: ('full_refund' | 'reschedule')[] = Array.isArray(allowedOptions) && allowedOptions.length > 0
                ? allowedOptions
                : [resolutionOption];

            let newSchedule: any = null;
            let priceDifference = 0;

            if (finalOptions.includes('reschedule') && newScheduleId) {
                newSchedule = await this.prisma.tour_schedules.findUnique({
                    where: { tour_schedule_id: newScheduleId },
                    include: { tours: true, tour_schedule_prices: true },
                });
                if (!newSchedule) {
                    throw new BadRequestException('Đợt khởi hành mới được đề xuất không tồn tại.');
                }
                if (newSchedule.start_date && new Date(newSchedule.start_date).getTime() <= Date.now()) {
                    throw new BadRequestException('Đợt khởi hành mới đã qua ngày khởi hành.');
                }

                // Tính toán giá tiền đợt mới để xem có chênh lệch không
                const adultPrice = Number(newSchedule.price) || 0;
                const childPrice = Number(newSchedule.tour_schedule_prices?.find((p: any) => p.passenger_type === 'child')?.price ?? adultPrice * 0.7);
                const infantPrice = Number(newSchedule.tour_schedule_prices?.find((p: any) => p.passenger_type === 'infant')?.price ?? 0);
                const singleRoomSurcharge = Number(newSchedule.single_room_surcharge ?? newSchedule.tours?.single_room_surcharge ?? 0);

                const singleRoomCount = (booking.room_selection as any)?.single_room_count || ((booking.room_selection as any)?.single_room ? 1 : 0);

                const newTickets = (booking.adult_count || 0) * adultPrice +
                                   (booking.child_count || 0) * childPrice +
                                   (booking.infant_count || 0) * infantPrice;
                const newSurcharge = singleRoomCount * singleRoomSurcharge;
                const newTotal = newTickets + newSurcharge + (Number(booking.services_total) || 0) - (Number(booking.discount_amount) || 0);

                const oldTotal = Number(booking.total_amount) || 0;
                priceDifference = Math.round(newTotal - oldTotal);
            }

            const proposal = {
                proposedAt: new Date().toISOString(),
                reason: cancelReason,
                adminNote: adminNote || undefined,
                allowedOptions: finalOptions,
                suggestedScheduleId: newSchedule ? newSchedule.tour_schedule_id : undefined,
                suggestedScheduleStartDate: newSchedule?.start_date ? new Date(newSchedule.start_date).toISOString() : undefined,
                suggestedScheduleEndDate: newSchedule?.end_date ? new Date(newSchedule.end_date).toISOString() : undefined,
                suggestedScheduleTitle: newSchedule ? `${newSchedule.tours?.name || 'Tour'} (${new Date(newSchedule.start_date).toLocaleDateString('vi-VN')} - ${new Date(newSchedule.end_date).toLocaleDateString('vi-VN')})` : undefined,
                priceDifference,
                waiveDifference: Boolean(waiveDifference),
                status: 'pending_customer',
            };

            const existingMeta = (booking.cancellation_meta as BookingCancellationMeta) || {};
            const cancellationMeta: BookingCancellationMeta = {
                ...existingMeta,
                type: 'admin_cancelled',
                actor: 'Ban quản trị / Nhân viên',
                title: 'Đề xuất phương án giải quyết (Chờ khách phản hồi)',
                reason: cancelReason,
                time: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                resolutionProposal: proposal as any,
            };

            const updated = await this.prisma.bookings.update({
                where: { booking_id: bookingId },
                data: {
                    status: 'cancel_proposed',
                    cancellation_meta: cancellationMeta as any,
                },
            });

            // Gửi email thông báo hủy tour & đề xuất phương án cho khách
            if (booking.contact_email) {
                const optionsText = finalOptions
                    .map((opt) => (opt === 'full_refund' ? 'Hoàn tiền 100%' : 'Dời sang đợt khởi hành mới'))
                    .join(' HOẶC ');
                await this.mailService.sendCancelProposedEmail({
                    email: booking.contact_email,
                    contactName: booking.contact_name,
                    bookingId: booking.booking_id,
                    tourName: booking.tour_schedules?.tours?.name || 'Tour',
                    reason: cancelReason,
                    optionsText,
                });
            }

            // Gửi thông báo trong hệ thống
            await sendBookingNotification(this.prisma, {
                type: 'cancel_proposed',
                userId: booking.user_id,
                bookingId: booking.booking_id,
                tourName: booking.tour_schedules?.tours?.name || 'Tour',
                reason: cancelReason,
                note: adminNote,
            });

            return updated;
        }

        // 2. TRƯỜNG HỢP: Hủy trực tiếp theo yêu cầu của khách hàng
        const targetRefund = typeof refundAmount === 'number' && Number.isFinite(refundAmount)
            ? Math.max(refundAmount, 0)
            : Number(booking.total_amount) || 0;

        const cancellationMeta: BookingCancellationMeta = {
            type: 'admin_cancelled',
            actor: 'Ban quản trị / Nhân viên',
            title: 'Hủy bởi Ban quản trị / Bộ phận điều hành',
            reason: cancelReason,
            cancelledAt: new Date().toISOString(),
            time: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            refundAmount: `${formatCurrency(targetRefund)}đ`,
            note: adminNote || undefined,
            adminAction: {
                cancelType,
                reason: cancelReason,
                note: adminNote || undefined,
                refundAmount: `${formatCurrency(targetRefund)}đ`,
                time: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                cancelledAt: new Date().toISOString(),
            },
        };

        const updated = await this.prisma.$transaction(async (tx) => {
            const res = await tx.bookings.update({
                where: { booking_id: bookingId },
                data: {
                    status: 'cancelled',
                    cancellation_meta: cancellationMeta as any,
                },
            });

            // Giảm booked_count
            if (totalGuests > 0 && booking.tour_schedule_id) {
                const currentSchedule = await tx.tour_schedules.findUnique({
                    where: { tour_schedule_id: booking.tour_schedule_id },
                    select: { booked_count: true },
                });
                const newCount = Math.max(0, (currentSchedule?.booked_count || 0) - totalGuests);
                await tx.tour_schedules.update({
                    where: { tour_schedule_id: booking.tour_schedule_id },
                    data: { booked_count: newCount },
                });
            }

            // Hoàn lại voucher nếu có
            if (booking.voucher_id) {
                await tx.vouchers.updateMany({
                    where: { voucher_id: booking.voucher_id, used_count: { gt: 0 } },
                    data: { used_count: { decrement: 1 } },
                });
            }

            // Hoàn lại lượt ưu đãi đợt khởi hành nếu có
            if (booking.tour_schedule_id) {
                const guestSlots = (booking.adult_count || 0) + (booking.child_count || 0);
                if (guestSlots > 0) {
                    await tx.schedule_promotions.updateMany({
                        where: { tour_schedule_id: booking.tour_schedule_id, used_slots: { gt: 0 } },
                        data: { used_slots: { decrement: guestSlots } },
                    });
                }
            }

            return res;
        });

        if (booking.contact_email) {
            await this.mailService.sendCancelApprovedEmail({
                email: booking.contact_email,
                contactName: booking.contact_name,
                bookingId: booking.booking_id,
                tourName: booking.tour_schedules?.tours?.name || 'Tour',
                refundAmount: targetRefund,
            });
        }

        // Gửi thông báo đến trang Thông báo trong tài khoản của khách
        await sendBookingNotification(this.prisma, {
            type: 'admin_cancelled',
            userId: booking.user_id,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            reason: cancelReason,
            refundAmount: targetRefund,
            note: adminNote,
        });

        return updated;
    }

    async confirmRefundTransfer(
        bookingId: number,
        isStaff: boolean,
        transactionCode?: string,
        note?: string,
        amount?: number,
    ) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.prisma.bookings.findUnique({
            where: { booking_id: bookingId },
            include: { tour_schedules: { include: { tours: true } } },
        });
        if (!booking) throw new NotFoundException('Không tìm thấy booking.');

        const existingMeta = (booking.cancellation_meta as BookingCancellationMeta) || {};
        const proposal = existingMeta.resolutionProposal;
        const targetAmount = typeof amount === 'number' && Number.isFinite(amount)
            ? amount
            : (proposal?.refundTransfer?.amount ?? Number(booking.total_amount) ?? 0);

        const refundTransfer = {
            transferredAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            transactionCode: transactionCode?.trim() || undefined,
            adminNote: note?.trim() || undefined,
            amount: targetAmount,
        };

        const updatedProposal = proposal
            ? { ...proposal, status: 'refund_transferred' as const, refundTransfer }
            : undefined;

        const cancellationMeta: BookingCancellationMeta = {
            ...existingMeta,
            type: 'customer_request_approved',
            actor: 'Ban quản trị / Nhân viên',
            title: 'Đã hoàn tiền thành công',
            refundAmount: `${formatCurrency(targetAmount)}đ`,
            resolutionProposal: updatedProposal as any,
        };

        const updated = await this.prisma.$transaction(async (tx) => {
            const res = await tx.bookings.update({
                where: { booking_id: bookingId },
                data: {
                    status: 'cancelled',
                    cancellation_meta: cancellationMeta as any,
                },
            });

            // Ghi nhận bản ghi thanh toán hoàn tiền
            await tx.payments.create({
                data: {
                    booking_id: bookingId,
                    amount: targetAmount,
                    method: 'bank',
                    status: 'refunded',
                    transaction_code: transactionCode?.trim() || `REFUND_${Date.now()}`,
                },
            });

            return res;
        });

        // Gửi email thông báo hoàn tiền thành công
        if (booking.contact_email) {
            const bankAccount = proposal?.customerDecision?.bankAccount || (existingMeta as any).cancelRequest;
            await this.mailService.sendRefundTransferredEmail({
                email: booking.contact_email,
                contactName: booking.contact_name,
                bookingId: booking.booking_id,
                tourName: booking.tour_schedules?.tours?.name || 'Tour',
                refundAmount: targetAmount,
                bankName: bankAccount?.bankName,
                accountNumber: bankAccount?.accountNumber || bankAccount?.bankAccountNumber,
                transactionCode,
            });
        }

        // Gửi thông báo trong hệ thống
        await sendBookingNotification(this.prisma, {
            type: 'refund_transferred',
            userId: booking.user_id,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            refundAmount: targetAmount,
            note: transactionCode,
        });

        return updated;
    }
}
