import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { fetchGitHubRawData, fetchGitHubUser } from "@/lib/github";
import type { GitHubError } from "@/lib/github";
import type { Period } from "@/types/wrapped";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { GITHUB_USERNAME_RE } from "@/lib/validation";

const VALID_PERIOD_TYPES = ["week", "month", "year", "alltime", "custom"] as const;
type PeriodValue = (typeof VALID_PERIOD_TYPES)[number];

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

function validateDates(periodType: PeriodValue, startDate?: string, endDate?: string): string | null {
  const todayStr = today();

  if (startDate && !isIsoDate(startDate)) return "invalid_start_date";
  if (endDate && !isIsoDate(endDate)) return "invalid_end_date";

  if (periodType === "custom") {
    const effectiveEnd = endDate ?? todayStr;
    const effectiveStart = startDate ?? daysBefore(effectiveEnd, 30);

    if (effectiveStart > effectiveEnd) return "invalid_date_range";
    if (effectiveEnd > todayStr) return "future_end_date";
  }

  return null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysBefore(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function derivePeriod(
  periodType: PeriodValue,
  startDate?: string,
  endDate?: string,
  accountCreatedAt?: string
): Period {
  const end = endDate ?? today();
  switch (periodType) {
    case "week":
      return { type: "week", startDate: daysAgo(7), endDate: today(), label: "Last 7 days" };
    case "month":
      return { type: "month", startDate: daysAgo(30), endDate: today(), label: "Last 30 days" };
    case "year":
      return { type: "year", startDate: daysAgo(365), endDate: today(), label: "Last year" };
    case "alltime":
      return {
        type: "alltime",
        startDate: accountCreatedAt?.slice(0, 10) ?? daysAgo(365 * 10),
        endDate: today(),
        label: "All time",
      };
    case "custom":
      const customStart = startDate ?? daysBefore(end, 30);
      return {
        type: "custom",
        startDate: customStart,
        endDate: end,
        label: `${customStart} - ${end}`,
      };
  }
}

export async function GET(request: NextRequest) {
  // The logged-in user's OAuth token is read from the encrypted JWT server-side
  // only — never accepted from the client (RT-01). Anonymous callers fall back to
  // the server token so public profiles still work; both paths are rate-limited
  // and the username is strictly validated below (kills RT-03 path traversal).
  const jwt = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userToken = jwt?.accessToken as string | undefined;

  // Rate-limit per authenticated identity, or per IP for anonymous callers.
  const rlKey = userToken
    ? `github:user:${jwt!.sub ?? "unknown"}`
    : `github:ip:${getClientIp(request)}`;
  if (isRateLimited(rlKey, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const periodType = searchParams.get("periodType");
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  if (!username) {
    return NextResponse.json({ error: "username_required" }, { status: 400 });
  }
  if (!GITHUB_USERNAME_RE.test(username)) {
    return NextResponse.json({ error: "invalid_username" }, { status: 400 });
  }
  if (!periodType || !(VALID_PERIOD_TYPES as readonly string[]).includes(periodType)) {
    return NextResponse.json({ error: "invalid_period_type" }, { status: 400 });
  }

  // Prefer the user's own token; else a server fallback (validated shape) so
  // anonymous reads work. Username validation above prevents traversal onto it.
  const envToken = process.env.GITHUB_TOKEN;
  const serverToken =
    envToken && (envToken.startsWith("ghp_") || envToken.startsWith("github_pat_") || envToken.startsWith("ghs_"))
      ? envToken
      : undefined;
  const token = userToken ?? serverToken ?? undefined;

  const validPeriod = periodType as PeriodValue;
  const dateValidationError = validateDates(validPeriod, startDate, endDate);

  if (dateValidationError) {
    return NextResponse.json({ error: dateValidationError }, { status: 400 });
  }

  let accountCreatedAt: string | undefined;
  if (validPeriod === "alltime") {
    try {
      const user = await fetchGitHubUser(username, token);
      accountCreatedAt = user.accountCreatedAt;
    } catch {
      // fall back to 10-year default in derivePeriod
    }
  }

  const period = derivePeriod(validPeriod, startDate, endDate, accountCreatedAt);

  try {
    const rawData = await fetchGitHubRawData(username, period, token);
    return NextResponse.json(rawData, { status: 200 });
  } catch (err) {
    const ghErr = err as GitHubError;
    if (ghErr.type === "rate_limited") {
      return NextResponse.json({ error: "rate_limited", retryAfter: ghErr.retryAfter }, { status: 429 });
    }
    if (ghErr.type === "not_found") {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }
    if (ghErr.type === "unauthorized") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("api/github GET:", err);
    return NextResponse.json({ error: "github_unavailable" }, { status: 500 });
  }
}
