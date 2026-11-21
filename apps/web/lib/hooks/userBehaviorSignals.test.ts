import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  getUserSignals, saveUserSignals, trackTourSearch, trackTourView, trackSearchKeyword,
  SIGNALS_STORAGE_KEY, SIGNALS_CHANGED_EVENT,
} from "./userBehaviorSignals";

let values: Map<string, string>;
let events: EventTarget;
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
beforeEach(() => {
  values = new Map();
  events = new EventTarget();
  Object.defineProperty(globalThis, "window", { configurable: true, value: events });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } });
});
afterEach(() => {
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

test("submitted searches record the term and replace constraints without retaining stale budget", () => {
  trackTourSearch(" Đà Nẵng ", { destination: "Đà Nẵng", price_range: { max: 5_000_000 } });
  assert.deepEqual(getUserSignals().searched_keywords, ["Đà Nẵng"]);
  assert.equal(getUserSignals().applied_filters?.price_range?.max, 5_000_000);
  trackTourSearch("Hội An", { destination: "Hội An" });
  assert.equal(getUserSignals().applied_filters?.price_range, undefined);
  assert.deepEqual(getUserSignals().searched_keywords, ["Hội An", "Đà Nẵng"]);
  trackTourSearch("");
  assert.equal(getUserSignals().applied_filters, undefined);
});

test("the ten latest views and five latest distinct search terms are kept in newest-first order", () => {
  for (let id = 1; id <= 12; id++) trackTourView(id);
  assert.deepEqual(getUserSignals().viewed_tours.map(view => view.tourId), [12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
  trackTourView(5);
  assert.deepEqual(getUserSignals().viewed_tours.map(view => view.tourId), [5, 12, 11, 10, 9, 8, 7, 6, 4, 3]);
  for (let id = 1; id <= 7; id++) trackSearchKeyword(`Tour ${id}`);
  trackSearchKeyword("TOUR 4");
  assert.deepEqual(getUserSignals().searched_keywords, ["TOUR 4", "Tour 7", "Tour 6", "Tour 5", "Tour 3"]);
});

test("old or corrupted localStorage cannot send invalid elements to the API", () => {
  values.set(SIGNALS_STORAGE_KEY, JSON.stringify({
    viewed_tours: [null, {}, { tourId: -1, viewedAt: "bad" }, { tourId: 1, viewedAt: "2026-11-21" }],
    searched_keywords: [null, 123, " Hội An ", "hội an", ""],
    applied_filters: { tour_type: "all", departure_location_id: "1", price_range: { min: 10, max: 2 } },
    wishlist_tour_ids: [1, 1, null, "2", -1],
  }));
  const signals = getUserSignals();
  assert.equal(signals.viewed_tours.length, 1);
  assert.deepEqual(signals.searched_keywords, ["Hội An"]);
  assert.deepEqual(signals.wishlist_tour_ids, [1]);
  assert.equal(signals.applied_filters, undefined);
  values.set(SIGNALS_STORAGE_KEY, "{broken");
  assert.deepEqual(getUserSignals().viewed_tours, []);
});

test("changes notify the home section once and clearing filters preserves history", () => {
  let changes = 0;
  events.addEventListener(SIGNALS_CHANGED_EVENT, () => changes++);
  trackTourSearch("Hội An", { destination: "Hội An" });
  assert.equal(changes, 1);
  trackTourSearch("Hội An", { destination: "Hội An" });
  assert.equal(changes, 1);
  saveUserSignals({ applied_filters: undefined });
  assert.equal(changes, 2);
  assert.equal(getUserSignals().applied_filters, undefined);
  assert.deepEqual(getUserSignals().searched_keywords, ["Hội An"]);
});
