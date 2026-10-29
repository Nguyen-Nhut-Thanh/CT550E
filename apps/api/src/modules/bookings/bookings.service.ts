import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { BookingPayload } from "shared";
import { BOOKING_EXTRAS, membershipDiscount } from "shared";
import { getAccountUserId } from '../../common/auth/account-user';
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { MailService } from "../../infrastructure/mail/mail.service";
import { formatCurrency, mergeBookingNote, priceBookingExtras } from "./booking.helpers";
@Injectable()
export class BookingsService {
    getExtraServices() {
        return BOOKING_EXTRAS;
    }
    async customerForStaff(userId: number) {
        const user = await this.prisma.users.findUnique({ where: { user_id: userId }, select: { full_name: true, phone: true, accounts: { select: { email: true, status: true } } } });
        if (!user || user.accounts.status !== 1) throw new NotFoundException('Không tìm thấy khách hàng đang hoạt động.');
        return { full_name: user.full_name, phone: user.phone, email: user.accounts.email };
    }
    async createForCustomer(userId: number, dto: BookingPayload) {
        await this.customerForStaff(userId);
        return this.createBooking({ ...dto, user_id: userId });
    }
    async createForAccount(accountId: number, dto: BookingPayload) {
        return this.createBooking({ ...dto, user_id: await getAccountUserId(this.prisma, accountId, "Không tìm thấy người dùng.") });
    }
    async listForAccount(accountId: number) { return this.getMyBookings(await getAccountUserId(this.prisma, accountId, "Không tìm thấy người dùng.")); }
    async statsForAccount(accountId: number) { return this.getBookingStats(await getAccountUserId(this.prisma, accountId, "Không tìm thấy người dùng.")); }
    async detailForAccount(id: number, accountId: number) { return this.getBookingDetail(id, await getAccountUserId(this.prisma, accountId, "Không tìm thấy người dùng.")); }
    async cancelForAccount(id: number, accountId: number, reason?: string) { return this.requestCancel(id, await getAccountUserId(this.prisma, accountId, "Không tìm thấy người dùng."), reason); }
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) { }
    async createBooking(dto: any) {
        if (!Number.isInteger(dto.tour_schedule_id) || dto.tour_schedule_id < 1 ||
            !Number.isInteger(dto.adult_count) || dto.adult_count < 1 ||
            !Number.isInteger(dto.child_count) || dto.child_count < 0 ||
            !Number.isInteger(dto.infant_count) || dto.infant_count < 0) {
            throw new BadRequestException("Số lượng hành khách không hợp lệ.");
        }
        if ([dto.contact_name, dto.contact_phone, dto.contact_email].some(value => typeof value !== "string" || !value.trim())) {
            throw new BadRequestException("Vui lòng điền đầy đủ thông tin liên hệ.");
        }
        if (dto.payment_method !== "vnpay")
            throw new BadRequestException("Phương thức thanh toán chưa được hỗ trợ.");
        if (!Array.isArray(dto.travelers))
            throw new BadRequestException("Danh sách hành khách không hợp lệ.");
        for (const traveler of dto.travelers) {
            if (!["male", "female"].includes(traveler.gender) || !["adult", "child", "infant"].includes(traveler.type) || typeof traveler.fullName !== "string") {
                throw new BadRequestException("Thông tin hành khách không hợp lệ.");
            }
            if (traveler.birthday && (!/^\d{4}-\d{2}-\d{2}$/.test(traveler.birthday) ||
                Number.isNaN(Date.parse(traveler.birthday)) || new Date(traveler.birthday).toISOString().slice(0, 10) !== traveler.birthday || new Date(traveler.birthday) > new Date())) {
                throw new BadRequestException("Ngày sinh không hợp lệ.");
            }
        }
        const booking = await this.prisma.$transaction(async (tx: any) => {
            const schedule = await tx.tour_schedules.findUnique({
                where: { tour_schedule_id: dto.tour_schedule_id },
                include: {
                    tour_schedule_prices: true,
                    tour_schedule_hotels: { include: { hotel_room_types: true } },
                    tours: {
                        select: {
                            name: true,
                            status: true,
                        },
                    },
                },
            });
            if (!schedule || schedule.status !== 1) {
                throw new BadRequestException('Lịch trình không tồn tại hoặc đã bị ẩn.');
            }
            if (!schedule.tours || schedule.tours.status !== 1) {
                throw new BadRequestException('Tour này hiện đang tạm ẩn và không nhận đặt mới.');
            }
            const totalGuests = dto.adult_count + dto.child_count + dto.infant_count;
            if (schedule.quota - schedule.booked_count < totalGuests) {
                throw new BadRequestException('Không đủ chỗ trống cho số lượng khách yêu cầu.');
            }
            const adultPrice = Number(schedule.tour_schedule_prices.find((p: any) => p.passenger_type === 'ADULT')
                ?.price ?? schedule.price);
            const childPrice = Number(schedule.tour_schedule_prices.find((p: any) => p.passenger_type === 'CHILD')
                ?.price ?? 0);
            const infantPrice = Number(schedule.tour_schedule_prices.find((p: any) => p.passenger_type === 'INFANT')
                ?.price ?? 0);
            const subtotal = dto.adult_count * adultPrice +
                dto.child_count * childPrice +
                dto.infant_count * infantPrice;
            const singleRoomCount = dto.single_room_count ?? (dto.room_type === "single" ? 1 : 0);
            if (!Number.isInteger(singleRoomCount) || singleRoomCount < 0 || singleRoomCount > dto.adult_count) {
                throw new BadRequestException("Số phòng đơn không hợp lệ.");
            }
            const hotelSurcharge = schedule.tour_schedule_hotels.reduce((sum: number, hotel: any) => sum + Number(hotel.hotel_room_types?.base_price || 0) * Math.max(Number(hotel.nights || 1), 1), 0);
            const singleRoomUnit = hotelSurcharge > 0 ? hotelSurcharge : Number(schedule.tour_schedule_prices.find((p: any) => ["SINGLE_ROOM", "single_room"].includes(p.passenger_type))?.price ?? 0);
            const singleRoomSurcharge = singleRoomUnit * singleRoomCount;
            const extras = priceBookingExtras(dto.additional_service_ids, totalGuests);
            let discountAmount = 0;
            let voucherId = null;
            let voucherUsageLimit = 0;
            if (dto.voucher_code) {
                const voucher = await tx.vouchers.findFirst({
                    where: {
                        code: String(dto.voucher_code).trim().toUpperCase(),
                        OR: [{ owner_user_id: null }, { owner_user_id: dto.user_id }],
                        status: 1,
                        start_date: { lte: new Date() },
                        expiry_date: { gte: new Date() },
                    },
                });
                if (voucher && voucher.used_count < voucher.usage_limit && subtotal >= Number(voucher.min_order_value)) {
                    discountAmount = membershipDiscount({ discount_type: voucher.discount_type, discount_value: Number(voucher.discount_value), min_order_value: Number(voucher.min_order_value), max_discount_amount: voucher.max_discount_amount === null ? null : Number(voucher.max_discount_amount) }, subtotal);
                    voucherId = voucher.voucher_id;
                    voucherUsageLimit = voucher.usage_limit;
                }
                else {
                    throw new BadRequestException("Mã giảm giá không còn hợp lệ. Vui lòng áp dụng lại.");
                }
            }
            discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);
            const totalAmount = Math.max(subtotal + singleRoomSurcharge + extras.total - discountAmount, 0);
            const roomNote = dto.room_type === 'single'
                ? `[ROOM_SELECTION]\nLoại phòng: PHÒNG ĐƠN\nPhụ thu phòng đơn: ${formatCurrency(singleRoomSurcharge)}đ`
                : `[ROOM_SELECTION]\nLoại phòng: GHÉP PHÒNG\nPhụ thu phòng đơn: 0đ`;
            const mergedNote = dto.note?.trim()
                ? `${dto.note.trim()}\n\n${roomNote}`
                : roomNote;
            const createdBooking = await tx.bookings.create({
                data: {
                    user_id: dto.user_id,
                    tour_schedule_id: dto.tour_schedule_id,
                    contact_name: dto.contact_name,
                    contact_phone: dto.contact_phone,
                    contact_email: dto.contact_email,
                    adult_count: dto.adult_count,
                    child_count: dto.child_count,
                    infant_count: dto.infant_count,
                    adult_unit_price: adultPrice,
                    child_unit_price: childPrice,
                    infant_unit_price: infantPrice,
                    discount_amount: discountAmount,
                    total_amount: totalAmount,
                    status: 'pending',
                    note: mergedNote,
                    voucher_id: voucherId,
                    additional_services: extras.items,
                    services_total: extras.total,
                },
            });
            if (dto.travelers?.length) {
                await tx.booking_travelers.createMany({
                    data: dto.travelers.map((t: any) => ({
                        booking_id: createdBooking.booking_id,
                        full_name: t.fullName,
                        gender: t.gender,
                        dob: t.birthday ? new Date(t.birthday) : null,
                        traveler_type: t.type.toUpperCase(),
                    })),
                });
            }
            const reserved = await tx.tour_schedules.updateMany({
                where: { tour_schedule_id: dto.tour_schedule_id, status: 1, booked_count: { lte: schedule.quota - totalGuests } },
                data: { booked_count: { increment: totalGuests } },
            });
            if (reserved.count !== 1)
                throw new BadRequestException("Không đủ chỗ trống cho số lượng khách yêu cầu.");
            if (voucherId) {
                const consumed = await tx.vouchers.updateMany({ where: { voucher_id: voucherId, used_count: { lt: voucherUsageLimit }, status: 1, start_date: { lte: new Date() }, expiry_date: { gt: new Date() }, OR: [{ owner_user_id: null }, { owner_user_id: dto.user_id }] }, data: { used_count: { increment: 1 } } });
                if (consumed.count !== 1)
                    throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng.");
            }
            return {
                ...createdBooking,
                tour_name: schedule.tours?.name || 'Tour',
                start_date: schedule.start_date,
            };
        });
        await this.mailService.sendBookingCreatedEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_name,
            startDate: booking.start_date,
            totalAmount: Number(booking.total_amount),
        }).catch(() => { new Logger("BookingsService").warn("Không thể gửi email xác nhận; đơn đặt tour đã được lưu."); });
        return booking;
    }
    async getMyBookings(userId: any) {
        return this.prisma.bookings.findMany({
            where: { user_id: userId },
            include: {
                tour_schedules: {
                    include: {
                        tours: {
                            include: {
                                tour_images: {
                                    where: { is_cover: 1 },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getBookingStats(userId: any) {
        const [total, pending, upcoming] = await Promise.all([
            this.prisma.bookings.count({ where: { user_id: userId } }),
            this.prisma.bookings.count({
                where: { user_id: userId, status: 'pending' },
            }),
            this.prisma.bookings.count({
                where: {
                    user_id: userId,
                    status: { not: 'cancelled' },
                    tour_schedules: {
                        start_date: { gte: new Date() },
                    },
                },
            }),
        ]);
        const favorites = await this.prisma.favorites.count({
            where: { user_id: userId },
        });
        return {
            totalBookings: total,
            pendingPayments: pending,
            upcomingTrips: upcoming,
            totalFavorites: favorites,
        };
    }
    async getBookingDetail(bookingId: any, userId: any) {
        return this.prisma.bookings.findFirst({
            where: { booking_id: bookingId, user_id: userId },
            include: {
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
            },
        });
    }
    async requestCancel(bookingId: any, userId: any, reason: any) {
        const booking = await this.prisma.bookings.findFirst({
            where: { booking_id: bookingId, user_id: userId },
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
            throw new NotFoundException('Không tìm thấy booking.');
        }
        if (!['pending', 'paid'].includes(booking.status)) {
            throw new BadRequestException('Booking hiện không thể gửi yêu cầu hủy.');
        }
        const reasonText = reason?.trim();
        const updated = await this.prisma.bookings.update({
            where: { booking_id: bookingId },
            data: {
                status: 'cancel_requested',
                note: reasonText
                    ? mergeBookingNote(booking.note, `[CUSTOMER_CANCEL_REQUEST]\nLý do: ${reasonText}`)
                    : booking.note,
            },
        });
        await this.mailService.sendCancelRequestEmail({
            email: booking.contact_email,
            contactName: booking.contact_name,
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
        });
        await this.mailService.sendCancelRequestAdminNotification({
            bookingId: booking.booking_id,
            tourName: booking.tour_schedules?.tours?.name || 'Tour',
            contactName: booking.contact_name,
            contactEmail: booking.contact_email,
            contactPhone: booking.contact_phone,
            reason: reasonText,
        });
        return updated;
    }
}
