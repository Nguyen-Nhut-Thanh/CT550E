import { BadRequestException, Injectable, Logger, NotFoundException, } from '@nestjs/common';
import type { ScheduleAdminPayload } from 'shared';
import { requireFields, validatePrice } from "../../common/validation/payload";
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { mapScheduleHotel, mapSchedulePrice, mapScheduleResponse } from "./schedule.mapper";
import { departureId, normalizePickupPoints, pickupPointsEqual } from './schedule-departure';
import { saveItineraryDays } from './itinerary-activities';
import { saveScheduleAttractions } from './schedule-attractions';
import { saveScheduleAmenities } from './schedule-amenities';
@Injectable()
export class SchedulesAdminService {
    private readonly logger = new Logger(SchedulesAdminService.name);
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) { }
    async listSchedules(tourId: number) {
        const items = await this.prisma.tour_schedules.findMany({
            where: { tour_id: tourId },
            orderBy: { start_date: 'asc' },
            include: {
                departure_location: true,
                pickup_points: { orderBy: { sort_order: 'asc' } },
                _count: { select: { bookings: true } },
            },
        });
        return items.map((item) => ({
            ...item,
            price: Number(item.price),
        }));
    }
    async findOneSchedule(scheduleId: number) {
        const schedule = await this.prisma.tour_schedules.findUnique({
            where: { tour_schedule_id: scheduleId },
            include: {
                tour_schedule_amenities: { orderBy: { sort_order: 'asc' } },
                tour_schedule_attractions: { orderBy: { sort_order: 'asc' } },
                departure_location: true,
                pickup_points: { orderBy: { sort_order: 'asc' } },
                _count: { select: { bookings: true } },
                tour_schedule_prices: true,
                tour_schedule_transports: { include: { transports: true } },
                tour_schedule_hotels: {
                    include: { hotels: true, hotel_room_types: true },
                },
                tour_itineraries: { orderBy: { day_number: 'asc' }, include: { activities: { orderBy: { sort_order: 'asc' } } } },
            },
        });
        if (!schedule) {
            throw new NotFoundException('Không tìm thấy lịch khởi hành');
        }
        return {
            ...schedule,
            hasBookings: schedule._count.bookings > 0,
            price: Number(schedule.price),
            tour_schedule_prices: schedule.tour_schedule_prices.map((price) => ({
                ...price,
                price: Number(price.price),
            })),
            tour_schedule_hotels: schedule.tour_schedule_hotels.map((item) => ({
                ...item,
                nights: Number(item.nights || 1),
                day_from: item.day_from ?? null,
                day_to: item.day_to ?? null,
                hotel_id: Number(item.hotel_id),
                room_type_id: Number(item.room_type_id),
                hotel_room_types: item.hotel_room_types
                    ? {
                        ...item.hotel_room_types,
                        base_price: Number(item.hotel_room_types.base_price ?? 0),
                    }
                    : null,
            })),
        };
    }
    async createSchedule(tourId: number, body: ScheduleAdminPayload) {
        requireFields(body as Record<string, unknown>, [
            'start_date',
            'end_date',
            'price',
            'quota',
        ]);
        const tour = await this.prisma.tours.findUnique({
            where: { tour_id: tourId },
            select: { code: true, departure_location: true },
        });
        if (!tour) {
            throw new NotFoundException('Tour không tồn tại');
        }
        const locationId = departureId(body.departure_location_id === undefined ? tour.departure_location : body.departure_location_id);
        const pickupPoints = normalizePickupPoints(body.pickup_points === undefined ? [] : body.pickup_points);
        if (!await this.prisma.locations.findUnique({ where: { location_id: locationId }, select: { location_id: true } })) {
            throw new BadRequestException('Nơi xuất phát không tồn tại.');
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const schedule = await tx.tour_schedules.create({
                    data: {
                        tour_id: tourId,
                        departure_location_id: locationId,
                        pickup_points: { create: pickupPoints },
                        start_date: new Date(body.start_date!),
                        end_date: new Date(body.end_date!),
                        price: validatePrice(body.price),
                        quota: Number(body.quota),
                        status: body.status != null ? Number(body.status) : 1,
                        cover_image_url: body.cover_image_url || null,
                    },
                });
                await saveScheduleAmenities(tx, schedule.tour_schedule_id, body, true);
                await saveScheduleAttractions(tx, tourId, schedule.tour_schedule_id, body.attraction_ids);
                const updatedSchedule = await tx.tour_schedules.update({
                    where: { tour_schedule_id: schedule.tour_schedule_id },
                    data: {
                        code: `${tour.code}-${schedule.tour_schedule_id}`,
                    },
                });
                if (Array.isArray(body.prices) && body.prices.length > 0) {
                    await tx.tour_schedule_prices.createMany({
                        data: body.prices.map((price) => ({
                            tour_schedule_id: schedule.tour_schedule_id,
                            ...mapSchedulePrice(price),
                        })),
                    });
                }
                if (Array.isArray(body.itinerary) && body.itinerary.length > 0) {
                    await saveItineraryDays(tx, tourId, schedule.tour_schedule_id, body.itinerary);
                    const hotelEntries = body.itinerary
                        .map((itinerary, index) => mapScheduleHotel(itinerary, index, schedule.tour_schedule_id))
                        .filter((item): item is {
                        tour_schedule_id: number;
                        hotel_id: number;
                        room_type_id: number;
                        nights: number;
                        day_from: number;
                        day_to: number;
                        note: string | null;
                    } => item !== null);
                    if (hotelEntries.length > 0) {
                        await tx.tour_schedule_hotels.createMany({
                            data: hotelEntries,
                        });
                    }
                }
                return { ...updatedSchedule,
                    use_tour_amenities: body.use_tour_amenities ?? true,
                    tour_schedule_attractions: await tx.tour_schedule_attractions.findMany({ where: { tour_schedule_id: schedule.tour_schedule_id }, orderBy: { sort_order: 'asc' } }),
                    tour_schedule_amenities: await tx.tour_schedule_amenities.findMany({ where: { tour_schedule_id: schedule.tour_schedule_id }, orderBy: { sort_order: 'asc' } }),
                };
            });
            return mapScheduleResponse(result);
        }
        catch (error) {
            this.logger.error('[Create Schedule Error]', error);
            const prismaError = error as {
                code?: string;
                message?: string;
            };
            if (prismaError.code === 'P2003') {
                throw new BadRequestException('ID tour không hợp lệ hoặc dữ liệu liên quan bị lỗi.');
            }
            throw new BadRequestException(`Lỗi khi tạo lịch khởi hành: ${prismaError.message}`);
        }
    }
    async updateSchedule(scheduleId: number, body: ScheduleAdminPayload) {
        const existingSchedule = await this.prisma.tour_schedules.findUnique({
            where: { tour_schedule_id: scheduleId },
            include: {
                tours: { select: { name: true } },
                bookings: {
                    where: { status: { not: 'cancelled' } },
                    select: {
                        booking_id: true,
                        contact_email: true,
                        contact_name: true,
                    },
                },
            },
        });
        if (!existingSchedule) {
            throw new NotFoundException('Lịch khởi hành không tồn tại');
        }
        const now = new Date();
        const oldStartDate = new Date(existingSchedule.start_date);
        const oldEndDate = new Date(existingSchedule.end_date);
        const hasBookings = existingSchedule.bookings.length > 0;
        if (oldStartDate < now) {
            throw new BadRequestException('Không thể chỉnh sửa lịch trình đã khởi hành.');
        }
        if (hasBookings && body.quota !== undefined && body.quota !== null) {
            const newQuota = Number(body.quota);
            if (newQuota < existingSchedule.booked_count) {
                throw new BadRequestException(`Số lượng chỗ không được thấp hơn số khách đã đặt (${existingSchedule.booked_count}).`);
            }
            if (newQuota !== existingSchedule.quota &&
                newQuota <= existingSchedule.quota) {
                throw new BadRequestException(`Khi đã có khách đặt, số lượng chỗ chỉ được tăng lên hơn mức hiện tại (${existingSchedule.quota}).`);
            }
        }
        const nextStartDate = body.start_date
            ? new Date(body.start_date)
            : oldStartDate;
        const nextEndDate = body.end_date ? new Date(body.end_date) : oldEndDate;
        const shouldNotifyCustomers = hasBookings &&
            (nextStartDate.getTime() !== oldStartDate.getTime() ||
                nextEndDate.getTime() !== oldEndDate.getTime());
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // Coordinate with booking creation before changing departure/pickup data.
                await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${scheduleId} FOR UPDATE`;
                const current = await tx.tour_schedules.findUniqueOrThrow({
                    where: { tour_schedule_id: scheduleId },
                    include: { crew: true, pickup_points: { orderBy: { sort_order: 'asc' } }, _count: { select: { bookings: true } } },
                });
                const locationId = body.departure_location_id === undefined ? current.departure_location_id : departureId(body.departure_location_id);
                const pickupPoints = body.pickup_points === undefined ? undefined : normalizePickupPoints(body.pickup_points);
                const pickupsChanged = pickupPoints !== undefined && !pickupPointsEqual(current.pickup_points, pickupPoints);
                const datesChanged = (body.start_date !== undefined && new Date(body.start_date).getTime() !== current.start_date.getTime()) || (body.end_date !== undefined && new Date(body.end_date).getTime() !== current.end_date.getTime());
                if (current.crew.length && datesChanged) throw new BadRequestException('Chuyến đã có phân công nhân sự. Cần gỡ phân công trước khi đổi ngày giờ để kiểm tra lại lịch điều động.');
                if (current._count.bookings > 0 && (locationId !== current.departure_location_id || pickupsChanged)) {
                    throw new BadRequestException('Chuyến đã có đơn đặt: không thể thay đổi nơi xuất phát hoặc điểm đón.');
                }
                if (current._count.bookings > 0 && current.pickup_points.length > 0 &&
                    ((body.start_date !== undefined && new Date(body.start_date).getTime() !== current.start_date.getTime()) ||
                    (body.end_date !== undefined && new Date(body.end_date).getTime() !== current.end_date.getTime()))) {
                    throw new BadRequestException('Chuyến đã có đơn đặt và điểm đón: không thể đổi ngày giờ vì sẽ làm sai thời gian đón đã xác nhận.');
                }
                if (!await tx.locations.findUnique({ where: { location_id: locationId }, select: { location_id: true } })) {
                    throw new BadRequestException('Nơi xuất phát không tồn tại.');
                }
                await saveScheduleAmenities(tx, scheduleId, body);
                await saveScheduleAttractions(tx, current.tour_id, scheduleId, body.attraction_ids);
                if (pickupsChanged) {
                    await tx.schedule_pickup_points.deleteMany({ where: { tour_schedule_id: scheduleId } });
                    await tx.schedule_pickup_points.createMany({ data: pickupPoints!.map(point => ({ ...point, tour_schedule_id: scheduleId })) });
                }
                const schedule = await tx.tour_schedules.update({
                    where: { tour_schedule_id: scheduleId },
                    data: {
                        departure_location_id: locationId,
                        start_date: body.start_date ? new Date(body.start_date) : undefined,
                        end_date: body.end_date ? new Date(body.end_date) : undefined,
                        price: body.price != null ? validatePrice(body.price) : undefined,
                        quota: body.quota != null ? Number(body.quota) : undefined,
                        status: body.status != null ? Number(body.status) : undefined,
                        cover_image_url: body.cover_image_url ?? undefined,
                    },
                });
                if (Array.isArray(body.prices)) {
                    await tx.tour_schedule_prices.deleteMany({
                        where: { tour_schedule_id: scheduleId },
                    });
                    if (body.prices.length > 0) {
                        await tx.tour_schedule_prices.createMany({
                            data: body.prices.map((price) => ({
                                tour_schedule_id: scheduleId,
                                ...mapSchedulePrice(price),
                            })),
                        });
                    }
                }
                if (Array.isArray(body.itinerary)) {
                    await saveItineraryDays(tx, current.tour_id, scheduleId, body.itinerary);
                    await tx.tour_schedule_hotels.deleteMany({
                        where: { tour_schedule_id: scheduleId },
                    });
                    if (body.itinerary.length > 0) {
                        const hotelEntries = body.itinerary
                            .map((itinerary, index) => mapScheduleHotel(itinerary, index, scheduleId))
                            .filter((item): item is {
                            tour_schedule_id: number;
                            hotel_id: number;
                            room_type_id: number;
                            nights: number;
                            day_from: number;
                            day_to: number;
                            note: string | null;
                        } => item !== null);
                        if (hotelEntries.length > 0) {
                            await tx.tour_schedule_hotels.createMany({
                                data: hotelEntries,
                            });
                        }
                    }
                }
                return { ...schedule,
                    tour_schedule_attractions: await tx.tour_schedule_attractions.findMany({ where: { tour_schedule_id: scheduleId }, orderBy: { sort_order: 'asc' } }),
                    tour_schedule_amenities: await tx.tour_schedule_amenities.findMany({ where: { tour_schedule_id: scheduleId }, orderBy: { sort_order: 'asc' } }),
                };
            });
            if (shouldNotifyCustomers) {
                await Promise.allSettled(existingSchedule.bookings
                    .filter((booking) => booking.contact_email)
                    .map((booking) => this.mailService.sendScheduleUpdatedEmail({
                    email: booking.contact_email,
                    contactName: booking.contact_name,
                    bookingId: booking.booking_id,
                    tourName: existingSchedule.tours?.name || 'Tour',
                    oldStartDate,
                    newStartDate: nextStartDate,
                    oldEndDate,
                    newEndDate: nextEndDate,
                })));
            }
            return {
                ...mapScheduleResponse(result),
                notificationSent: shouldNotifyCustomers,
                hasBookings,
            };
        }
        catch (error) {
            this.logger.error('[Update Schedule Error]', error);
            const updateError = error as Error;
            throw new BadRequestException(`Lỗi khi cập nhật lịch khởi hành: ${updateError.message}`);
        }
    }
    async deleteSchedule(scheduleId: number) {
        if (await this.prisma.schedule_crew.count({ where: { tour_schedule_id: scheduleId } })) throw new BadRequestException('Cần gỡ phân công nhân sự trước khi xóa chuyến.');
        const bookingsCount = await this.prisma.bookings.count({
            where: { tour_schedule_id: scheduleId },
        });
        if (bookingsCount > 0) {
            throw new BadRequestException('Không thể xóa lịch trình đã có khách đặt.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.tour_itineraries.deleteMany({
                where: { tour_schedule_id: scheduleId },
            });
            await tx.tour_schedule_prices.deleteMany({
                where: { tour_schedule_id: scheduleId },
            });
            await tx.tour_schedule_hotels.deleteMany({
                where: { tour_schedule_id: scheduleId },
            });
            await tx.tour_schedule_transports.deleteMany({
                where: { tour_schedule_id: scheduleId },
            });
            return tx.tour_schedules.delete({
                where: { tour_schedule_id: scheduleId },
            });
        });
    }
}
