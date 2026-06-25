// Shared date/time helpers.
//
// All day-of-week / calendar math is done in UTC so results are stable
// regardless of the host's timezone. Vercel's runtime is UTC, but local dev
// machines are not — previously `calcActiveDays` mixed UTC date strings with
// local `getDay()`, which could shift a contribution to the wrong weekday (and
// break streak / weekend logic) off-prod. These helpers make UTC the one rule.

/** Absolute difference between two date strings, in days. Returns 0 if either is empty. */
export function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  return Math.abs((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

/** 12-hour clock label for an hour-of-day (0–23). */
export function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/** Parse a `YYYY-MM-DD` (or ISO) date string as UTC midnight — timezone-stable. */
export function parseUTCDate(d: string): Date {
  return new Date(`${d.slice(0, 10)}T00:00:00Z`);
}

/** Day of week (0 = Sun … 6 = Sat) for a `YYYY-MM-DD` string, computed in UTC. */
export function dayOfWeekUTC(d: string): number {
  return parseUTCDate(d).getUTCDay();
}
