import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_TOUR_FILTERS } from "./management";
import { restoreTourListView } from "./view-state";

test("returning to the tour list restores page two with its filters and ordering", () => {
  const saved = {
    page: 2,
    filters: { search: "Đà", type: "domestic", country: "12", status: "active", duration: "short", sort: "priceDesc" },
  };
  assert.deepEqual(restoreTourListView(JSON.stringify(saved)), saved);
});

test("missing or corrupt browser storage falls back to a usable list", () => {
  for (const stored of [null, "{broken", "null", "42"]) {
    assert.deepEqual(restoreTourListView(stored), { page: 1, filters: DEFAULT_TOUR_FILTERS });
  }
});

test("older saved state keeps the page and supplies missing filter defaults", () => {
  assert.deepEqual(restoreTourListView('{"page":3,"filters":{"search":"Huế","status":null}}'), {
    page: 3,
    filters: { ...DEFAULT_TOUR_FILTERS, search: "Huế" },
  });
});

test("invalid stored page numbers cannot break pagination", () => {
  for (const page of [0, -1, 1.5, "2", Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(restoreTourListView(JSON.stringify({ page })).page, 1);
  }
});
