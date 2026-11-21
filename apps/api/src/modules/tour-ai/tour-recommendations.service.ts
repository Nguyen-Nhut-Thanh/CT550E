import { Injectable, Logger } from "@nestjs/common";
import type { TourRecommendationItem, TourRecommendationsResponse, UserBehaviorSignals } from "shared";
import { calculateSchedulePricing } from "shared";
import { PrismaService } from "../../infrastructure/database/prisma.service";

const SUCCESSFUL_BOOKINGS = ["paid", "completed"];
const PAGE_SIZE = 100;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim().replace(/\s+/g, " ");
const tourType = (value: string) => value === "international" ? "outbound" : value;
type SeedSource = "viewed" | "saved" | "booked";
type SeedSignal = { source: SeedSource; weight: number };
type ScoreReason = { points: number; text: string; personalized: boolean; specific: boolean };

function matchesMonth(bestTime: string | null, month: number) {
  // Only infer a season from explicit month numbers/ranges, never substring "1" in "11".
  const ranges = bestTime?.toLowerCase().matchAll(/tháng\s*(\d{1,2})(?:\s*(?:-|–|đến|tới)\s*(?:tháng\s*)?(\d{1,2}))?(?!\d)/g);
  for (const match of ranges ?? []) {
    const from = Number(match[1]);
    const to = Number(match[2] ?? match[1]);
    if (from < 1 || from > 12 || to < 1 || to > 12) continue;
    if (from <= to ? month >= from && month <= to : month >= from || month <= to) return true;
  }
  return false;
}

@Injectable()
export class TourRecommendationsService {
  private readonly logger = new Logger(TourRecommendationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(
    signals?: Partial<UserBehaviorSignals>,
    accountId?: number,
  ): Promise<TourRecommendationsResponse> {
    const now = new Date();
    const currentMonth = Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Ho_Chi_Minh", month: "numeric" }).format(now));
    const filters = signals?.applied_filters;
    const seedSignals = new Map<number, SeedSignal>();
    const addSeeds = (ids: number[], source: SeedSource, weight: number) => {
      for (const id of ids) {
        if (!seedSignals.has(id) || seedSignals.get(id)!.weight < weight) seedSignals.set(id, { source, weight });
      }
    };
    addSeeds((signals?.viewed_tours ?? []).map(view => view.tourId), "viewed", 1);

    let userId: number | undefined;
    let bookedTourIds: number[] = [];
    let savedTourIds = signals?.wishlist_tour_ids ?? [];
    if (accountId) {
      const user = await this.prisma.users.findUnique({
        where: { account_id: accountId }, select: { user_id: true },
      });
      userId = user?.user_id;
    }
    if (userId) {
      const [bookings, favorites] = await Promise.all([
        this.prisma.bookings.findMany({
          where: { user_id: userId, status: { in: SUCCESSFUL_BOOKINGS } },
          select: { tour_schedules: { select: { tour_id: true } } },
        }),
        this.prisma.favorites.findMany({ where: { user_id: userId }, select: { tour_id: true } }),
      ]);
      bookedTourIds = [...new Set(bookings.map(booking => booking.tour_schedules.tour_id))];
      // Authenticated favorites are authoritative, including removals.
      savedTourIds = favorites.map(favorite => favorite.tour_id);
    }
    addSeeds(savedTourIds, "saved", 2);
    addSeeds(bookedTourIds, "booked", 3);
    const seedTourIds = [...seedSignals.keys()];
    const excluded = new Set(bookedTourIds);
    const seeds = seedTourIds.length ? await this.prisma.tours.findMany({
      where: { tour_id: { in: seedTourIds } },
      select: {
        tour_id: true, name: true, tour_type: true,
        tour_destinations: { select: { locations: { select: { location_id: true, name: true } } } },
      },
    }) : [];
    const profile = seeds.map(seed => ({ ...seed, ...seedSignals.get(seed.tour_id)! }));

    // Each peer contributes at most once per candidate, even across departure dates
    // and across bookings/favorites. Paid/completed bookings are positive evidence.
    const peersByTour = new Map<number, Map<number, number>>();
    if (seedTourIds.length) {
      try {
        const [bookingPeers, favoritePeers] = await Promise.all([
          this.prisma.bookings.findMany({
            where: {
              user_id: userId ? { not: userId } : undefined,
              status: { in: SUCCESSFUL_BOOKINGS },
              tour_schedules: { tour_id: { in: seedTourIds } },
            },
            select: { user_id: true }, distinct: ["user_id"],
          }),
          this.prisma.favorites.findMany({
            where: { user_id: userId ? { not: userId } : undefined, tour_id: { in: seedTourIds } },
            select: { user_id: true }, distinct: ["user_id"],
          }),
        ]);
        const peerIds = [...new Set([...bookingPeers, ...favoritePeers].map(peer => peer.user_id))];
        if (peerIds.length) {
          const [bookings, favorites] = await Promise.all([
            this.prisma.bookings.findMany({
              where: { user_id: { in: peerIds }, status: { in: SUCCESSFUL_BOOKINGS } },
              select: { user_id: true, tour_schedules: { select: { tour_id: true } } },
              distinct: ["user_id", "tour_schedule_id"],
            }),
            this.prisma.favorites.findMany({
              where: { user_id: { in: peerIds } }, select: { user_id: true, tour_id: true },
            }),
          ]);
          const addPeer = (id: number, peerId: number, weight: number) => {
            if (excluded.has(id) || seedSignals.has(id)) return;
            const peers = peersByTour.get(id) ?? new Map<number, number>();
            peers.set(peerId, Math.max(peers.get(peerId) ?? 0, weight));
            peersByTour.set(id, peers);
          };
          bookings.forEach(booking => addPeer(booking.tour_schedules.tour_id, booking.user_id, 3));
          favorites.forEach(favorite => addPeer(favorite.tour_id, favorite.user_id, 2));
        }
      } catch (error) {
        // Never keep partially collected collaborative evidence.
        peersByTour.clear();
        this.logger.warn(`Collaborative recommendation query failed: ${error}`);
      }
    }

    const keywords = (signals?.searched_keywords ?? []).map(keyword => keyword.trim()).filter(Boolean);
    const destinationFilter = normalize(filters?.destination ?? "");
    const requestedType = filters?.tour_type ? tourType(filters.tour_type) : undefined;
    const scheduleWhere = {
      status: 1,
      start_date: { gte: now },
      quota: { gt: this.prisma.tour_schedules.fields.booked_count },
      departure_location_id: filters?.departure_location_id ?? undefined,
    };
    let afterTourId = 0;
    let top: { item: TourRecommendationItem; score: number }[] = [];

    // Traverse all active candidates in stable batches; retain only the current top 8.
    // Applying the cutoff and effective-price filter must happen before limiting results.
    while (true) {
      const candidates = await this.prisma.tours.findMany({
        where: {
          status: 1,
          tour_id: { gt: afterTourId, notIn: [...excluded] },
          tour_type: requestedType === "outbound" ? { in: ["outbound", "international"] } : requestedType,
          tour_schedules: { some: scheduleWhere },
        },
        include: {
          departure_locations: { select: { name: true } },
          transports: { select: { name: true, transport_type: true } },
          ai_metadata: { select: { vibes: true, ai_summary_pitch: true } },
          tour_destinations: {
            include: {
              locations: {
                select: {
                  location_id: true,
                  name: true,
                  destinations_detail: { select: { tags: true } },
                },
              },
            },
            orderBy: { visit_order: "asc" },
          },
          tour_images: {
            orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }], take: 1, select: { image_url: true },
          },
          tour_schedules: {
            where: scheduleWhere,
            orderBy: [{ start_date: "asc" }, { tour_schedule_id: "asc" }],
            select: {
              tour_schedule_id: true, code: true, price: true, start_date: true,
              quota: true, booked_count: true, cover_image_url: true, departure_location_id: true,
              departure_location: { select: { name: true } },
              tour_schedule_transports: {
                where: { transport_role: "main" },
                orderBy: [{ day_from: "asc" }, { schedule_transport_id: "asc" }], take: 1,
                select: { transports: { select: { name: true, transport_type: true } } },
              },
              schedule_promotions: true,
              flash_deals: { where: { status: 1, start_date: { lte: now }, end_date: { gte: now } } },
            },
          },
        },
        orderBy: { tour_id: "asc" },
        take: PAGE_SIZE,
      });
      if (!candidates.length) break;
      afterTourId = candidates[candidates.length - 1].tour_id;

      for (const candidate of candidates) {
        const destinations = candidate.tour_destinations.map(destination => destination.locations);
        if (destinationFilter && ![candidate.name, candidate.code, ...destinations.map(destination => destination.name)]
          .some(name => normalize(name).includes(destinationFilter))) continue;
        const schedule = candidate.tour_schedules.find(departure => {
          if (departure.start_date.getTime() - now.getTime() < (candidate.cut_off_hours ?? 24) * 3600000) return false;
          const price = calculateSchedulePricing(departure, now).effectivePrice;
          return (filters?.price_range?.min == null || price >= filters.price_range.min)
            && (filters?.price_range?.max == null || price <= filters.price_range.max);
        });
        if (!schedule) continue;

        const reasons: ScoreReason[] = [];
        const addReason = (points: number, text: string, personalized = true, specific = true) => {
          if (points > 0) reasons.push({ points, text, personalized, specific });
        };
        const matchingSeeds = profile.flatMap(seed => {
          const destination = destinations.find(destination =>
            seed.tour_destinations.some(other => other.locations.location_id === destination.location_id));
          return destination ? [{ seed, destination }] : [];
        }).sort((a, b) => b.seed.weight - a.seed.weight || a.seed.tour_id - b.seed.tour_id);
        const matched = matchingSeeds[0];
        const sourceLabel = { viewed: "đã xem", saved: "đã lưu", booked: "đã đặt" };
        if (matched) {
          const { seed, destination } = matched;
          const text = seed.tour_id === candidate.tour_id
            ? `Bạn ${sourceLabel[seed.source]} tour này; hiện vẫn còn lịch khởi hành mở bán`
            : `Cùng ghé ${destination.name} như tour “${seed.name}” bạn ${sourceLabel[seed.source]}`;
          addReason(Math.min(35, matchingSeeds.reduce((sum, match) => sum + match.seed.weight * 7, 0)), text);
        }
        const matchingTypes = profile.filter(seed => tourType(seed.tour_type) === tourType(candidate.tour_type));
        if (matchingTypes.length) {
          const strongest = [...matchingTypes].sort((a, b) => b.weight - a.weight || a.tour_id - b.tour_id)[0];
          const label = tourType(candidate.tour_type) === "domestic" ? "trong nước" : "nước ngoài";
          addReason(Math.min(15, matchingTypes.reduce((sum, seed) => sum + seed.weight * 3, 0)),
            `Cùng nhóm tour ${label} với “${strongest.name}” bạn ${sourceLabel[strongest.source]}`, true, false);
        }
        const keyword = keywords.find(term => [candidate.name, candidate.code, ...destinations.map(destination => destination.name)]
          .some(name => normalize(name).includes(normalize(term))));
        // The latest search is also stored as a destination filter: count that evidence once.
        if (keyword && normalize(keyword) !== destinationFilter) addReason(30, `Khớp từ khóa bạn đã tìm: “${keyword}”`);
        const peers = peersByTour.get(candidate.tour_id);
        if (peers?.size) {
          addReason(Math.min(50, [...peers.values()].reduce((sum, weight) => sum + weight, 0) * 12),
            `Nhiều du khách có cùng sở thích với bạn cũng chọn tour này`);
        }
        if (destinationFilter) addReason(30, `Khớp điểm đến bạn tìm: “${filters!.destination!.trim()}”`);
        if (filters?.price_range?.min != null || filters?.price_range?.max != null) {
          addReason(12, "Mức giá phù hợp với khoảng ngân sách bạn đã chọn");
        }
        if (filters?.departure_location_id) addReason(10, `Khởi hành từ ${schedule.departure_location?.name ?? ""} theo nhu cầu của bạn`);
        if (requestedType) addReason(10, `Khớp loại tour ${requestedType === "domestic" ? "trong nước" : "nước ngoài"} bạn tìm kiếm`);

        const pricing = calculateSchedulePricing(schedule, now);
        if (pricing.effectivePrice < pricing.originalPrice) {
          const discount = Math.round((1 - pricing.effectivePrice / pricing.originalPrice) * 100);
          addReason(25, discount > 0
            ? `Ưu đãi tiết kiệm ${discount}% cho lịch khởi hành này`
            : "Đang áp dụng mức giá ưu đãi đặc biệt", false);
        }
        if (matchesMonth(candidate.best_time, currentMonth)) {
          addReason(20, `Thời điểm lý tưởng nhất trong năm để khám phá ${destinations[0]?.name ?? "điểm đến"}`, false);
        }

        const directVibes = candidate.ai_metadata?.vibes ?? [];
        const destinationTags = candidate.tour_destinations.flatMap((td) =>
          (td.locations.destinations_detail?.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        );
        const resolvedVibes = Array.from(
          new Set([...directVibes, ...(directVibes.length === 0 ? destinationTags : [])]),
        );
        if (resolvedVibes.length > 0 && reasons.length <= 1) {
          addReason(16, `Trải nghiệm ${resolvedVibes.slice(0, 2).join(" & ")} đặc sắc`, false, false);
        }

        const ratingScore = candidate.rating_count > 0
          ? Number(candidate.rating_avg || 0) * 8 + Math.min(20, candidate.rating_count * 2) : 0;
        const score = ratingScore + reasons.reduce((sum, reason) => sum + reason.points, 0);
        // Prefer specific evidence over the broad domestic/outbound category.
        // Never infer a destination favorite from a tour favorite.
        const personalReasons = reasons.filter(reason => reason.personalized);
        const specificReasons = personalReasons.filter(reason => reason.specific);
        const reason = [...(specificReasons.length ? specificReasons : personalReasons.length ? personalReasons : reasons)]
          .sort((a, b) => b.points - a.points)[0];
        const fallback = candidate.rating_count > 0 && Number(candidate.rating_avg) > 0
          ? `Được đánh giá ${Number(candidate.rating_avg).toFixed(1)}★ bởi du khách trải nghiệm`
          : "Hành trình mở bán với lịch trình tối ưu";
        const transport = schedule.tour_schedule_transports[0]?.transports ?? candidate.transports;
        const item: TourRecommendationItem = {
          tour_id: candidate.tour_id,
          name: candidate.name,
          code: schedule.code || candidate.code,
          image_url: schedule.cover_image_url || candidate.tour_images[0]?.image_url || "/images/shared/default-tour-beach.jpg",
          summary: candidate.summary,
          destination: destinations.map(destination => destination.name).join(" – ") || null,
          start_date: schedule.start_date.toISOString(),
          transport_name: transport?.name ?? null,
          transport_type: transport?.transport_type ?? null,
          tour_type: candidate.tour_type,
          seats_left: Math.max(0, schedule.quota - schedule.booked_count),
          price: pricing.effectivePrice,
          original_price: pricing.originalPrice > pricing.effectivePrice ? pricing.originalPrice : undefined,
          duration_text: `${candidate.duration_days}N${candidate.duration_nights}Đ`,
          departure_name: schedule.departure_location?.name || candidate.departure_locations?.name || "",
          rating_avg: Number(candidate.rating_avg || 0),
          rating_count: candidate.rating_count,
          ai_reason: reason?.text ?? fallback,
          is_personalized: personalReasons.length > 0,
          match_score: Math.round(score),
          vibes: resolvedVibes,
          link: `/tours/${candidate.tour_id}?scheduleId=${schedule.tour_schedule_id}`,
          booking_link: `/booking?tourId=${candidate.tour_id}&scheduleId=${schedule.tour_schedule_id}`,
        };
        top.push({ item, score });
      }
      top.sort((a, b) => b.score - a.score || a.item.tour_id - b.item.tour_id);
      top = top.slice(0, 8);
      if (candidates.length < PAGE_SIZE) break;
    }

    return {
      recommendations: top.map(result => result.item),
      basis: top.some(result => result.item.is_personalized)
        ? "Dựa trên hoạt động của bạn; lý do phù hợp được ghi trên từng tour"
        : "Các tour còn chỗ, ưu tiên đánh giá, ưu đãi và thời gian nên đi",
    };
  }
}

