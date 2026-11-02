import assert from "node:assert/strict";
import test from "node:test";
import { changeTimePart, formatTimeLabel, parseTimeValue } from "./timePicker";

test("accepts HH:mm and rejects invalid or incomplete time values", () => {
  assert.deepEqual(parseTimeValue("23:59"), { hour: 23, minute: 59 });
  for (const value of ["", "8:00", "24:00", "12:60", "08:00 AM"]) assert.equal(parseTimeValue(value), null);
});

test("midnight and noon have distinct AM/PM labels", () => {
  assert.equal(formatTimeLabel("00:05"), "12:05 AM");
  assert.equal(formatTimeLabel("12:05"), "12:05 PM");
  assert.equal(formatTimeLabel("20:30"), "08:30 PM");
});

test("changing hours and periods preserves minutes and correctly handles 12", () => {
  assert.equal(changeTimePart("08:15", "hour", 12), "00:15");
  assert.equal(changeTimePart("20:15", "hour", 12), "12:15");
  assert.equal(changeTimePart("00:15", "period", 1), "12:15");
  assert.equal(changeTimePart("12:15", "period", 0), "00:15");
  assert.equal(changeTimePart("23:59", "minute", 0), "23:00");
});

test("empty values become valid only after a selection and invalid selections are ignored", () => {
  assert.equal(formatTimeLabel(""), "");
  assert.equal(changeTimePart("", "minute", 25), "08:25");
  assert.equal(changeTimePart("08:15", "minute", 60), "08:15");
});
