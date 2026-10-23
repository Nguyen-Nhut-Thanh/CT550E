import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { MailService } from "../../infrastructure/mail/mail.service";
import { formatCurrency, mergeBookingNote, resolveRollbackStatus } from "./booking.helpers";
@Injectable()
export class BookingsAdminService {
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) { }
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
    async listAdminBookings(isStaff: any, page: any = 1, limit: any = 10) {
        this.ensureStaffAccess(isStaff);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
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
                                },
                            },
                        },
                    },
                    payments: true,
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.bookings.count(),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async approveCancel(bookingId: any, isStaff: any, note: any, refundAmount: any) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.findBookingForCancelActionOrThrow(bookingId);
        if (booking.status !== 'cancel_requested') {
            throw new BadRequestException('Booking này không ở trạng thái yêu cầu hủy.');
        }
        const totalGuests = booking.adult_count + booking.child_count + booking.infant_count;
        const adminNote = note?.trim();
        const normalizedRefundAmount = typeof refundAmount === 'number' && Number.isFinite(refundAmount)
            ? Math.max(refundAmount, 0)
            : null;
        const updated = await this.prisma.$transaction(async (tx: any) => {
            const approvalLines = ['[ADMIN_CANCEL_APPROVED]'];
            if (adminNote) {
                approvalLines.push(`Ghi chú: ${adminNote}`);
            }
            if (normalizedRefundAmount !== null) {
                approvalLines.push(`Số tiền hoàn dự kiến: ${formatCurrency(normalizedRefundAmount)}đ`);
            }
            const cancelled = await tx.bookings.update({
                where: { booking_id: bookingId },
                data: {
                    status: 'cancelled',
                    note: mergeBookingNote(booking.note, approvalLines.join('\n')),
                },
            });
            await tx.tour_schedules.update({
                where: { tour_schedule_id: booking.tour_schedule_id },
                data: {
                    booked_count: {
                        decrement: totalGuests,
                    },
                },
            });
            return cancelled;
        });
        await this.mailService.sendCancelApprovedEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            refundAmount: normalizedRefundAmount,
        });
        return updated;
    }
    async rejectCancel(bookingId: any, isStaff: any, note: any) {
        this.ensureStaffAccess(isStaff);
        const booking = await this.findBookingForCancelActionOrThrow(bookingId);
        if (booking.status !== 'cancel_requested') {
            throw new BadRequestException('Booking này không ở trạng thái yêu cầu hủy.');
        }
        const rollbackStatus = resolveRollbackStatus(booking.payments?.[0]?.status);
        const adminNote = note?.trim();
        const updated = await this.prisma.bookings.update({
            where: { booking_id: bookingId },
            data: {
                status: rollbackStatus,
                note: adminNote
                    ? mergeBookingNote(booking.note, `[ADMIN_CANCEL_REJECTED]\nGhi chú: ${adminNote}`)
                    : booking.note,
            },
        });
        await this.mailService.sendCancelRejectedEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
        });
        return updated;
    }
}
