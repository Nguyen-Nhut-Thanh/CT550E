import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { TourAdminPayload, TourListParams } from 'shared';
import { requireFields } from "../../common/validation/payload";
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ensureMutableFieldChangeAllowed, normalizeDestinationIds, normalizePolicyEntries } from "./tour-input";
import { getTourCountries, tourCountrySelect } from './tour-list';
@Injectable()
export class ToursAdminService {
    constructor(private readonly prisma: PrismaService) { }
    private async getTourOrThrow(id: number) {
        const tour = await this.prisma.tours.findUnique({
            where: { tour_id: id },
        });
        if (!tour) {
            throw new NotFoundException('Tour not found');
        }
        return tour;
    }
    private async getTourWithAdminRelationsOrThrow(id: number) {
        const tour = await this.prisma.tours.findUnique({
            where: { tour_id: id },
            include: {
                tour_destinations: {
                    include: {
                        locations: true,
                    },
                    orderBy: { visit_order: 'asc' },
                },
                tour_images: {
                    orderBy: { sort_order: 'asc' },
                },
                tour_schedules: {
                    select: {
                        tour_schedule_id: true,
                        _count: {
                            select: {
                                bookings: true,
                            },
                        },
                    },
                },
                departure_locations: true,
                transports: true,
                tour_policies: {
                    orderBy: { policy_id: 'asc' },
                },
            },
        });
        if (!tour) {
            throw new NotFoundException('Tour not found');
        }
        return tour;
    }
    private async countTourBookings(scheduleIds: number[]) {
        if (scheduleIds.length === 0) {
            return 0;
        }
        return this.prisma.bookings.count({
            where: { tour_schedule_id: { in: scheduleIds } },
        });
    }
    async detail(id: number) {
        const tour = await this.getTourWithAdminRelationsOrThrow(id);
        return { tour };
    }
    async list(params: TourListParams) {
        const where: Record<string, unknown> = {};
        if (params.search) {
            where.OR = [
                { code: { contains: params.search, mode: 'insensitive' } },
                { name: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.status === '0' || params.status === '1') {
            where.status = Number(params.status);
        }
        const items = await this.prisma.tours.findMany({
            where,
            orderBy: { updated_at: 'desc' },
            select: {
                tour_id: true,
                code: true,
                name: true,
                duration_days: true,
                tour_type: true,
                base_price: true,
                status: true,
                updated_at: true,
                duration_nights: true,
                summary: true,
                tour_destinations: {
                    select: { locations: { select: tourCountrySelect } },
                },
                tour_schedules: {
                    select: { _count: { select: { bookings: { where: { status: { not: 'cancelled' } } } } } },
                },
                tour_images: {
                    orderBy: { sort_order: 'asc' },
                    take: 1,
                    select: {
                        image_url: true,
                    },
                },
            },
        });
        return {
            items: items.map(({ tour_destinations, tour_schedules, ...tour }) => ({
                ...tour,
                countries: getTourCountries(tour_destinations),
                booked_count: tour_schedules.reduce((count, schedule) => count + schedule._count.bookings, 0),
            })),
        };
    }
    async create(body: TourAdminPayload) {
        requireFields(body as Record<string, unknown>, [
            'code',
            'name',
            'description',
            'duration_days',
            'departure_location',
            'transport_id',
        ]);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const tour = await tx.tours.create({
                    data: {
                        code: String(body.code).trim(),
                        name: String(body.name).trim(),
                        summary: body.summary ?? null,
                        description: String(body.description),
                        duration_days: Number(body.duration_days),
                        duration_nights: Number(body.duration_nights ?? 0),
                        base_price: Number(body.base_price ?? 0),
                        tour_type: body.tour_type ?? 'domestic',
                        departure_location: Number(body.departure_location),
                        transport_id: Number(body.transport_id),
                        status: body.status != null ? Number(body.status) : 1,
                        sightseeing_summary: body.sightseeing_summary ?? null,
                        cuisine_info: body.cuisine_info ?? null,
                        best_for: body.best_for ?? null,
                        best_time: body.best_time ?? null,
                        transport_info: body.transport_info ?? null,
                        promotion_info: body.promotion_info ?? null,
                    },
                });
                const policyEntries = normalizePolicyEntries(body.policy_contents);
                if (policyEntries.length > 0) {
                    await tx.tour_policies.createMany({
                        data: policyEntries.map((entry) => ({
                            tour_id: tour.tour_id,
                            policy_type: entry.policy_type,
                            content: entry.content,
                        })),
                    });
                }
                const destinationIds = normalizeDestinationIds(body.destinations);
                if (destinationIds.length > 0) {
                    await tx.tour_destinations.createMany({
                        data: destinationIds.map((locationId, index) => ({
                            tour_id: tour.tour_id,
                            location_id: locationId,
                            visit_order: index + 1,
                        })),
                    });
                }
                if (Array.isArray(body.images) && body.images.length > 0) {
                    await tx.tour_images.createMany({
                        data: body.images.map((url, index) => ({
                            tour_id: tour.tour_id,
                            image_url: url,
                            is_cover: index === 0 ? 1 : 0,
                            sort_order: index + 1,
                        })),
                    });
                }
                return tour;
            });
        }
        catch (error) {
            const prismaError = error as {
                code?: string;
            };
            if (prismaError.code === 'P2002') {
                throw new BadRequestException('Mã tour đã tồn tại trên hệ thống.');
            }
            if (prismaError.code === 'P2003') {
                throw new BadRequestException('Điểm khởi hành hoặc phương tiện không hợp lệ.');
            }
            throw error;
        }
    }
    async update(id: number, body: TourAdminPayload) {
        const tour = await this.prisma.tours.findUnique({
            where: { tour_id: id },
            include: {
                tour_schedules: {
                    select: { tour_schedule_id: true },
                },
                tour_destinations: {
                    select: { location_id: true },
                    orderBy: { visit_order: 'asc' },
                },
            },
        });
        if (!tour) {
            throw new NotFoundException('Tour không tồn tại');
        }
        const scheduleIds = tour.tour_schedules.map((schedule) => schedule.tour_schedule_id);
        const totalBookings = await this.countTourBookings(scheduleIds);
        if (totalBookings > 0) {
            const lockedFields: Array<keyof TourAdminPayload> = [
                'code',
                'name',
                'duration_days',
                'duration_nights',
                'tour_type',
                'departure_location',
            ];
            for (const field of lockedFields) {
                ensureMutableFieldChangeAllowed(field, tour[field as keyof typeof tour], body[field], totalBookings);
            }
            if (Array.isArray(body.destinations)) {
                const currentDestinations = tour.tour_destinations
                    .map((item) => item.location_id)
                    .sort((a, b) => a - b);
                const nextDestinations = normalizeDestinationIds(body.destinations).sort((a, b) => a - b);
                const destinationsChanged = currentDestinations.length !== nextDestinations.length ||
                    currentDestinations.some((value, index) => value !== nextDestinations[index]);
                if (destinationsChanged) {
                    throw new BadRequestException('Không thể thay đổi danh sách điểm đến vì tour này đã có booking.');
                }
            }
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const updatedTour = await tx.tours.update({
                    where: { tour_id: id },
                    data: {
                        name: body.name ?? undefined,
                        summary: body.summary ?? undefined,
                        description: body.description ?? undefined,
                        duration_days: body.duration_days != null
                            ? Number(body.duration_days)
                            : undefined,
                        duration_nights: body.duration_nights != null
                            ? Number(body.duration_nights)
                            : undefined,
                        base_price: body.base_price != null ? Number(body.base_price) : undefined,
                        tour_type: body.tour_type ?? undefined,
                        departure_location: body.departure_location != null
                            ? Number(body.departure_location)
                            : undefined,
                        transport_id: body.transport_id != null ? Number(body.transport_id) : undefined,
                        sightseeing_summary: body.sightseeing_summary ?? undefined,
                        cuisine_info: body.cuisine_info ?? undefined,
                        best_for: body.best_for ?? undefined,
                        best_time: body.best_time ?? undefined,
                        transport_info: body.transport_info ?? undefined,
                        promotion_info: body.promotion_info ?? undefined,
                    },
                });
                if (body.policy_contents && typeof body.policy_contents === 'object') {
                    await tx.tour_policies.deleteMany({
                        where: { tour_id: id },
                    });
                    const policyEntries = normalizePolicyEntries(body.policy_contents);
                    if (policyEntries.length > 0) {
                        await tx.tour_policies.createMany({
                            data: policyEntries.map((entry) => ({
                                tour_id: id,
                                policy_type: entry.policy_type,
                                content: entry.content,
                            })),
                        });
                    }
                }
                if (Array.isArray(body.destinations)) {
                    const destinationIds = normalizeDestinationIds(body.destinations);
                    await tx.tour_destinations.deleteMany({ where: { tour_id: id } });
                    await tx.tour_destinations.createMany({
                        data: destinationIds.map((locationId, index) => ({
                            tour_id: id,
                            location_id: locationId,
                            visit_order: index + 1,
                        })),
                    });
                }
                if (Array.isArray(body.images)) {
                    await tx.tour_images.deleteMany({ where: { tour_id: id } });
                    await tx.tour_images.createMany({
                        data: body.images.map((url, index) => ({
                            tour_id: id,
                            image_url: url,
                            is_cover: index === 0 ? 1 : 0,
                            sort_order: index + 1,
                        })),
                    });
                }
                return updatedTour;
            });
        }
        catch (error) {
            const prismaError = error as {
                code?: string;
            };
            if (prismaError.code === 'P2002') {
                throw new BadRequestException('Mã tour đã tồn tại trên hệ thống.');
            }
            if (prismaError.code === 'P2003') {
                throw new BadRequestException('Thông tin điểm đến hoặc phương tiện không hợp lệ.');
            }
            throw error;
        }
    }
    async toggleStatus(id: number) {
        const tour = await this.getTourOrThrow(id);
        const nextStatus = tour.status === 1 ? 0 : 1;
        return this.prisma.tours.update({
            where: { tour_id: id },
            data: { status: nextStatus },
            select: { tour_id: true, status: true },
        });
    }
    async deleteTour(id: number) {
        const tour = await this.prisma.tours.findUnique({
            where: { tour_id: id },
            include: {
                tour_schedules: {
                    select: { tour_schedule_id: true },
                },
            },
        });
        if (!tour) {
            throw new NotFoundException('Tour không tồn tại');
        }
        const scheduleIds = tour.tour_schedules.map((schedule) => schedule.tour_schedule_id);
        const bookingsCount = await this.countTourBookings(scheduleIds);
        if (bookingsCount > 0) {
            throw new BadRequestException('Không thể xóa tour vì đã có lịch khởi hành phát sinh booking.');
        }
        return this.prisma.$transaction(async (tx) => {
            if (scheduleIds.length > 0) {
                await tx.tour_itineraries.deleteMany({
                    where: { tour_schedule_id: { in: scheduleIds } },
                });
                await tx.tour_schedule_prices.deleteMany({
                    where: { tour_schedule_id: { in: scheduleIds } },
                });
                await tx.tour_schedule_hotels.deleteMany({
                    where: { tour_schedule_id: { in: scheduleIds } },
                });
                await tx.tour_schedule_transports.deleteMany({
                    where: { tour_schedule_id: { in: scheduleIds } },
                });
                await tx.tour_schedules.deleteMany({
                    where: { tour_schedule_id: { in: scheduleIds } },
                });
            }
            await tx.favorites.deleteMany({ where: { tour_id: id } });
            await tx.reviews.deleteMany({ where: { tour_id: id } });
            await tx.tour_destinations.deleteMany({ where: { tour_id: id } });
            await tx.tour_images.deleteMany({ where: { tour_id: id } });
            await tx.tour_policies.deleteMany({ where: { tour_id: id } });
            return tx.tours.delete({
                where: { tour_id: id },
            });
        });
    }
}
