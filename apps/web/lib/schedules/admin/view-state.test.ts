import assert from "node:assert/strict";
import { test } from "node:test";
import { reconcileScheduleListPage, restoreScheduleListView } from "./view-state";

test("returning from an editor preserves both pages, selected tour, and both filters", () => {
  const saved = {
    selectedTourId: 42, tourPage: 2, schedulePage: 4,
    searchTerm: "Đà", tourTypeFilter: "domestic", scheduleStatusFilter: "past",
  };
  assert.deepEqual(restoreScheduleListView(JSON.stringify(saved)), saved);
});

test("an empty loading list or failed request cannot reset either restored page", () => {
  const saved = restoreScheduleListView('{"tourPage":2,"schedulePage":4,"selectedTourId":42}');
  assert.equal(reconcileScheduleListPage(saved.tourPage, 1, false), 2);
  assert.equal(reconcileScheduleListPage(saved.schedulePage, 1, false), 4);
  // Successful requests with enough data keep each page independently.
  assert.equal(reconcileScheduleListPage(saved.tourPage, 3, true), 2);
  assert.equal(reconcileScheduleListPage(saved.schedulePage, 5, true), 4);
});

test("deleting the last entry on a page moves back only after data is ready", () => {
  assert.equal(reconcileScheduleListPage(4, 3, true), 3);
  assert.equal(reconcileScheduleListPage(2, 0, true), 1);
});

test("missing or corrupt storage uses the initial list defaults", () => {
  const expected = {
    selectedTourId: null, tourPage: 1, schedulePage: 1,
    searchTerm: "", tourTypeFilter: "all", scheduleStatusFilter: "upcoming",
  };
  for (const raw of [null, "{broken", "null", "false"]) {
    assert.deepEqual(restoreScheduleListView(raw), expected);
  }
  assert.deepEqual(restoreScheduleListView(JSON.stringify({
    selectedTourId: -1, tourPage: "2", schedulePage: 1.5,
    searchTerm: {}, tourTypeFilter: "unknown", scheduleStatusFilter: "unknown",
  })), expected);
});
