import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildDateTimeDays, clampDateTime, isDayAvailable, localDate,
  minuteBounds, timeInHour,
} from "./dateTimePicker";

test("October reference includes adjacent dates and six Sunday-first weeks", () => {
  const days = buildDateTimeDays(localDate(2026, 9, 1));
  assert.equal(days.length, 42);
  assert.equal(days[0].getDay(), 0);
  assert.equal(days[0].getMonth(), 8);
  assert.equal(days[0].getDate(), 27);
  assert.equal(days[41].getMonth(), 10);
  assert.equal(days[41].getDate(), 7);
});

test("calendar handles leap years and December rollover", () => {
  assert.ok(buildDateTimeDays(localDate(2028, 1, 1)).some((day) => day.getMonth() === 1 && day.getDate() === 29));
  const last = buildDateTimeDays(localDate(2026, 11, 1)).at(-1)!;
  assert.equal(last.getFullYear(), 2027);
  assert.equal(localDate(42, 0, 1).getFullYear(), 42);
});

test("minute precision never returns a value outside exact bounds", () => {
  const min = new Date(2026, 9, 30, 10, 17, 30);
  const max = new Date(2026, 9, 30, 11, 22, 45);
  const { minimum, maximum } = minuteBounds(min, max);
  assert.equal(new Date(minimum).getMinutes(), 18);
  assert.equal(new Date(maximum).getMinutes(), 22);
  assert.equal(clampDateTime(new Date(2026, 9, 30, 8), minimum, maximum).getTime(), minimum);
  assert.equal(clampDateTime(new Date(2026, 9, 30, 14), minimum, maximum).getTime(), maximum);
  assert.equal(clampDateTime(new Date(2026, 9, 30, 11, 5, 42), minimum, maximum).getSeconds(), 0);
});

test("only days intersecting the date-time range are enabled", () => {
  const { minimum, maximum } = minuteBounds(new Date(2026, 9, 30, 23, 59), new Date(2026, 9, 31, 0, 0));
  assert.equal(isDayAvailable(localDate(2026, 9, 29), minimum, maximum), false);
  assert.equal(isDayAvailable(localDate(2026, 9, 30), minimum, maximum), true);
  assert.equal(isDayAvailable(localDate(2026, 9, 31), minimum, maximum), true);
  assert.equal(isDayAvailable(localDate(2026, 10, 1), minimum, maximum), false);
  assert.equal(isDayAvailable(localDate(2026, 9, 30), maximum, minimum), false);
});

test("hour selection retains minutes or uses closest allowed minute", () => {
  const date = new Date(2026, 9, 30, 10, 17);
  const { minimum, maximum } = minuteBounds(new Date(2026, 9, 30, 10, 30), new Date(2026, 9, 30, 11, 10));
  assert.equal(timeInHour(date, 9, minimum, maximum), null);
  assert.equal(timeInHour(date, 10, minimum, maximum)?.getMinutes(), 30);
  assert.equal(timeInHour(date, 11, minimum, maximum)?.getMinutes(), 10);
  assert.equal(timeInHour(date, 12, minimum, maximum), null);
});

test("midnight and noon remain on the selected local date", () => {
  const date = new Date(2026, 9, 30, 10, 17);
  for (const hour of [0, 12, 23]) {
    const next = timeInHour(date, hour, -Infinity, Infinity)!;
    assert.equal(next.getHours(), hour);
    assert.equal(next.getDate(), 30);
    assert.equal(next.getMinutes(), 17);
  }
});

test("an interval containing no complete minute is unavailable", () => {
  const { minimum, maximum } = minuteBounds(new Date(2026, 9, 30, 10, 17, 10), new Date(2026, 9, 30, 10, 17, 50));
  assert.ok(minimum > maximum);
  assert.equal(isDayAvailable(localDate(2026, 9, 30), minimum, maximum), false);
});
