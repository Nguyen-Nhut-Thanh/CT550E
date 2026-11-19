import type { PublicDestinationRecord, PublicScheduleRecord, PublicTourCardRecord } from 'shared';
import { applyDiscount, calculateSchedulePricing } from 'shared';
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
export function filterAndPriceSchedules<T extends PublicScheduleRecord>(
    schedules: T[] | undefined | null,
    cutOffHours?: number | null,
    options?: { now?: Date; onlyFlashDeal?: boolean; includeSoldOut?: boolean },
) {
    const now = options?.now ?? new Date();
    const minHours = cutOffHours ?? 24;
    const onlyFlashDeal = options?.onlyFlashDeal === true;
    const includeSoldOut = options?.includeSoldOut === true;
    if (!Array.isArray(schedules)) return [];

    return schedules
        .filter((s: T) => {
            const departureDate = new Date(s.start_date);
            const diffHours = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            const isTimeValid = diffHours >= minHours;
            const hasSpace = (s.quota || 0) > (s.booked_count || 0);
            if (onlyFlashDeal) {
                return isTimeValid && (hasSpace || includeSoldOut) && Boolean(s.flash_deals);
            }
            return isTimeValid && (hasSpace || includeSoldOut);
        })
        .map((s: T) => {
            const pricing = calculateSchedulePricing(s, now);
            const promo = pricing.flash_deals
              ? { type: pricing.flash_deals.discount_type, value: Number(pricing.flash_deals.discount_value) }
              : pricing.schedule_promotions
                ? { type: pricing.schedule_promotions.discount_type, value: Number(pricing.schedule_promotions.discount_value) }
                : null;

            const updatedPrices = promo && Array.isArray((s as any).tour_schedule_prices)
              ? (s as any).tour_schedule_prices.map((p: any) => {
                  const pType = String(p.passenger_type || '').toUpperCase();
                  if (pType === 'ADULT' || pType === 'CHILD') {
                    const base = Number(p.price || 0);
                    if (base > 0) {
                      return {
                        ...p,
                        price: applyDiscount(base, promo.type, promo.value),
                        original_price: base,
                      };
                    }
                  }
                  return p;
                })
              : (s as any).tour_schedule_prices;

            return {
                ...s,
                price: pricing.effectivePrice,
                original_price: pricing.originalPrice,
                single_room_surcharge:
                  (s as any).single_room_surcharge != null
                    ? Number((s as any).single_room_surcharge)
                    : 0,
                flash_deals: pricing.flash_deals,
                schedule_promotions: pricing.schedule_promotions,
                ...(updatedPrices ? { tour_schedule_prices: updatedPrices } : {}),
            };
        });
}

export function formatTourCard(t: PublicTourCardRecord, options?: {
    onlyFlashDeal?: boolean;
}) {
    const schedules = filterAndPriceSchedules(t.tour_schedules, t.cut_off_hours, {
        onlyFlashDeal: options?.onlyFlashDeal,
    });
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
