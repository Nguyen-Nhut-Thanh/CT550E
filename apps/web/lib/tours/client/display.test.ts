import assert from "node:assert/strict";
import { test } from "node:test";
import { getTransportCategory, getTransportLabel } from "./display";

test("transport types and vehicle names resolve to categories rather than provider names", () => {
  for (const value of ["flight", "plane", "Máy bay", "Vietnam Airlines"]) {
    assert.equal(getTransportCategory(value), "plane");
    assert.equal(getTransportLabel(value), "Máy bay");
  }
  for (const value of ["bus", "car", "Xe du lịch 45 chỗ"]) assert.equal(getTransportLabel(value), "Xe du lịch");
  for (const value of ["train", "rail", "Xe lửa", "Tàu hỏa"]) {
    assert.equal(getTransportCategory(value), "train");
    assert.equal(getTransportLabel(value), "Tàu hỏa");
  }
});

test("water transport uses the ship category, including Vietnamese names containing tàu", () => {
  for (const value of ["boat", "ship", "ferry", "Tàu thủy", "Tàu biển"]) {
    assert.equal(getTransportCategory(value), "ship");
    assert.equal(getTransportLabel(value), "Tàu thủy");
  }
  for (const value of ["cruise", "Du thuyền Hạ Long"]) {
    assert.equal(getTransportCategory(value), "ship");
    assert.equal(getTransportLabel(value), "Du thuyền");
  }
});
