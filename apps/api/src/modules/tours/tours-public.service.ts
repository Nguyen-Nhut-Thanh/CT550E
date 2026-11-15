import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { BestSellerStat, PublicItineraryRecord, PublicListParams, PublicScheduleRecord } from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { queryBestSellerStats } from './best-seller.helper';
import { buildCardSelect, fixMojibakeText, formatTourCard, parseMoney } from "./public-tour.mapper";
@Injectable()
export class ToursPublicService {
    constructor(private readonly prisma: PrismaService) { }
    private async getRatingsMap(ids: number[]) {
        if (!ids.length) {
            return new Map<number, {
                rating_avg: number;
                rating_count: number;
            }>();
        }
        const rows = await this.prisma.reviews.groupBy({
            by: ['tour_id'],
            where: { tour_id: { in: ids }, status: 1 },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return new Map<number, {
            rating_avg: number;
            rating_count: number;
        }>(rows.map((row) => [row.tour_id, {
            rating_avg: Number((row._avg.rating ?? 0).toFixed(1)),
            rating_count: row._count.rating,
        }]));
    }
    private async getBestSellerOrder(today: Date) {
        const activeSchedules = await this.prisma.tour_schedules.findMany({
            where: {
                status: 1,
                start_date: {
                    gte: today,
                },
                tours: {
                    status: 1,
                },
            },
            select: {
                tour_schedule_id: true,
                tour_id: true,
                quota: true,
                booked_count: true,
            },
        });
        const availableSchedules = activeSchedules.filter((schedule: any) => schedule.quota > schedule.booked_count);
        if (availableSchedules.length === 0) {
            return [];
        }
        const availableTourIds = new Set(availableSchedules.map((schedule: any) => schedule.tour_id));
        const bestSellerStats = await queryBestSellerStats(this.prisma);
        const rankedTourIds = bestSellerStats
            .filter((stat: any) => availableTourIds.has(stat.tour_id))
            .map((stat: any) => stat.tour_id);
        const missingAvailableTourIds = Array.from(availableTourIds).filter((tourId) => !rankedTourIds.includes(tourId));
        return [...rankedTourIds, ...missingAvailableTourIds];
    }
    async homeFeed() {
        const baseSelect = buildCardSelect();
        const itemsRaw = await this.prisma.tours.findMany({
            where: {
                status: 1,
                tour_schedules: {
                    some: {
                        status: 1,
                        start_date: { gte: new Date() },
                    },
                },
            },
            orderBy: { updated_at: 'desc' },
            take: 20,
            select: baseSelect,
        });
        const items = itemsRaw
            .map((t: any) => formatTourCard(t))
            .filter((t: any) => t !== null)
            .slice(0, 8);
        const ids = items.map((item: any) => item.tour_id);
        const ratingMap = await this.getRatingsMap(ids);
        return {
            featured: items.map((card: any) => {
                const rating = ratingMap.get(card.tour_id);
                const departureName = card.departure_location?.name ?? '';
                const destinationName = card.destinations?.[card.destinations.length - 1]?.name ?? '';
                return {
                    ...card,
                    rating_avg: rating?.rating_avg,
                    rating_count: rating?.rating_count,
                    route_text: departureName && destinationName
                        ? `${departureName} → ${destinationName}`
                        : card.name,
                    departure_name: departureName,
                    destination_name: destinationName,
                    start_date: card.next_schedule?.start_date ?? '',
                    hotel_name: 'Tiêu chuẩn',
                    transport_name: card.transport?.name ?? '',
                    transport_type: card.transport?.type ?? '',
                    image_url: card.cover_image,
                    link: `/tours/${card.tour_id}`,
                };
            }),
        };
    }
    async publicList(params: PublicListParams) {
        const today = new Date();
        const minPrice = parseMoney(params.min_price);
        const maxPrice = parseMoney(params.max_price);
        const take = Math.min(Math.max(Number(params.take || 20), 1), 50);
        const skip = Math.max(Number(params.skip || 0), 0);
        const where: Prisma.toursWhereInput = {
            status: 1,
        };
        if (params.tour_type === 'outbound' || params.tour_type === 'international') {
            where.tour_type = { in: ['outbound', 'international'] };
        } else if (params.tour_type === 'domestic') {
            where.tour_type = 'domestic';
        }
        const search = params.search?.trim();
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                {
                    tour_schedules: { some: { status: 1, start_date: { gte: today }, departure_location: { name: { contains: search, mode: 'insensitive' } } } },
                },
                {
                    tour_destinations: {
                        some: {
                            locations: {
                                name: { contains: search, mode: 'insensitive' },
                            },
                        },
                    },
                },
            ];
        }
        const destination = params.destination?.trim();
        if (destination) {
            const currentAnd = Array.isArray(where.AND)
                ? where.AND
                : where.AND
                    ? [where.AND]
                    : [];
            where.AND = [
                ...currentAnd,
                {
                    tour_destinations: {
                        some: {
                            locations: {
                                OR: [
                                    { name: { contains: destination, mode: 'insensitive' } },
                                    { slug: { equals: destination } },
                                ],
                            },
                        },
                    },
                },
            ];
        }
        const scheduleFilter: Prisma.tour_schedulesWhereInput = {
            status: 1,
            start_date: { gte: today },
        };
        if (params.departure_location && Number.isSafeInteger(Number(params.departure_location))) {
            scheduleFilter.departure_location_id = Number(params.departure_location);
        }
        if (params.date_from && !Number.isNaN(Date.parse(params.date_from))) {
            scheduleFilter.start_date = { gte: new Date(Math.max(today.getTime(), Date.parse(params.date_from))) };
        }
        if (minPrice != null || maxPrice != null) {
            scheduleFilter.price = {};
            if (minPrice != null) {
                scheduleFilter.price.gte = minPrice;
            }
            if (maxPrice != null) {
                scheduleFilter.price.lte = maxPrice;
            }
        }
        if (params.deal === 'flash') {
            scheduleFilter.flash_deals = {
                status: 1,
                start_date: { lte: new Date() },
                end_date: { gte: new Date() },
            };
        }
        where.tour_schedules = {
            some: scheduleFilter,
        };
        const itemsRaw = await this.prisma.tours.findMany({
            where,
            orderBy: params.collection === 'bestseller' ? undefined : { updated_at: 'desc' },
            select: buildCardSelect(scheduleFilter),
        });
        const items = itemsRaw
            .map((t: any) => formatTourCard(t, { onlyFlashDeal: params.deal === 'flash' }))
            .filter((t): t is NonNullable<typeof t> => t !== null);
        const resolvedItems = params.collection === 'bestseller'
            ? await (async () => {
                const bestSellerOrder = new Map<number, number>();
                const bestSellerTourIds = await this.getBestSellerOrder(today);
                bestSellerTourIds.forEach((tourId, index) => {
                    bestSellerOrder.set(tourId, index);
                });
                return [...items].sort((left, right) => {
                    const leftRank = bestSellerOrder.get(left.tour_id);
                    const rightRank = bestSellerOrder.get(right.tour_id);
                    if (leftRank != null && rightRank != null) {
                        return leftRank - rightRank;
                    }
                    if (leftRank != null)
                        return -1;
                    if (rightRank != null)
                        return 1;
                    return 0;
                });
            })()
            : params.collection === 'nearest'
                ? [...items].sort((left: any, right: any) => {
                    const leftDate = left.next_schedule?.start_date ? new Date(left.next_schedule.start_date).getTime() : Number.MAX_SAFE_INTEGER;
                    const rightDate = right.next_schedule?.start_date ? new Date(right.next_schedule.start_date).getTime() : Number.MAX_SAFE_INTEGER;
                    return leftDate - rightDate;
                })
                : items;
        const paginatedItems = resolvedItems.slice(skip, skip + take);
        const ids = paginatedItems.map((item: any) => item.tour_id);
        const ratingMap = await this.getRatingsMap(ids);
        return {
            items: paginatedItems.map((card: any) => {
                const rating = ratingMap.get(card.tour_id);
                return {
                    ...card,
                    rating_avg: rating?.rating_avg ?? card.rating_avg,
                    rating_count: rating?.rating_count ?? card.rating_count,
                };
            }),
            total: resolvedItems.length,
            take,
            skip,
            filters: {
                search: params.search ?? '',
                destination: params.destination ?? '',
                departure_location: params.departure_location ?? '',
                date_from: params.date_from ?? '',
                min_price: params.min_price ?? '',
                max_price: params.max_price ?? '',
                collection: params.collection ?? '',
                tour_type: params.tour_type ?? '',
            },
        };
    }
    async publicDetail(tourId: number) {
        const tour = await this.prisma.tours.findFirst({
            where: {
                tour_id: tourId,
                status: 1,
            },
            select: {
                tour_id: true,
                code: true,
                name: true,
                summary: true,
                description: true,
                duration_days: true,
                duration_nights: true,
                base_price: true,
                tour_type: true,
                rating_avg: true,
                rating_count: true,
                tour_amenities: { orderBy: { sort_order: 'asc' }, select: { amenity_id: true, kind: true, title: true, content: true, sort_order: true } },
                cut_off_hours: true,
                departure_locations: {
                    select: {
                        location_id: true,
                        name: true,
                        slug: true,
                    },
                },
                transports: {
                    select: {
                        name: true,
                        transport_type: true,
                    },
                },
                tour_images: {
                    orderBy: { sort_order: 'asc' },
                    select: {
                        image_id: true,
                        image_url: true,
                        is_cover: true,
                        sort_order: true,
                    },
                },
                tour_destinations: {
                    orderBy: { visit_order: 'asc' },
                    select: {
                        visit_order: true,
                        note: true,
                        locations: {
                            select: {
                                location_id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                tour_schedules: {
                    where: { status: 1, start_date: { gte: new Date() } },
                    orderBy: { start_date: 'asc' },
                    select: {
                        tour_schedule_id: true,
                        departure_location_id: true,
                        tour_schedule_amenities: { orderBy: { sort_order: 'asc' }, select: { kind: true, title: true, content: true, sort_order: true, is_visible: true } },
                        departure_location: { select: { location_id: true, name: true, slug: true } },
                        pickup_points: { orderBy: { sort_order: 'asc' }, select: { pickup_point_id: true, name: true, address: true, pickup_at: true, sort_order: true, note: true } },
                        start_date: true,
                        end_date: true,
                        price: true,
                        quota: true,
                        booked_count: true,
                        tour_schedule_transports: {
                            orderBy: [{ day_from: 'asc' }, { schedule_transport_id: 'asc' }],
                            select: {
                                schedule_transport_id: true, transport_role: true, day_from: true, day_to: true, note: true,
                                transports: { select: { name: true, transport_type: true, description: true } },
                            },
                        },
                        flash_deals: {
                            where: {
                                status: 1,
                                start_date: { lte: new Date() },
                                end_date: { gte: new Date() },
                            },
                        },
                        schedule_promotions: true,
                        tour_schedule_attractions: {
                            orderBy: { sort_order: 'asc' },
                            select: {
                                location_id: true, sort_order: true,
                                location: { select: {
                                    location_id: true, parent_id: true, name: true, note: true,
                                    location_images: { where: { status: 1 }, orderBy: [{ is_cover: 'desc' }, { sort_order: 'asc' }], take: 1, select: { image_url: true } },
                                } },
                            },
                        },
                        tour_itineraries: {
                            orderBy: { day_number: 'asc' },
                            select: {
                                day_number: true,
                                title: true,
                                content: true,
                                image_url: true,
                                meals: true,
                                activities: {
                                    orderBy: { sort_order: 'asc' },
                                    select: {
                                        time: true, title: true, description: true, location_id: true,
                                        location: { select: {
                                            location_id: true, parent_id: true, name: true, note: true, featured_image: true,
                                            location_images: { where: { status: 1 }, orderBy: [{ is_cover: 'desc' }, { sort_order: 'asc' }], take: 1, select: { image_url: true } },
                                        } },
                                    },
                                },
                            },
                        },
                        tour_schedule_prices: {
                            select: {
                                passenger_type: true,
                                price: true,
                                currency: true,
                                note: true,
                            },
                        },
                        tour_schedule_hotels: {
                            orderBy: { day_from: 'asc' },
                            select: {
                                schedule_hotel_id: true,
                                hotel_id: true,
                                room_type_id: true,
                                nights: true,
                                day_from: true,
                                day_to: true,
                                note: true,
                                hotels: {
                                    select: {
                                        hotel_id: true,
                                        name: true,
                                        star_rating: true,
                                        address: true,
                                        description: true,
                                    },
                                },
                                hotel_room_types: {
                                    select: {
                                        room_type_id: true,
                                        name: true,
                                        base_price: true,
                                        extra_price: true,
                                    },
                                },
                            },
                        },
                    },
                },
                reviews: {
                    where: { status: 1 },
                    orderBy: { created_at: 'desc' },
                    take: 20,
                    select: {
                        review_id: true,
                        rating: true,
                        title: true,
                        comment: true,
                        images: true,
                        likes_count: true,
                        created_at: true,
                        user_id: true,
                        users: {
                            select: {
                                user_id: true,
                                full_name: true,
                                avatar_url: true,
                            },
                        },
                        review_replies: {
                            where: { status: 1 },
                            orderBy: { created_at: 'asc' },
                            include: {
                                users: {
                                    select: {
                                        user_id: true,
                                        full_name: true,
                                        avatar_url: true,
                                    },
                                },
                            },
                        },
                    },
                },
                tour_policies: {
                    orderBy: { policy_id: 'asc' },
                    select: {
                        policy_id: true,
                        policy_type: true,
                        content: true,
                    },
                },
            },
        });
        if (!tour) {
            throw new NotFoundException('Tour not found');
        }
        const now = new Date();
        const cutOffHours = tour.cut_off_hours ?? 24;
        const processedSchedules = tour.tour_schedules
            .filter((s: PublicScheduleRecord) => {
            const departureDate = new Date(s.start_date);
            const diffHours = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            const isTimeValid = diffHours >= cutOffHours;
            const hasSpace = (s.quota || 0) > (s.booked_count || 0);
            return isTimeValid && hasSpace;
        })
            .map((s: PublicScheduleRecord) => {
            const originalPrice = Number(s.price || 0);
            let effectivePrice = originalPrice;
            const flashDeal = s.flash_deals;
            let schedulePromotion = null;
            if (flashDeal) {
                if (flashDeal.discount_type === 'percentage') {
                    effectivePrice =
                        originalPrice * (1 - Number(flashDeal.discount_value) / 100);
                }
                else {
                    effectivePrice = originalPrice - Number(flashDeal.discount_value);
                }
            } else if (s.schedule_promotions && s.schedule_promotions.is_active) {
                const p = s.schedule_promotions;
                const pStart = new Date(p.start_date);
                const pEnd = new Date(p.end_date);
                const hasSlot = p.max_slots === null || p.max_slots === undefined || p.used_slots < p.max_slots;
                if (pStart <= now && pEnd >= now && hasSlot) {
                    const discountVal = Number(p.discount_value);
                    if (p.discount_type === 'percentage') {
                        effectivePrice = Math.max(0, originalPrice * (1 - discountVal / 100));
                    } else {
                        effectivePrice = Math.max(0, originalPrice - discountVal);
                    }
                    schedulePromotion = {
                        has_promotion: true,
                        promotion_title: p.title,
                        discount_type: p.discount_type,
                        discount_value: discountVal,
                        effective_price: Math.round(effectivePrice),
                        original_price: originalPrice,
                        is_active: p.is_active,
                        gift_description: p.gift_description,
                    };
                }
            }
            return {
                ...s,
                original_price: originalPrice,
                price: Math.round(effectivePrice),
                flash_deal: flashDeal,
                schedule_promotions: s.schedule_promotions || null,
                schedule_promotion: schedulePromotion,
                tour_itineraries: s.tour_itineraries?.map((item: PublicItineraryRecord) => ({
                    ...item,
                    title: fixMojibakeText(item.title),
                    content: fixMojibakeText(item.content),
                    meals: fixMojibakeText(item.meals),
                })),
                tour_schedule_hotels: s.tour_schedule_hotels?.map((item) => ({
                    ...item,
                    nights: Number(item.nights || 1),
                    hotel_id: Number(item.hotel_id),
                    room_type_id: Number(item.room_type_id),
                    hotel_room_types: item.hotel_room_types
                        ? {
                            ...item.hotel_room_types,
                            base_price: Number(item.hotel_room_types.base_price || 0),
                            extra_price: Number(item.hotel_room_types.extra_price || 0),
                        }
                        : null,
                })),
            };
        });

        const ratingGroups = await this.prisma.reviews.groupBy({
            by: ['rating'],
            where: { tour_id: tourId, status: 1 },
            _count: { _all: true },
        });
        const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let reviewsCount = 0;
        let ratingTotal = 0;
        for (const group of ratingGroups) {
            const stars = Math.min(5, Math.max(1, Math.round(Number(group.rating) || 5)));
            const count = group._count._all;
            starCounts[stars] += count;
            reviewsCount += count;
            ratingTotal += stars * count;
        }
        const rating_breakdown = ([5, 4, 3, 2, 1] as const).map((stars) => ({
            stars,
            count: starCounts[stars] || 0,
            percent: reviewsCount > 0 ? Math.round(((starCounts[stars] || 0) / reviewsCount) * 100) : 0,
        }));

        const calculatedAvg = reviewsCount > 0
            ? Number((ratingTotal / reviewsCount).toFixed(1))
            : 5;

        return {
            ...tour,
            rating_avg: calculatedAvg,
            rating_count: reviewsCount,
            rating_breakdown,
            reviews: tour.reviews.map((r: any) => ({
                review_id: r.review_id,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                images: Array.isArray(r.images) ? r.images : r.images ? [String(r.images)] : [],
                likes_count: r.likes_count,
                created_at: r.created_at.toISOString(),
                user_id: r.user_id,
                user: {
                    user_id: r.users?.user_id,
                    full_name: r.users?.full_name || 'Khách hàng',
                    avatar_url: r.users?.avatar_url || null,
                },
                users: {
                    user_id: r.users?.user_id,
                    full_name: r.users?.full_name || 'Khách hàng',
                    avatar_url: r.users?.avatar_url || null,
                },
                replies: (r.review_replies || []).map((reply: any) => ({
                    reply_id: reply.reply_id,
                    content: reply.content,
                    created_at: reply.created_at.toISOString(),
                    user: {
                        user_id: reply.users?.user_id,
                        full_name: reply.users?.full_name || 'JourniTrip',
                        avatar_url: reply.users?.avatar_url || null,
                    },
                })),
                review_replies: (r.review_replies || []).map((reply: any) => ({
                    reply_id: reply.reply_id,
                    content: reply.content,
                    created_at: reply.created_at.toISOString(),
                    user: {
                        user_id: reply.users?.user_id,
                        full_name: reply.users?.full_name || 'JourniTrip',
                        avatar_url: reply.users?.avatar_url || null,
                    },
                })),
            })),
            tour_schedules: processedSchedules,
        };
    }
}
