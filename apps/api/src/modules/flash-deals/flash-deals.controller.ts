import { Controller, Get, Query } from "@nestjs/common";
import { prisma } from "database";

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Controller("public")
export class FlashDealsController {
  @Get("flash-deals")
  async getFlashDeals(@Query("limit") limitParam?: string) {
    const limit = Math.min(Math.max(Number(limitParam) || 8, 1), 20);
    const now = new Date();
    const deals = await prisma.flash_deals.findMany({
      where: {
        status: 1,
        start_date: { lte: now },
        end_date: { gte: now },
        tour_schedules: {
          status: 1,
          start_date: { gte: now }
        }
      },
      include: {
        tour_schedules: {
          include: {
            tours: {
              include: {
                departure_locations: true,
                transports: true,
                tour_images: {
                  where: { is_cover: 1 },
                  take: 1
                }
              }
            },
            tour_schedule_prices: {
              where: { passenger_type: "adult" },
              take: 1
            }
          }
        }
      },
      orderBy: { end_date: "asc" },
      take: limit
    });

    const items = deals.map((deal) => {
      const schedule = deal.tour_schedules;
      const tour = schedule.tours;
      const originalPrice = toNumber(
        schedule.tour_schedule_prices[0]?.price ?? schedule.price
      );
      const discountValue = toNumber(deal.discount_value);
      const salePrice =
        deal.discount_type === "percentage"
          ? Math.round((originalPrice * (1 - discountValue / 100)) / 1000) * 1000
          : originalPrice - discountValue;
      const seatsLeft = Math.max(schedule.quota - schedule.booked_count, 0);
      const slug = slugify(tour.name);

      return {
        schedule_id: schedule.tour_schedule_id,
        tour_id: tour.tour_id,
        code: schedule.code || tour.code,
        name: tour.name,
        slug,
        cover_image_url: schedule.cover_image_url || tour.tour_images[0]?.image_url || null,
        image_url: tour.tour_images[0]?.image_url || null,
        departure_name: tour.departure_locations.name,
        start_date: schedule.start_date.toISOString(),
        end_date: schedule.end_date.toISOString(),
        duration_text: `${tour.duration_days}N${tour.duration_nights}Đ`,
        original_price: originalPrice,
        sale_price: salePrice,
        seats_left: seatsLeft,
        discount_percent:
          deal.discount_type === "percentage"
            ? discountValue
            : originalPrice > 0
              ? Math.round((discountValue / originalPrice) * 100)
              : 0,
        countdown_to: deal.end_date.toISOString(),
        link: `/tours/${tour.tour_id}-${slug}`,
        promotion_info: tour.promotion_info || null,
        transport_type: tour.transports.name
      };
    });

    return {
      items,
      total: items.length,
      fetched_at: new Date().toISOString()
    };
  }
}
