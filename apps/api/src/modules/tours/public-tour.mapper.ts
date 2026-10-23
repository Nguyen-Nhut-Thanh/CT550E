import type { PublicDestinationRecord, PublicScheduleRecord, PublicTourCardRecord } from 'shared';
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
export function buildCardSelect() {
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
            take: 5,
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
            },
            orderBy: { start_date: 'asc' as const },
            select: {
                tour_schedule_id: true,
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
    const cutOffHours = t.cut_off_hours || 24;
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
            if (flashDeal) {
                const discountValue = Number(flashDeal.discount_value);
                if (flashDeal.discount_type === 'percentage') {
                    salePrice = originalPrice * (1 - discountValue / 100);
                }
                else {
                    salePrice = originalPrice - discountValue;
                }
            }
            return {
                ...s,
                price: Math.round(salePrice),
                original_price: originalPrice,
                flash_deal: flashDeal,
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
        departure_location: t.departure_locations
            ? {
                location_id: t.departure_locations.location_id,
                name: t.departure_locations.name,
                slug: t.departure_locations.slug ?? null,
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
