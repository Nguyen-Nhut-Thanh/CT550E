import { getMyBookings } from "@/lib/account/api";
import { getAdminBookingList } from "@/lib/admin/bookings/api";
import { buildBookingsCsv, getBookingGuestCount, formatBookingDate, parseBookingStats } from "@/lib/admin/bookings/management";
import { DEFAULT_LOCATION_FILTERS, filterManagedLocations, getLocationRegionId, getLocationStatistics } from "@/lib/admin/locations/management";
import { getScheduleBookedCount, getScheduleStatusMeta, matchesScheduleStatusFilter } from "@/lib/admin/schedules/status";
import { getPaginationPages } from "@/lib/utils/pagination";
import { DEFAULT_TOUR_FILTERS, filterManagedTours, getTourPageNumbers, getTourStatistics } from "@/lib/admin/tours/management";
import { checkAccountAdminAccess } from "@/lib/account/useAdminAccess";
import { buildLocationHierarchyState, createDefaultLocationDetailForm, getLocationHierarchyPreview, LOCATION_LEVEL_LABELS } from "@/lib/admin/locations/hierarchy";
import { createAdminVoucher } from "@/lib/admin/vouchers/api";
import { loginUser } from "@/lib/auth/api";
import { createPaymentUrl, validatePublicVoucher } from "@/lib/booking/api";
import { parseBirthday } from "@/lib/booking/birthday";
import { getSingleRoomSurchargeTotal, getUnitPrice } from "@/lib/booking/pricing";
import { buildTravelers, syncTravelers } from "@/lib/booking/travelers";
import { addFavoriteTour } from "@/lib/favorites/api";
import { buildCalendarDays, toDateValue } from "@/lib/utils/calendar";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import type { TourSchedule } from "shared";
import type { ToursPageTour } from "shared";
import type { LocationItem } from "shared";

test("booking search sends all applied filters and preserves them on later pages", async () => {
  const storage = { getItem: () => "test-token" };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const filters = { search: "Trần & #BK00011", status: "confirmed", tourId: "13", scheduleId: "13", dateField: "departure", dateFrom: "2026-11-01", dateTo: "2026-11-30" };
  let calls = 0;
  mock.method(globalThis, "fetch", async (url: RequestInfo | URL) => {
    const query = new URL(String(url)).searchParams;
    calls++;
    assert.equal(query.get("page"), String(calls));
    for (const [key, value] of Object.entries(filters)) assert.equal(query.get(key), value);
    return Response.json({ items: [], total: 0, totalPages: 1 });
  });
  await getAdminBookingList(1, 10, filters);
  await getAdminBookingList(2, 10, filters);
});

test("booking list tolerates missing statistics from older API responses without inventing zero counts", () => {
  for (const value of [undefined, null, {}, { total: 10 }, { total: 10, paid: 4, pending: 3, cancelled: 2 }]) assert.equal(parseBookingStats(value), null);
  const stats = { total: 10, paid: 4, pending: 3, cancelled: 2, cancelRequested: 1 };
  assert.deepEqual(parseBookingStats(stats), stats);
  assert.equal(parseBookingStats({ ...stats, pending: NaN }), null);
  assert.equal(parseBookingStats({ ...stats, cancelRequested: -1 }), null);
});

test("booking rows count all passenger groups and escape CSV cells", () => {
  const item = { booking_id: 12, status: "paid", contact_name: '=HYPERLINK("bad")', contact_phone: "+84901234567", adult_count: 2, child_count: 1, infant_count: 1 };
  assert.equal(getBookingGuestCount(item), 4);
  assert.equal(getBookingGuestCount({ booking_id: 1, status: "pending" }), 0);
  const csv = buildBookingsCsv([item]);
  assert.match(csv, /'=HYPERLINK\(""bad""\)/);
  assert.match(csv, /'\+84901234567/);
  assert.match(csv, /Đã thanh toán/);
  assert.equal(formatBookingDate("not-a-date"), "—");
});

test("location management filters attractions by their region and combines search, levels and dates", () => {
  const items: LocationItem[] = [
    { location_id: 1, name: "Miền Bắc", slug: "mien-bac", level_id: 4 },
    { location_id: 2, parent_id: 1, name: "Quảng Ninh", slug: "quang-ninh", level_id: 5, is_featured: true, updated_at: "2026-10-20T00:00:00Z" },
    { location_id: 3, parent_id: 2, name: "Hạ Long", slug: "ha-long", level_id: 6, note: "Vịnh biển", updated_at: "2026-10-22T00:00:00Z" },
    { location_id: 4, name: "Miền Nam", slug: "mien-nam", level_id: 4 },
    { location_id: 5, parent_id: 4, name: "Cần Thơ", slug: "can-tho", level_id: 5 },
  ];
  assert.deepEqual(filterManagedLocations(items, { ...DEFAULT_LOCATION_FILTERS, region: "1", level: "6", search: "  VỊNH  " }).map(item => item.location_id), [3]);
  assert.deepEqual(filterManagedLocations(items, { ...DEFAULT_LOCATION_FILTERS, region: "1", level: "5" }).map(item => item.location_id), [2]);
  assert.equal(filterManagedLocations(items, { ...DEFAULT_LOCATION_FILTERS, region: "4", level: "6" }).length, 0);
  assert.deepEqual(filterManagedLocations(items, DEFAULT_LOCATION_FILTERS).slice(0, 2).map(item => item.location_id), [3, 2]);
  assert.deepEqual(getLocationStatistics(items), { total: 5, provinces: 2, attractions: 1, featured: 1 });
  assert.deepEqual(items.map(item => item.location_id), [1, 2, 3, 4, 5]);
  const cyclic = { ...items[2], parent_id: 3 };
  assert.equal(getLocationRegionId(cyclic, new Map([[3, cyclic]])), null);
});

test("schedule capacity uses reserved guests instead of booking orders and filters selling schedules", () => {
  const schedule = { start_date: "2099-11-01T08:00:00+07:00", quota: 36, status: 1, booked_count: 36, _count: { bookings: 8 } };
  assert.equal(getScheduleBookedCount(schedule), 36);
  assert.equal(getScheduleBookedCount({ ...schedule, booked_count: 0 }), 0);
  assert.equal(getScheduleBookedCount({ ...schedule, booked_count: undefined }), 8);
  assert.equal(getScheduleStatusMeta(schedule).label, "Đã hết chỗ");
  assert.equal(matchesScheduleStatusFilter(schedule, "full"), true);
  assert.equal(matchesScheduleStatusFilter(schedule, "selling"), false);
  assert.equal(matchesScheduleStatusFilter({ ...schedule, booked_count: 12 }, "selling"), true);
  assert.equal(matchesScheduleStatusFilter({ ...schedule, booked_count: 12, status: 0 }, "selling"), false);
  assert.equal(matchesScheduleStatusFilter({ ...schedule, start_date: "2000-01-01" }, "selling"), false);
  assert.equal(getScheduleStatusMeta({ ...schedule, booked_count: 12 }, { isParentHidden: true }).label, "Bị ẩn theo tour gốc");
});

test("numbered pagination shows nearby pages and remains bounded at both ends", () => {
  assert.deepEqual(getPaginationPages(1, 1), [1]);
  assert.deepEqual(getPaginationPages(1, 8), [1, 2, 3, 4, 8]);
  assert.deepEqual(getPaginationPages(5, 12), [1, 4, 5, 6, 12]);
  assert.deepEqual(getPaginationPages(8, 8), [1, 5, 6, 7, 8]);
});

test("tour management combines destination, status, duration and legacy tour types without mutating data", () => {
  const tours: ToursPageTour[] = [
    { tour_id: 1, code: "T01", name: "Hạ Long", summary: "Du thuyền", duration_days: 2, duration_nights: 1, base_price: "3000000", status: 1, tour_type: null, booked_count: 4, countries: [{ location_id: 1, name: "Việt Nam" }] },
    { tour_id: 2, code: "T02", name: "Bangkok", duration_days: 4, duration_nights: 3, base_price: "5000000", status: 0, tour_type: "cross_border", countries: [{ location_id: 2, name: "Thái Lan" }] },
    { tour_id: 3, code: "T03", name: "Châu Âu", duration_days: 8, duration_nights: 7, base_price: "20000000", status: 1, tour_type: "international", booked_count: 2 },
  ];
  assert.deepEqual(filterManagedTours(tours, { ...DEFAULT_TOUR_FILTERS, search: "  DU THUYỀN  ", type: "domestic", country: "1", status: "active", duration: "short" }).map(tour => tour.tour_id), [1]);
  assert.deepEqual(filterManagedTours(tours, { ...DEFAULT_TOUR_FILTERS, type: "outbound", duration: "medium", status: "hidden" }).map(tour => tour.tour_id), [2]);
  assert.equal(filterManagedTours(tours, { ...DEFAULT_TOUR_FILTERS, country: "2", status: "active" }).length, 0);
  assert.deepEqual(filterManagedTours(tours, { ...DEFAULT_TOUR_FILTERS, duration: "long" }).map(tour => tour.tour_id), [3]);
  assert.deepEqual(filterManagedTours(tours, { ...DEFAULT_TOUR_FILTERS, sort: "priceDesc" }).map(tour => tour.tour_id), [3, 2, 1]);
  assert.deepEqual(tours.map(tour => tour.tour_id), [1, 2, 3]);
  assert.deepEqual(getTourStatistics(tours), { total: 3, active: 2, hidden: 1, bookings: 6 });
  assert.deepEqual(getTourStatistics([]), { total: 0, active: 0, hidden: 0, bookings: 0 });
});

test("tour page numbers retain first, last and neighboring pages", () => {
  assert.deepEqual(getTourPageNumbers(1, 1), [1]);
  assert.deepEqual(getTourPageNumbers(1, 22), [1, 2, 22]);
  assert.deepEqual(getTourPageNumbers(8, 22), [1, 7, 8, 9, 22]);
  assert.deepEqual(getTourPageNumbers(22, 22), [1, 21, 22]);
});

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

test("account sidebar hides admin access for unloaded and regular accounts without an extra request", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected permission request"); });
  for (const user of [undefined, null, {}, { user_id: 1 }, { user_id: 1, is_staff: false }]) {
    assert.equal(await checkAccountAdminAccess(user), false);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("account admin access requires server confirmation and hides on denied or failed checks", async () => {
  const user = { user_id: 1, is_staff: true };
  let status = 200;
  mock.method(globalThis, "fetch", async (url: RequestInfo | URL) => {
    assert.match(String(url), /\/admin\/auth\/me$/);
    return new Response(null, { status });
  });
  assert.equal(await checkAccountAdminAccess(user), true);
  for (status of [401, 403, 500]) assert.equal(await checkAccountAdminAccess(user), false);
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => { throw new Error("Offline"); });
  assert.equal(await checkAccountAdminAccess(user), false);
});

afterEach(() => {
  mock.restoreAll();
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

test("calendar keeps leap days, local dates and complete Monday-first weeks", () => {
  const days = buildCalendarDays(new Date(2024, 1, 1));
  assert.equal(days.length % 7, 0);
  assert.equal(days.filter(day => day.date).length, 29);
  assert.equal(days[3].key, "2024-02-01");
  assert.equal(toDateValue(new Date(2024, 1, 29)), "2024-02-29");
});

test("changing passenger counts preserves entered details for each age group", () => {
  const travelers = buildTravelers(1, 1, 0);
  travelers[0].fullName = "Nguyễn An";
  travelers[1].fullName = "Nguyễn Bình";
  const updated = syncTravelers(travelers, 2, 1, 1);
  assert.deepEqual(updated.map(person => person.type), ["adult", "adult", "child", "infant"]);
  assert.equal(updated[0], travelers[0]);
  assert.equal(updated[2], travelers[1]);
  assert.equal(updated[1].fullName, "");
});

test("booking prices preserve passenger prices and legacy room surcharge fallback", () => {
  const schedule = {
    price: 1000000,
    tour_schedule_prices: [
      { passenger_type: "CHILD", price: 500000 },
      { passenger_type: "SINGLE_ROOM", price: 200000 },
    ],
    tour_schedule_hotels: [],
  } as unknown as TourSchedule;
  assert.equal(getUnitPrice(schedule, "adult"), 1000000);
  assert.equal(getUnitPrice(schedule, "child"), 500000);
  assert.equal(getUnitPrice(null, "infant"), 0);
  assert.equal(getSingleRoomSurchargeTotal(schedule), 200000);
  const withHotel = {
    ...schedule,
    tour_schedule_hotels: [{ nights: 2, hotel_room_types: { base_price: 150000 } }],
  } as unknown as TourSchedule;
  assert.equal(getSingleRoomSurchargeTotal(withHotel), 300000);
});

test("birthdays reject impossible dates and accept ISO and display formats", () => {
  assert.equal(parseBirthday("29/02/2023"), null);
  assert.equal(parseBirthday("29/02/2024"), "2024-02-29");
  assert.equal(parseBirthday("2000-10-22"), "2000-10-22");
  assert.equal(parseBirthday(""), "");
});

test("split API modules retain endpoints, payloads and token requirements", async () => {
  const storage = { getItem: () => "test-token" };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  const calls: { url: string; init: RequestInit }[] = [];
  mock.method(globalThis, "fetch", async (url: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    return Response.json({ ok: true });
  });

  await loginUser("test@example.com", "password");
  await getMyBookings();
  await addFavoriteTour(7);
  await createPaymentUrl(12, 1000000);
  await createAdminVoucher({ code: "SUMMER" });
  await validatePublicVoucher("A & B", 1000000);

  assert.deepEqual(calls.map(call => new URL(call.url).pathname), [
    "/auth/login", "/bookings/my", "/favorites/7", "/payment/create-url",
    "/admin/marketing/vouchers", "/public/vouchers/validate",
  ]);
  assert.equal(new Headers(calls[0].init.headers).get("Authorization"), null);
  for (const call of calls.slice(1, 5)) {
    assert.equal(new Headers(call.init.headers).get("Authorization"), "Bearer test-token");
  }
  assert.deepEqual(JSON.parse(String(calls[3].init.body)), { bookingId: 12, amount: 1000000 });
  assert.equal(new URL(calls[5].url).searchParams.get("code"), "A & B");
});

test("request extraction preserves API error messages and fallback messages", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ message: "Sai mật khẩu" }, { status: 401 }));
  await assert.rejects(loginUser("test@example.com", "wrong"), /Sai mật khẩu/);
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 503 }));
  await assert.rejects(loginUser("test@example.com", "wrong"), /Đăng nhập thất bại/);
});

test("an attraction loads its province, region and country without a city level", async () => {
  const requested: string[] = [];
  const fetcher = async (url: string) => {
    requested.push(url);
    if (url === "/admin/locations/50") return Response.json({ location_id: 50, name: "Tỉnh", level_id: 5, parent_id: 40 });
    if (url === "/admin/locations/40") return Response.json({ location_id: 40, name: "Miền", level_id: 4, parent_id: 30 });
    return Response.json([]);
  };
  const state = await buildLocationHierarchyState(fetcher, 6, 50);
  assert.equal(state.level3Id, "30");
  assert.equal(state.level4Id, "40");
  assert.equal(state.level5Id, "50");
  assert.equal("level6Id" in state, false);
  assert.equal(requested.some(url => url.includes("level_id=6")), false);
  const preview = getLocationHierarchyPreview({
    ...state,
    form: { ...createDefaultLocationDetailForm(), name: "Điểm tham quan", level_id: 6 },
    level3List: [{ location_id: 30, name: "Việt Nam", level_id: 3 }],
    level4List: [{ location_id: 40, name: "Miền", level_id: 4 }],
    level5List: [{ location_id: 50, name: "Tỉnh", level_id: 5 }],
  });
  assert.deepEqual(Object.values(preview), ["Việt Nam", "Miền", "Tỉnh", "Điểm tham quan"]);
  assert.equal(LOCATION_LEVEL_LABELS[6], "Địa điểm tham quan");
  assert.equal(LOCATION_LEVEL_LABELS[7], undefined);
});

// Booking progress must follow the itinerary, independent of payment status.
import { getBookingTripStatus } from "@/lib/account/booking-status";

test("booking 27–29 October is ongoing on 28 October even when payment is pending", () => {
  const booking = { status: "pending", tour_schedules: { start_date: "2026-10-27T00:00:00Z", end_date: "2026-10-29T00:00:00Z" } };
  assert.deepEqual(getBookingTripStatus(booking, new Date("2026-10-28T05:00:00Z")), { status: "ongoing", statusText: "Đang diễn ra" });
  assert.equal(getBookingTripStatus(booking, new Date("2026-10-26T12:00:00Z")).status, "upcoming");
  assert.equal(getBookingTripStatus(booking, new Date("2026-10-29T16:59:59Z")).status, "ongoing");
  assert.equal(getBookingTripStatus(booking, new Date("2026-10-29T17:00:00Z")).status, "completed");
});

test("booking starts on Vietnam's calendar day and paid future trips remain upcoming", () => {
  const booking = { status: "paid", tour_schedules: { start_date: "2026-10-27", end_date: "2026-10-29" } };
  assert.equal(getBookingTripStatus(booking, new Date("2026-10-26T16:59:59Z")).status, "upcoming");
  assert.equal(getBookingTripStatus(booking, new Date("2026-10-26T17:00:00Z")).status, "ongoing");
});

test("cancel requests are not reported as cancelled and missing dates do not imply completion", () => {
  const tour_schedules = { start_date: "2026-10-27", end_date: "2026-10-29" };
  const now = new Date("2026-10-28T05:00:00Z");
  assert.equal(getBookingTripStatus({ status: "cancelled", tour_schedules }, now).status, "cancelled");
  assert.deepEqual(getBookingTripStatus({ status: "cancel_requested", tour_schedules }, now), { status: "unknown", statusText: "Đang yêu cầu hủy" });
  assert.equal(getBookingTripStatus({ status: "paid" }, now).status, "unknown");
  assert.equal(getBookingTripStatus({ status: "pending", tour_schedules: { start_date: "invalid" } }, now).status, "unknown");
  assert.equal(getBookingTripStatus({ status: "paid", tour_schedules: { start_date: "2026-10-27" } }, now).status, "unknown");
  assert.equal(getBookingTripStatus({ status: "completed", tour_schedules }, now).status, "completed");
});
