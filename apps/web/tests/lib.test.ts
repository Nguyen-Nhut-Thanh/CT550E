import { getMyBookings } from "@/lib/account/api";
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

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

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
