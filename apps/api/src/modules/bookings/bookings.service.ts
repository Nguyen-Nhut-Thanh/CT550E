import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { BookingPayload } from "shared";
import { BOOKING_EXTRAS, isValidCitizenId, isValidEmail, isValidVietnamesePhone, membershipDiscount, membershipPrice, voucherAudienceAllows, voucherAudienceLabel } from "shared";
import { customerCrewBooking } from './customer-crew';
import { MembershipService } from "../membership/membership.service";
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
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService, private readonly membership: MembershipService) { }

    async checkScheduleConflicts(tourScheduleId: number, travelers: Array<{ fullName: string; idNumber?: string }>) {
        if (!tourScheduleId || !Array.isArray(travelers) || travelers.length === 0) {
            return { hasConflict: false, conflicts: [] };
        }
        const currentSchedule = await this.prisma.tour_schedules.findUnique({
            where: { tour_schedule_id: tourScheduleId },
            include: { tours: { select: { name: true, duration_days: true } } },
        });
        if (!currentSchedule || !currentSchedule.start_date) {
            return { hasConflict: false, conflicts: [] };
        }

        const currentStart = new Date(currentSchedule.start_date);
        const durationDays = currentSchedule.tours?.duration_days || 1;
        const currentEnd = currentSchedule.end_date
            ? new Date(currentSchedule.end_date)
            : new Date(currentStart.getTime() + Math.max(durationDays - 1, 0) * 86400000);

        const idMap = new Map<string, string>();
        for (const t of travelers) {
            if (t?.idNumber && typeof t.idNumber === 'string') {
                const clean = t.idNumber.trim();
                if (clean) idMap.set(clean, t.fullName?.trim() || 'Hành khách');
            }
        }
        const idNumbers = Array.from(idMap.keys());
        if (idNumbers.length === 0) {
            return { hasConflict: false, conflicts: [] };
        }

        const existingRecords = await this.prisma.booking_travelers.findMany({
            where: {
                id_number: { in: idNumbers },
                bookings: {
                    status: { notIn: ['cancelled', 'rejected'] },
                    tour_schedule_id: { not: tourScheduleId },
                },
            },
            include: {
                bookings: {
                    include: {
                        tour_schedules: {
                            include: {
                                tours: {
                                    select: { name: true, duration_days: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        const conflicts: Array<{
            travelerName: string;
            idNumber: string;
            tourName: string;
            startDate: string;
            endDate: string;
            bookingId: number;
        }> = [];
        const seen = new Set<string>();

        const toVnDateStr = (date: Date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const curS = currentStart.toISOString().slice(0, 10);
        const curE = currentEnd.toISOString().slice(0, 10);

        for (const record of existingRecords) {
            const schedule = record.bookings?.tour_schedules;
            if (!schedule || !schedule.start_date) continue;

            const oldStart = new Date(schedule.start_date);
            const oldDays = schedule.tours?.duration_days || 1;
            const oldEnd = schedule.end_date
                ? new Date(schedule.end_date)
                : new Date(oldStart.getTime() + Math.max(oldDays - 1, 0) * 86400000);

            const oldS = oldStart.toISOString().slice(0, 10);
            const oldE = oldEnd.toISOString().slice(0, 10);

            if (curS <= oldE && oldS <= curE) {
                const key = `${record.id_number}_${record.booking_id}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    conflicts.push({
                        travelerName: record.full_name || idMap.get(record.id_number!) || 'Hành khách',
                        idNumber: record.id_number!,
                        tourName: schedule.tours?.name || 'Tour đã đặt',
                        startDate: toVnDateStr(oldStart),
                        endDate: toVnDateStr(oldEnd),
                        bookingId: record.booking_id,
                    });
                }
            }
        }

        return {
            hasConflict: conflicts.length > 0,
            conflicts,
        };
    }

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
        if (!isValidVietnamesePhone(dto.contact_phone)) {
            throw new BadRequestException("Số điện thoại không đúng định dạng (VD: 0912345678).");
        }
        if (!isValidEmail(dto.contact_email)) {
            throw new BadRequestException("Email không đúng định dạng (VD: example@domain.com).");
        }
        if (dto.contact_id_card && !isValidCitizenId(dto.contact_id_card)) {
            throw new BadRequestException("Số căn cước công dân người liên hệ phải gồm 9 hoặc 12 chữ số.");
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
            if (traveler.idNumber && !isValidCitizenId(traveler.idNumber)) {
                throw new BadRequestException(`Số căn cước công dân của "${traveler.fullName || 'hành khách'}" phải gồm 9 hoặc 12 chữ số.`);
            }
        }

        // Kiểm tra xung đột lịch trình nếu chưa được xác nhận bởi người dùng
        const conflictCheck = await this.checkScheduleConflicts(
            dto.tour_schedule_id,
            dto.travelers.map((t: any, idx: number) => ({
                fullName: t.fullName,
                idNumber: t.idNumber || (idx === 0 ? dto.contact_id_card : undefined),
            })),
        );
        if (conflictCheck.hasConflict && !dto.confirmed_schedule_conflict) {
            const first = conflictCheck.conflicts[0];
            throw new BadRequestException({
                message: `Hành khách ${first.travelerName} (CCCD: ${first.idNumber}) hiện đang có tour "${first.tourName}" đi từ ${first.startDate} đến ${first.endDate}. Vui lòng xác nhận trước khi tiếp tục đặt tour.`,
                hasConflict: true,
                conflicts: conflictCheck.conflicts,
            });
        }
        const member = await this.membership.syncUser(dto.user_id);
        const booking = await this.prisma.$transaction(async (tx: any) => {
            await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${dto.tour_schedule_id} FOR UPDATE`;
            const schedule = await tx.tour_schedules.findUnique({
                where: { tour_schedule_id: dto.tour_schedule_id },
                include: {
                    departure_location: true,
                    pickup_points: { orderBy: { sort_order: 'asc' } },
                    tour_schedule_prices: true,
                    tour_schedule_hotels: { include: { hotel_room_types: true } },
                    tours: {
                        select: {
                            tour_id: true,
                            tour_type: true,
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
            const pickup = schedule.pickup_points.find((point: { pickup_point_id: number }) => point.pickup_point_id === dto.pickup_point_id);
            if ((schedule.pickup_points.length > 0 && !pickup) || (dto.pickup_point_id != null && !pickup)) {
                throw new BadRequestException('Vui lòng chọn điểm đón thuộc đúng chuyến khởi hành.');
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
                if (voucher && !voucherAudienceAllows(voucher.eligible_tiers, member.tier.id)) {
                    throw new BadRequestException(`Voucher chỉ áp dụng cho: ${voucherAudienceLabel(voucher.eligible_tiers)}.`);
                }
                if (voucher) {
                    const userUsedCount = await tx.bookings.count({
                        where: {
                            user_id: dto.user_id,
                            voucher_id: voucher.voucher_id,
                            status: { notIn: ['cancelled', 'rejected'] },
                        },
                    });
                    const maxPerUser = voucher.usage_limit_per_user ?? 1;
                    if (userUsedCount >= maxPerUser) {
                        throw new BadRequestException(`Bạn đã sử dụng hết lượt cho mã giảm giá này (tối đa ${maxPerUser} lần/tài khoản).`);
                    }

                    if (voucher.applicable_scope === 'tour_type' && voucher.applicable_tour_types.length > 0) {
                        if (!voucher.applicable_tour_types.includes(schedule.tours.tour_type)) {
                            const typeLabels: Record<string, string> = {
                                domestic: 'Tour trong nước',
                                outbound: 'Tour nước ngoài',
                                international: 'Tour quốc tế',
                            };
                            const allowed = voucher.applicable_tour_types.map((t: string) => typeLabels[t] || t).join(', ');
                            throw new BadRequestException(`Mã giảm giá này chỉ áp dụng cho: ${allowed}.`);
                        }
                    } else if (voucher.applicable_scope === 'specific_tours' && voucher.applicable_tour_ids.length > 0) {
                        if (!voucher.applicable_tour_ids.includes(schedule.tours.tour_id)) {
                            throw new BadRequestException('Mã giảm giá này chỉ áp dụng cho một số tour nhất định.');
                        }
                    }
                }
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
            const voucherDiscount = discountAmount;
            const { tourDiscount, serviceDiscount } = membershipPrice(member.tier, subtotal, extras.total, voucherDiscount);
            discountAmount += tourDiscount + serviceDiscount;
            const totalAmount = Math.max(subtotal + singleRoomSurcharge + extras.total - discountAmount, 0);
            const roomNote = dto.room_type === 'single'
                ? `[ROOM_SELECTION]\nLoại phòng: PHÒNG ĐƠN\nPhụ thu phòng đơn: ${formatCurrency(singleRoomSurcharge)}đ`
                : `[ROOM_SELECTION]\nLoại phòng: GHÉP PHÒNG\nPhụ thu phòng đơn: 0đ`;
            const contactIdCardNote = dto.contact_id_card?.trim()
                ? `\n[CCCD_LIEN_HE]: ${dto.contact_id_card.trim()}`
                : '';
            const mergedNote = dto.note?.trim()
                ? `${dto.note.trim()}\n\n${roomNote}${contactIdCardNote}`
                : `${roomNote}${contactIdCardNote}`;
            const createdBooking = await tx.bookings.create({
                data: {
                    user_id: dto.user_id,
                    tour_schedule_id: dto.tour_schedule_id,
                    departure_name: schedule.departure_location.name,
                    pickup_point_id: pickup?.pickup_point_id ?? null,
                    ...(pickup ? { pickup_snapshot: { name: pickup.name, address: pickup.address, pickup_at: pickup.pickup_at.toISOString(), note: pickup.note } } : {}),
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
                    membership_snapshot: {
                        tier: member.tier.id, name: member.tier.name,
                        pointMultiplier: member.tier.pointMultiplier,
                        priorityReservation: member.tier.priorityReservation,
                        tourDiscountPercent: member.tier.tourDiscountPercent,
                        serviceDiscountPercent: member.tier.serviceDiscountPercent,
                        tourDiscount, serviceDiscount, voucherDiscount,
                    },
                    services_total: extras.total,
                },
            });
            if (dto.travelers?.length) {
                await tx.booking_travelers.createMany({
                    data: dto.travelers.map((t: any, idx: number) => ({
                        booking_id: createdBooking.booking_id,
                        full_name: t.fullName,
                        gender: t.gender,
                        dob: t.birthday ? new Date(t.birthday) : null,
                        id_number: t.idNumber ? String(t.idNumber).trim() : (idx === 0 && dto.contact_id_card ? String(dto.contact_id_card).trim() : null),
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
                const consumed = await tx.vouchers.updateMany({ where: { voucher_id: voucherId, used_count: { lt: voucherUsageLimit }, status: 1, start_date: { lte: new Date() }, expiry_date: { gt: new Date() }, AND: [{ OR: [{ owner_user_id: null }, { owner_user_id: dto.user_id }] }, { OR: [{ eligible_tiers: { isEmpty: true } }, { eligible_tiers: { has: member.tier.id } }] }] }, data: { used_count: { increment: 1 } } });
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
        const bookings = await this.prisma.bookings.findMany({
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
                reviews: {
                    select: {
                        review_id: true,
                        tour_id: true,
                        booking_id: true,
                        rating: true,
                        title: true,
                        comment: true,
                        images: true,
                        status: true,
                        created_at: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return bookings.map(customerCrewBooking);
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
        const booking = await this.prisma.bookings.findFirst({
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
        return booking ? customerCrewBooking(booking) : null;
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
