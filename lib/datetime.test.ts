import { describe, it, expect } from "vitest";
import { daysBetween, formatHour, parseUTCDate, dayOfWeekUTC } from "@/lib/datetime";

describe("daysBetween", () => {
  it("counts whole days between two dates", () => {
    expect(daysBetween("2024-01-01", "2024-01-08")).toBe(7);
  });
  it("is symmetric (absolute value)", () => {
    expect(daysBetween("2024-01-08", "2024-01-01")).toBe(7);
  });
  it("returns 0 when either input is empty", () => {
    expect(daysBetween("", "2024-01-01")).toBe(0);
    expect(daysBetween("2024-01-01", "")).toBe(0);
  });
});

describe("formatHour", () => {
  it("formats midnight and noon", () => {
    expect(formatHour(0)).toBe("12 AM");
    expect(formatHour(12)).toBe("12 PM");
  });
  it("formats morning and evening hours", () => {
    expect(formatHour(9)).toBe("9 AM");
    expect(formatHour(21)).toBe("9 PM");
  });
});

describe("parseUTCDate / dayOfWeekUTC", () => {
  it("parses a date at UTC midnight regardless of host timezone", () => {
    expect(parseUTCDate("2024-03-10").toISOString()).toBe("2024-03-10T00:00:00.000Z");
  });
  it("computes weekday in UTC (2024-01-01 is a Monday)", () => {
    expect(dayOfWeekUTC("2024-01-01")).toBe(1); // Mon
  });
  it("computes Sunday correctly (2024-01-07)", () => {
    expect(dayOfWeekUTC("2024-01-07")).toBe(0); // Sun
  });
  it("ignores a time component if present", () => {
    expect(dayOfWeekUTC("2024-01-01T23:59:59Z")).toBe(1);
  });
});
