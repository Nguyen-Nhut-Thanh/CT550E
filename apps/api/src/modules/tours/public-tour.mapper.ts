import type { PublicDestinationRecord, PublicScheduleRecord, PublicTourCardRecord } from 'shared';
import { applyDiscount } from 'shared';
import type { Prisma } from '@prisma/client';
export function fixMojibakeText(value?: string | null) {
    if (!value)
        return value ?? null;
    if (!/[ÃÆÅÄ]/.test(value)) {
        return value;
    }
    try {
        return Buffer.from(value, 'latin1').toString('utf8');
    }
    catch {
        return value;
    }
}
export function parseMoney(value?: string) {
    if (!value)
        return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0)
        return undefined;
    return parsed;
}
export function buildCardSelect(scheduleFilter: Prisma.tour_schedulesWhereInput = {}) {
    return {
        tour_id: true,
        code: true,
        name: true,
        summary: true,
        duration_days: true,
        duration_nights: true,
        base_price: true,
        tour_type: true,
        updated_at: true,
        cut_off_hours: true,
        departure_locations: {
            select: {
                location_id: true,
                name: true,
                slug: true,
            },
        },
        tour_images: {
            where: { is_cover: 1 },
            orderBy: { sort_order: 'asc' as const },
            take: 1,
            select: {
                image_url: true,
            },
        },
        tour_destinations: {
            orderBy: { visit_order: 'asc' as const },
            select: {
                visit_order: true,
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
            where: {
                status: 1,
                start_date: { gte: new Date() },
                ...scheduleFilter,
            },
            orderBy: { start_date: 'asc' as const },
            select: {
                tour_schedule_id: true,
                departure_location_id: true,
                departure_location: { select: { location_id: true, name: true, slug: true } },
                code: true,
                start_date: true,
                end_date: true,
                price: true,
                quota: true,
                booked_count: true,
                cover_image_url: true,
                flash_deals: {
                    where: {
                        status: 1,
                        start_date: { lte: new Date() },
                        end_date: { gte: new Date() },
                    },
                },
                schedule_promotions: true,
            },
        },
        transports: {
            select: {
                name: true,
                transport_type: true,
            },
        },
    };
}
export function formatTourCard(t: PublicTourCardRecord, options?: {
    onlyFlashDeal?: boolean;
}) {
    const now = new Date();
    const cutOffHours = t.cut_off_hours ?? 24;
    const onlyFlashDeal = options?.onlyFlashDeal === true;
    const schedules = Array.isArray(t.tour_schedules)
        ? t.tour_schedules
            .filter((s: PublicScheduleRecord) => {
            const departureDate = new Date(s.start_date);
            const diffMs = departureDate.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const isTimeValid = diffHours >= cutOffHours;
            const hasSpace = (s.quota || 0) > (s.booked_count || 0);
            if (onlyFlashDeal) {
                return isTimeValid && hasSpace && Boolean(s.flash_deals);
            }
            return isTimeValid && hasSpace;
        })
            .map((s: PublicScheduleRecord) => {
            const originalPrice = Number(s.price ?? 0);
            let salePrice = originalPrice;
            const flashDeal = s.flash_deals || null;
            let schedulePromotion = null;
            if (flashDeal) {
                const discountValue = Number(flashDeal.discount_value);
                salePrice = applyDiscount(originalPrice, flashDeal.discount_type, discountValue);
            } else if (s.schedule_promotions && s.schedule_promotions.is_active) {
                const p = s.schedule_promotions;
                const pStart = new Date(p.start_date);
                const pEnd = new Date(p.end_date);
                const hasSlot = p.max_slots === null || p.max_slots === undefined || p.used_slots < p.max_slots;
                if (pStart <= now && pEnd >= now && hasSlot) {
                    const discountValue = Number(p.discount_value);
                    salePrice = applyDiscount(originalPrice, p.discount_type, discountValue);
                    schedulePromotion = {
                        has_promotion: true,
                        promotion_title: p.title,
                        discount_type: p.discount_type,
                        discount_value: discountValue,
                        effective_price: Math.round(salePrice),
                        original_price: originalPrice,
                        is_active: p.is_active,
                        gift_description: p.gift_description,
                    };
                }
            }
            return {
                ...s,
                price: Math.round(salePrice),
                original_price: originalPrice,
                flash_deal: flashDeal,
                schedule_promotions: s.schedule_promotions || null,
                schedule_promotion: schedulePromotion,
            };
        })
        : [];
    if (schedules.length === 0)
        return null;
    const next_schedule = schedules[0] || null;
    return {
        tour_id: t.tour_id,
        code: next_schedule?.code || t.code,
        name: t.name,
        summary: t.summary ?? null,
        duration_days: t.duration_days,
        duration_nights: t.duration_nights,
        base_price: Number(t.base_price ?? 0),
        tour_type: t.tour_type,
        updated_at: t.updated_at,
        cover_image: next_schedule?.cover_image_url || t.tour_images?.[0]?.image_url || null,
        departure_location: next_schedule?.departure_location
            ? {
                location_id: next_schedule.departure_location.location_id,
                name: next_schedule.departure_location.name,
                slug: next_schedule.departure_location.slug ?? null,
            }
            : null,
        destinations: Array.isArray(t.tour_destinations)
            ? t.tour_destinations.map((item: PublicDestinationRecord) => ({
                visit_order: item.visit_order,
                location_id: item.locations?.location_id ?? null,
                name: item.locations?.name ?? null,
                slug: item.locations?.slug ?? null,
            }))
            : [],
        next_schedule,
        upcoming_schedules: schedules,
        transport: t.transports
            ? {
                name: t.transports.name,
                type: t.transports.transport_type,
            }
            : null,
        rating_avg: t.rating_avg != null ? Number(t.rating_avg) : null,
        rating_count: t.rating_count != null ? Number(t.rating_count) : 0,
    };
}
