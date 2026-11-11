import { describe, expect, it } from "vitest";
import { inWindow } from "../collections";

describe("collection windows", () => {
  it("handles plain and year-wrapping windows", () => {
    expect(inWindow(new Date(2026, 4, 1), { from: [4, 25], to: [5, 10] })).toBe(true);
    expect(inWindow(new Date(2026, 4, 11), { from: [4, 25], to: [5, 10] })).toBe(false);
    expect(inWindow(new Date(2027, 0, 3), { from: [12, 15], to: [1, 10] })).toBe(true);
    expect(inWindow(new Date(2026, 5, 3), { from: [12, 15], to: [1, 10] })).toBe(false);
  });
});
