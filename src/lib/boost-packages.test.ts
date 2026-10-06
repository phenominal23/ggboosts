import { describe, expect, it } from "vitest";
import { getBoostCount, getDuration } from "./boost-packages";
describe("honest package filters", () => {
 it("matches explicit boost labels, not prices or unrelated quantities", () => {
  expect(getBoostCount("14 Server Boosts • 3 months")).toBe(14);
  expect(getBoostCount("8x boosts")).toBe(8);
  expect(getBoostCount("$14 Access Pass")).toBeNull();
  expect(getBoostCount("114 boosts")).toBeNull();
 });
 it("maps only unambiguous supported duration labels", () => {
  expect(getDuration("14 boosts - 3 months")).toBe(3);
  expect(getDuration("30 boosts / 1 year")).toBe(12);
  expect(getDuration("8 boosts - 12 months")).toBe(12);
  expect(getDuration("1 month or 3 months")).toBeNull();
  expect(getDuration("Lifetime")).toBe(0);
  expect(getDuration("Lifetime or 1 month")).toBeNull();
 });
});
