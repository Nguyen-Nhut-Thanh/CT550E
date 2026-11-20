import { Injectable } from "@nestjs/common";
import { TOUR_POLICY_DEFINITIONS } from "shared";
import type { AiChatTour, AiChatTourReference, TourIntent } from "shared";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { calculateBookingTourPrice, type Party } from "../bookings/helpers/booking-tour-price";

const hour = 3_600_000;

const formatDate = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
export const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency", currency: "VND", maximumFractionDigits: 0,
});

function plain(value?: string | null, limit = 280) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim().slice(0, limit);
}

function normalize(value?: string | null) {
  return plain(value, 3000).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim();
}

function contains(text: string, term: string) {
  return !term || ` ${text} `.includes(` ${term} `);
}

@Injectable()
export class AiChatTours {
  constructor(private readonly prisma: PrismaService) {}

  async find(intent: TourIntent, reference?: AiChatTourReference, party?: Party) {
    const now = new Date();
    const from = intent.departure_from ? new Date(`${intent.departure_from}T00:00:00+07:00`) : now;
    const until = intent.departure_until
      ? new Date(Date.parse(`${intent.departure_until}T00:00:00+07:00`) + 24 * hour)
      : undefined;
    const minStart = from > now ? from : now;
    const partySize = party ? party.adults + party.children + party.infants : 1;
    const destination = normalize(intent.destination);
    const departure = normalize(intent.departure);
    const tourName = normalize(intent.tour_name);
    const themes = intent.themes.map(normalize).filter(Boolean);
    const wantsDeals = intent.intent === "offers" && !intent.voucher_code;
    const publicDealsOnly = wantsDeals &&
      !reference && !destination && !departure && !tourName && !intent.departure_from && !intent.departure_until;
    const results = await this.prisma.tour_schedules.findMany({
      where: {
        status: 1,
        tour_id: reference?.tourId,
        tour_schedule_id: intent.change_departure ? undefined : reference?.scheduleId,
        start_date: { gte: minStart, lt: until },
        quota: { gt: this.prisma.tour_schedules.fields.booked_count },
        tours: { status: 1, duration_days: intent.duration_days ?? undefined },
      },
      orderBy: [{ start_date: "asc" }, { tour_schedule_id: "asc" }],
      select: {
        tour_schedule_id: true,
        start_date: true,
        price: true,
        quota: true,
        booked_count: true,
        cover_image_url: true,
        departure_location: { select: { name: true, slug: true } },
        flash_deals: { where: { status: 1, start_date: { lte: now }, end_date: { gte: now } } },
        schedule_promotions: true,
        tour_schedule_prices: { select: { passenger_type: true, price: true } },
        tours: {
          select: {
            tour_id: true, name: true, code: true, tour_type: true, summary: true, description: true,
            best_for: true, best_time: true, cut_off_hours: true,
            duration_days: true, duration_nights: true,
            transports: { select: { name: true } },
            tour_images: {
              orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }],
              take: 1,
              select: { image_url: true },
            },
            tour_destinations: {
              orderBy: { visit_order: "asc" },
              select: { locations: { select: { name: true, slug: true, locations: { select: { name: true } } } } },
            },
          },
        },
      },
    });

    const bestByTour = new Map<number, {
      card: AiChatTour;
      departure: string;
      tourType: string;
      pricing: ReturnType<typeof calculateBookingTourPrice>;
      score: number;
    }>();
    for (const schedule of results) {
      const tour = schedule.tours;
      if (schedule.start_date.getTime() - now.getTime() < tour.cut_off_hours * hour ||
          schedule.quota - schedule.booked_count < partySize) continue;

      const name = normalize(tour.name);
      const locations = tour.tour_destinations.map(({ locations }) => locations);
      const destinationMatch = contains(name, destination) || locations.some((location) =>
        contains(normalize(location.name), destination) ||
        contains(normalize(location.slug), destination) ||
        contains(normalize(location.locations?.name), destination));
      const departureMatch = contains(normalize(schedule.departure_location.name), departure) ||
        contains(normalize(schedule.departure_location.slug), departure);
      if (!destinationMatch || !departureMatch ||
          (tourName && !contains(name, tourName) && normalize(tour.code) !== tourName)) continue;

      const pricing = calculateBookingTourPrice(schedule, party ?? { adults: 1, children: 0, infants: 0 }, now);
      if (intent.max_per_person != null && pricing.adultPrice > intent.max_per_person) continue;
      if (intent.max_total != null && (pricing.missingChildPrice || pricing.missingInfantPrice ||
          pricing.subtotal > intent.max_total)) continue;
      if (publicDealsOnly && !pricing.appliedPromoType) continue;

      const searchable = [tour.name, tour.summary, tour.best_for, tour.best_time, tour.description]
        .map(normalize).join(" ");
      const score = themes.filter((theme) => contains(searchable, theme)).length;
      if (themes.length && !score && !destination && !tourName && !reference) continue;
      const previous = bestByTour.get(tour.tour_id);
      if (previous && (!wantsDeals || previous.pricing.appliedPromoType || !pricing.appliedPromoType)) continue;
      bestByTour.set(tour.tour_id, {
        score,
        pricing,
        departure: schedule.departure_location.name,
        tourType: tour.tour_type,
        card: {
          id: tour.tour_id,
          title: tour.name,
          url: `/tours/${tour.tour_id}`,
          image_url: schedule.cover_image_url ?? tour.tour_images[0]?.image_url,
          price: pricing.adultPrice,
          original_price: pricing.baseAdultPrice,
          schedule_id: schedule.tour_schedule_id,
          departure_date: schedule.start_date.toISOString(),
          duration: `${tour.duration_days} ngày ${tour.duration_nights} đêm`,
          destination: locations.at(-1)?.name,
          summary: plain(tour.summary) || undefined,
          transport: tour.transports.name,
        },
      });
      if (!themes.length && (!wantsDeals || publicDealsOnly) && bestByTour.size === 5) break;
    }

    return [...bestByTour.values()].sort((a, b) => {
      const dealPriority = wantsDeals ? Number(Boolean(b.pricing.appliedPromoType)) - Number(Boolean(a.pricing.appliedPromoType)) : 0;
      return dealPriority || b.score - a.score;
    }).slice(0, 5);
  }

  async advise(reference: AiChatTourReference, topic: TourIntent["topic"], policyKey: TourIntent["policy_key"]) {
    const now = new Date();
    const tour = await this.prisma.tours.findFirst({
      where: { tour_id: reference.tourId, status: 1 },
      select: {
        tour_id: true,
        name: true,
        code: true,
        summary: true,
        description: true,
        best_for: true,
        best_time: true,
        duration_days: true,
        duration_nights: true,
        transports: { select: { name: true } },
        tour_destinations: {
          orderBy: { visit_order: "asc" },
          select: { locations: { select: { name: true } } },
        },
        tour_policies: {
          where: policyKey === "cancel" ? { policy_type: { in: ["cancel", "weekday", "holiday"] } }
            : policyKey ? { policy_type: policyKey } : undefined,
          orderBy: { policy_id: "asc" },
          select: { content: true, policy_type: true },
        },
        tour_schedules: {
          where: reference.scheduleId
            ? { tour_schedule_id: reference.scheduleId, status: 1 }
            : { status: 1, start_date: { gte: now } },
          orderBy: [{ start_date: "asc" }, { tour_schedule_id: "asc" }],
          take: 1,
          select: {
            tour_schedule_id: true,
            start_date: true,
            price: true,
            departure_location: { select: { name: true } },
            flash_deals: { where: { status: 1, start_date: { lte: now }, end_date: { gte: now } } },
            schedule_promotions: true,
            tour_schedule_prices: { select: { passenger_type: true, price: true } },
            pickup_points: { orderBy: { sort_order: "asc" }, take: 5, select: { name: true, address: true } },
            tour_itineraries: {
              orderBy: { day_number: "asc" },
              take: 8,
              select: {
                day_number: true, title: true, content: true,
                activities: { orderBy: { sort_order: "asc" }, take: 5, select: { title: true } },
              },
            },
          },
        },
      },
    });
    if (!tour) return "Tour này hiện không còn hiển thị. Bạn có thể chọn một tour khác.";
    const schedule = tour.tour_schedules[0];
    let lines: string[] = [];
    if (topic === "itinerary") {
      lines = (schedule?.tour_itineraries ?? []).map((day) => {
        const activities = day.activities.map((item) => plain(item.title, 60)).filter(Boolean);
        const details = activities.length ? activities.join(", ") : plain(day.content, 170);
        return `Ngày ${day.day_number} — ${plain(day.title, 100)}${details ? `: ${details}` : ""}`;
      });
    } else if (topic === "policies") {
      lines = tour.tour_policies.slice(0, 4).flatMap((policy) => {
        const content = plain(policy.content, 300);
        const title = TOUR_POLICY_DEFINITIONS.find((item) => item.key === policy.policy_type)?.title;
        return content ? [title ? `${title}: ${content}` : content] : [];
      });
    } else if (topic === "pickup") {
      lines = (schedule?.pickup_points ?? []).map((point) =>
        [point.name, point.address].filter(Boolean).join(" — "));
    } else {
      const duration = `${tour.duration_days} ngày ${tour.duration_nights} đêm`;
      const transport = tour.transports?.name;
      const departure = schedule?.departure_location?.name;
      const destList = tour.tour_destinations.map((d) => d.locations.name).filter(Boolean);
      const uniqueDests = [...new Set(destList)];

      const sections: string[] = [];

      // 1. Thông tin chung & di chuyển
      const infoPieces = [
        departure ? `Khởi hành từ: ${departure}` : "",
        schedule?.start_date ? `Khởi hành: ${formatDate.format(schedule.start_date)}` : "",
        transport ? `Di chuyển: ${transport}` : "",
      ].filter(Boolean);
      if (infoPieces.length) {
        sections.push(`📍 ${infoPieces.join(" | ")}`);
      }

      // 2. Giá tham khảo & ưu đãi
      if (schedule) {
        const pricing = calculateBookingTourPrice(schedule, { adults: 1, children: 0, infants: 0 }, now);
        const discountText = pricing.appliedPromoTitle ? ` (${pricing.appliedPromoTitle})` : "";
        sections.push(
          `💰 Giá tham khảo: ${vnd.format(pricing.adultPrice)}/người lớn${discountText}${pricing.baseAdultPrice > pricing.adultPrice ? ` (Giá gốc: ${vnd.format(pricing.baseAdultPrice)})` : ""}`
        );
      }

      // 3. Tuyến điểm tham quan nổi bật
      if (uniqueDests.length) {
        sections.push(`🌟 Tuyến điểm: ${uniqueDests.slice(0, 8).join(" ➔ ")}${uniqueDests.length > 8 ? "..." : ""}`);
      }

      // 4. Lịch trình trải nghiệm
      const itineraries = schedule?.tour_itineraries ?? [];
      if (itineraries.length) {
        const daySnippets = itineraries.slice(0, 4).map((day) => {
          const activities = day.activities.map((a) => plain(a.title, 50)).filter(Boolean);
          const details = activities.length ? activities.slice(0, 2).join(", ") : plain(day.content, 80);
          return `• Ngày ${day.day_number}: ${plain(day.title, 60)}${details ? ` (${details})` : ""}`;
        });
        if (itineraries.length > 4) {
          daySnippets.push(`• Và các ngày tiếp theo với nhiều hoạt động trải nghiệm đặc sắc.`);
        }
        sections.push(`🗺️ Lịch trình trải nghiệm:\n${daySnippets.join("\n")}`);
      } else {
        const desc = plain(tour.summary || tour.description, 250);
        if (desc && desc.length > 10 && !/^[a-z0-9]{15,}$/i.test(desc)) {
          sections.push(`📝 Giới thiệu: ${desc}`);
        }
      }

      // 5. Đối tượng phù hợp & Thời điểm lý tưởng
      const suitables = [
        tour.best_for ? `Phù hợp với: ${plain(tour.best_for)}` : "",
        tour.best_time ? `Thời điểm: ${plain(tour.best_time)}` : "",
      ].filter(Boolean);
      if (suitables.length) {
        sections.push(`✨ ${suitables.join(" | ")}`);
      }

      sections.push(
        `👉 Bạn có thể bấm "Tính giá" bên dưới để tính tổng chi phí cho nhóm/gia đình, hoặc hỏi thêm về "lịch trình chi tiết" và "chính sách hoàn hủy" nhé!`
      );

      return `${tour.name} (${duration})\n\n${sections.join("\n\n")}`;
    }
    return lines.length
      ? `${tour.name}\n\n${lines.join("\n")}\n\nBạn có thể mở thẻ tour để xem đầy đủ.`
      : `JourniTrip chưa có thông tin này cho ${tour.name}. Bạn có thể kiểm tra thêm ở trang chi tiết tour.`;
  }
}

