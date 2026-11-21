import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { ValidationPipe } from "@nestjs/common";
import type { PrismaService } from "../src/infrastructure/database/prisma.service";
import { TourRecommendationsService } from "../src/modules/tour-ai/tour-recommendations.service";
import { TourRecommendationsDto } from "../src/modules/tour-ai/dto/tour-recommendations.dto";

const destination = (location_id = 1, name = "Đà Nẵng") => ({ locations: { location_id, name } });
const schedule = (changes: Record<string, unknown> = {}) => ({
  tour_schedule_id: 71, code: "S71", status: 1, start_date: new Date("2099-12-01T01:00:00Z"),
  price: 2_000_000, quota: 30, booked_count: 23, departure_location_id: 10,
  departure_location: { name: "Hà Nội" }, cover_image_url: "/schedule.jpg",
  tour_schedule_transports: [{ transports: { name: "Vietnam Airlines", transport_type: "plane" } }],
  flash_deals: null, schedule_promotions: null, ...changes,
});
const tour = (tour_id = 1, changes: Record<string, unknown> = {}) => ({
  tour_id, name: `Tour ${tour_id}`, code: `T${tour_id}`, status: 1, tour_type: "domestic",
  summary: null, rating_avg: 0, rating_count: 0, duration_days: 3, duration_nights: 2,
  cut_off_hours: 24, best_for: null, best_time: null,
  departure_locations: { name: "TP. Hồ Chí Minh" }, transports: null,
  tour_destinations: [destination()], tour_images: [{ image_url: "/tour.jpg" }],
  tour_schedules: [schedule()], ...changes,
});
const booking = (user_id: number, tour_id: number, status = "paid", scheduleId = tour_id) => ({
  user_id, status, tour_schedule_id: scheduleId, tour_schedules: { tour_id },
});
type Options = {
  bookings?: ReturnType<typeof booking>[];
  favorites?: { user_id: number; tour_id: number }[];
};
function engine(tours: ReturnType<typeof tour>[], options: Options = {}) {
  const queries: any[] = [];
  function userMatches(id: number, constraint: any) {
    return constraint === undefined || (typeof constraint === "number" ? id === constraint
      : constraint.in ? constraint.in.includes(id) : id !== constraint.not);
  }
  function distinct<T extends Record<string, any>>(rows: T[], keys?: string[]): T[] {
    if (!keys) return rows;
    return [...new Map(rows.map(row => [JSON.stringify(keys.map(key => row[key])), row])).values()];
  }
  const matchesSchedule = (departure: any, where: any) => departure.status === where.status
    && departure.start_date >= where.start_date.gte && departure.quota > departure.booked_count
    && (where.departure_location_id === undefined || departure.departure_location_id === where.departure_location_id);
  const prisma = {
    users: { findUnique: async () => ({ user_id: 1 }) },
    tour_schedules: { fields: { booked_count: "booked_count" } },
    bookings: { findMany: async (query: any) => {
      queries.push({ kind: "bookings", ...query });
      return distinct((options.bookings ?? []).filter(row => userMatches(row.user_id, query.where.user_id)
        && (!query.where.status || query.where.status.in.includes(row.status))
        && (!query.where.tour_schedules || query.where.tour_schedules.tour_id.in.includes(row.tour_schedules.tour_id))), query.distinct);
    } },
    favorites: { findMany: async (query: any) => distinct((options.favorites ?? []).filter(row =>
      userMatches(row.user_id, query.where.user_id) && (!query.where.tour_id || query.where.tour_id.in.includes(row.tour_id))), query.distinct) },
    tours: { findMany: async (query: any) => {
      queries.push({ kind: "tours", ...query });
      if (query.select) return tours.filter(row => query.where.tour_id.in.includes(row.tour_id));
      return tours.filter(row => row.status === 1 && row.tour_id > query.where.tour_id.gt
        && !query.where.tour_id.notIn.includes(row.tour_id)
        && (!query.where.tour_type || (typeof query.where.tour_type === "string"
          ? row.tour_type === query.where.tour_type : query.where.tour_type.in.includes(row.tour_type)))
        && (row.tour_schedules as any[]).some(departure => matchesSchedule(departure, query.where.tour_schedules.some)))
        .sort((a, b) => a.tour_id - b.tour_id).slice(0, query.take).map(row => ({
          ...row,
          tour_schedules: (row.tour_schedules as any[]).filter(departure => matchesSchedule(departure, query.include.tour_schedules.where))
            .sort((a, b) => a.start_date.getTime() - b.start_date.getTime() || a.tour_schedule_id - b.tour_schedule_id),
        }));
    } },
  };
  return { service: new TourRecommendationsService(prisma as unknown as PrismaService), queries };
}
const views = (id: number) => ({ viewed_tours: [{ tourId: id, viewedAt: new Date().toISOString() }] });

test("cutoff filtering and ranking traverse the full catalog, including later pages", async () => {
  const soon = schedule({ start_date: new Date(Date.now() + 3600000) });
  const { service, queries } = engine([
    ...Array.from({ length: 100 }, (_, i) => tour(i + 1, { tour_schedules: [soon] })),
    tour(101), tour(102, { rating_avg: 5, rating_count: 10 }),
  ]);
  const result = await service.getRecommendations();
  assert.deepEqual(result.recommendations.map(item => item.tour_id), [102, 101]);
  assert.equal(queries.filter(query => query.kind === "tours").length, 2);
});

test("a personalized candidate beyond the former first 40 participates in top 8", async () => {
  const result = await engine(Array.from({ length: 61 }, (_, i) => tour(i + 1)))
    .service.getRecommendations({ searched_keywords: ["Tour 61"] });
  assert.equal(result.recommendations[0].tour_id, 61);
  assert.match(result.recommendations[0].ai_reason, /Tour 61/);
});

test("cancelled/pending bookings neither exclude tours nor become taste seeds", async () => {
  const result = await engine([tour(1), tour(2), tour(3)], { bookings: [
    booking(1, 1, "cancelled"), booking(1, 2, "pending"), booking(1, 3, "paid"),
  ] }).service.getRecommendations({}, 7);
  assert.deepEqual(result.recommendations.map(item => item.tour_id), [1, 2]);
  // The paid tour remains legitimate evidence for the two other tours.
  assert.ok(result.recommendations.every(item => /đã đặt/.test(item.ai_reason)));
  const cancelledOnly = await engine([tour(1)], { bookings: [booking(1, 1, "cancelled")] }).service.getRecommendations({}, 7);
  assert.equal(cancelledOnly.recommendations[0].is_personalized, false);
});

test("one peer contributes once across multiple bookings, departures and favorites", async () => {
  const catalog = [tour(1), tour(2, { tour_destinations: [destination(2, "Hội An")] })];
  const baseline = await engine(catalog, { bookings: [booking(2, 1), booking(2, 2)] })
    .service.getRecommendations(views(1));
  const repeated = await engine(catalog, {
    bookings: [booking(2, 1), booking(2, 2), booking(2, 2, "paid", 999)],
    favorites: [{ user_id: 2, tour_id: 2 }],
  }).service.getRecommendations(views(1));
  assert.equal(repeated.recommendations.find(item => item.tour_id === 2)!.match_score,
    baseline.recommendations.find(item => item.tour_id === 2)!.match_score);
  assert.match(repeated.recommendations.find(item => item.tour_id === 2)!.ai_reason, /^1 khách/);
  const cancelled = await engine(catalog, { bookings: [booking(2, 1, "cancelled"), booking(2, 2)] })
    .service.getRecommendations(views(1));
  assert.doesNotMatch(cancelled.recommendations.find(item => item.tour_id === 2)!.ai_reason, /khách có tour/);
});

test("a favorite elsewhere cannot turn a viewed destination into a claimed destination favorite", async () => {
  const catalog = [
    tour(1, { name: "Biển miền Trung", tour_destinations: [destination(2, "Hội An")] }),
    tour(2, { tour_destinations: [destination(10, "Hà Nội"), destination(2, "Hội An")] }),
    tour(3, { tour_destinations: [destination(3, "Phú Quốc")] }),
  ];
  const result = await engine(catalog, { favorites: [{ user_id: 1, tour_id: 3 }] })
    .service.getRecommendations(views(1), 7);
  const candidate = result.recommendations.find(item => item.tour_id === 2)!;
  assert.match(candidate.ai_reason, /Hội An.*Biển miền Trung.*đã xem/);
  assert.doesNotMatch(candidate.ai_reason, /Hà Nội|yêu thích|đã lưu/);
});

test("seed sources retain their weights: booked > saved > viewed", async () => {
  const catalog = [tour(1), tour(2)];
  const viewed = await engine(catalog).service.getRecommendations(views(1));
  const saved = await engine(catalog, { favorites: [{ user_id: 1, tour_id: 1 }] }).service.getRecommendations({}, 7);
  const booked = await engine(catalog, { bookings: [booking(1, 1)] }).service.getRecommendations({}, 7);
  const candidate = (result: typeof viewed) => result.recommendations.find(item => item.tour_id === 2)!;
  assert.ok(candidate(booked).match_score! > candidate(saved).match_score!);
  assert.ok(candidate(saved).match_score! > candidate(viewed).match_score!);
  assert.match(candidate(saved).ai_reason, /đã lưu/);
  assert.match(candidate(booked).ai_reason, /đã đặt/);
});

test("removed favorites in the database override stale client wishlist signals", async () => {
  const result = await engine([tour(1), tour(2)]).service.getRecommendations({ wishlist_tour_ids: [1] }, 7);
  assert.ok(result.recommendations.every(item => !item.is_personalized));
});

test("filters select the earliest bookable departure within effective budget and departure location", async () => {
  const promotion = { discount_type: "percentage", discount_value: 50 };
  const result = await engine([tour(1, { tour_schedules: [
    schedule({ tour_schedule_id: 70, start_date: new Date("2099-11-01"), departure_location_id: 11 }),
    schedule({ tour_schedule_id: 71, start_date: new Date("2099-11-02") }),
    schedule({ tour_schedule_id: 72, start_date: new Date("2099-11-03"), flash_deals: promotion }),
  ] }), tour(2, { tour_type: "outbound" }), tour(3, { tour_destinations: [destination(3, "Phú Quốc")] })])
    .service.getRecommendations({ applied_filters: {
      destination: "da nang", price_range: { min: 500_000, max: 1_000_000 }, departure_location_id: 10, tour_type: "domestic",
    } });
  assert.equal(result.recommendations.length, 1);
  const item = result.recommendations[0];
  assert.equal(item.price, 1_000_000);
  assert.equal(item.original_price, 2_000_000);
  assert.equal(item.booking_link, "/booking?tourId=1&scheduleId=72");
  assert.equal(item.transport_name, "Vietnam Airlines");
  assert.equal(item.image_url, "/schedule.jpg");
  assert.equal(item.seats_left, 7);
});

test("unmatched constraints return no recommendations instead of silently ignoring them", async () => {
  const result = await engine([tour()]).service.getRecommendations({ applied_filters: { price_range: { max: 1_000_000 } } });
  assert.deepEqual(result.recommendations, []);
});

test("a search can match a tour code without pretending the code is a destination or double counting the search", async () => {
  const { service } = engine([tour(1), tour(2)]);
  const byKeyword = await service.getRecommendations({ searched_keywords: ["T2"] });
  const byBoth = await service.getRecommendations({ searched_keywords: ["T2"], applied_filters: { destination: "T2" } });
  assert.equal(byBoth.recommendations.length, 1);
  assert.equal(byBoth.recommendations[0].tour_id, 2);
  assert.equal(byBoth.recommendations[0].match_score, byKeyword.recommendations[0].match_score);
  assert.doesNotMatch(byBoth.recommendations[0].ai_reason, /điểm đến/);
});

test("cold-start reasons state verifiable facts rather than inventing user preferences", async () => {
  const result = await engine([tour(1, { best_for: "gia đình", best_time: "tháng 99" })]).service.getRecommendations();
  assert.equal(result.recommendations[0].ai_reason, "Tour đang mở bán, còn chỗ và còn hạn đăng ký");
  assert.equal(result.recommendations[0].is_personalized, false);
  assert.doesNotMatch(result.basis!, /xu hướng|sở thích/);
});

test("selected-departure promotions produce a truthful discount reason and consistent price", async () => {
  const result = await engine([tour(1, { tour_schedules: [schedule({ schedule_promotions: {
    title: "Ưu đãi", is_active: true, discount_type: "percentage", discount_value: 10,
    start_date: new Date("2020-01-01"), end_date: new Date("2099-12-31"), max_slots: null,
  } })] })]).service.getRecommendations();
  assert.equal(result.recommendations[0].price, 1_800_000);
  assert.equal(result.recommendations[0].original_price, 2_000_000);
  assert.match(result.recommendations[0].ai_reason, /giảm 10%/);
  assert.equal(result.recommendations[0].is_personalized, false);
});

test("validation rejects malformed elements, nested filters, IDs and oversized payloads", async () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const transform = (body: unknown) => pipe.transform(body, { type: "body", metatype: TourRecommendationsDto });
  for (const body of [
    { searched_keywords: [123] }, { searched_keywords: [null] }, { searched_keywords: ["x".repeat(201)] },
    { viewed_tours: [null] }, { viewed_tours: [{ tourId: "1", viewedAt: "bad" }] },
    { wishlist_tour_ids: [-1] }, { wishlist_tour_ids: [2147483648] },
    { applied_filters: { price_range: { max: "cheap" } } },
    { applied_filters: { price_range: { min: 100, max: 50 } } },
    { applied_filters: { tour_type: "all" } }, { searched_keywords: Array(21).fill("tour") },
  ]) await assert.rejects(() => transform(body), (error: any) => error.getStatus() === 400);
  const valid = await transform({ ...views(1), searched_keywords: ["Đà Nẵng"], applied_filters: { price_range: { min: 0, max: 1_000_000 } } });
  assert.equal(valid.viewed_tours[0].tourId, 1);
});
