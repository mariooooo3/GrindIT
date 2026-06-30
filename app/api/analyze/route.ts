import { NextRequest, NextResponse } from "next/server";
import { calculateMetrics, calculateAchievements } from "@/lib/analyzer";
import { calculateArchetypeBlend } from "@/lib/archetypes";
import { selectInsights } from "@/lib/insights";
import { deriveTheme } from "@/lib/themes";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import type { GitHubRawData, AiTone, WrappedProfile } from "@/types/wrapped";

const VALID_TONES: AiTone[] = ["funny", "brutal", "motivational"];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGitHubRawData(body: unknown): body is GitHubRawData {
  if (!isObjectRecord(body)) return false;

  const user = body.user;
  const period = body.period;
  const contributions = body.contributions;
  const repos = body.repos;
  const languages = body.languages;
  const pullRequests = body.pullRequests;

  if (
    !(isObjectRecord(user) &&
    typeof user.login === "string" &&
    typeof user.accountCreatedAt === "string" &&
    isObjectRecord(period) &&
    typeof period.startDate === "string" &&
    typeof period.endDate === "string" &&
    Array.isArray(contributions) &&
    Array.isArray(repos) &&
    Array.isArray(languages) &&
    Array.isArray(pullRequests))
  ) return false;

  if (contributions.length > 5000) return false;
  if (repos.length > 2000) return false;
  if (languages.length > 200) return false;
  if (pullRequests.length > 5000) return false;

  return true;
}

function parseTone(value: unknown): AiTone {
  return VALID_TONES.includes(value as AiTone) ? (value as AiTone) : "funny";
}

export async function POST(request: NextRequest) {
  const rlKey = `analyze:ip:${getClientIp(request)}`;
  if (isRateLimited(rlKey, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isGitHubRawData(body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const rawData = body;
  const rawDataWithTone = rawData as GitHubRawData & { tone?: unknown };
  const { searchParams } = new URL(request.url);
  const tone = parseTone(searchParams.get("tone") ?? rawDataWithTone.tone);
  const clientToday = searchParams.get("clientToday") ?? undefined;

  try {
    const metrics = calculateMetrics(rawData, clientToday);
    const achievements = calculateAchievements(rawData, metrics);
    const archetypeBlend = calculateArchetypeBlend(rawData, metrics);
    const insights = selectInsights(rawData, metrics, achievements);
    const theme = deriveTheme(rawData, metrics);

    const profile: WrappedProfile = {
      user: rawData.user,
      period: rawData.period,
      raw: rawData,
      metrics,
      achievements,
      archetypeBlend,
      insights,
      theme,
      tone,
      narrative: null,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    // Log details server-side only; return a generic body to the client.
    console.error("api/analyze POST:", err);
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}
