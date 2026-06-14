export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { generateNarrative, buildCacheKey } from "@/lib/groq";
import type { WrappedProfile, AiTone } from "@/types/wrapped";

const VALID_TONES: AiTone[] = ["funny", "brutal", "motivational"];

function isWrappedProfile(body: unknown): body is WrappedProfile {
  return (
    typeof body === "object" &&
    body !== null &&
    "user" in body &&
    "metrics" in body &&
    "raw" in body
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isWrappedProfile(body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const rawProfile = body;

  if (!rawProfile.user || !rawProfile.metrics) {
    return NextResponse.json({ error: "missing_required_fields" }, { status: 400 });
  }

  const tone: AiTone = VALID_TONES.includes(rawProfile.tone) ? rawProfile.tone : "funny";
  const profile: WrappedProfile = { ...rawProfile, tone };

  try {
    const profileWithKey: WrappedProfile = { ...profile, cacheKey: buildCacheKey(profile) };
    const narrative = await generateNarrative(profileWithKey);
    return NextResponse.json({ ...profileWithKey, narrative }, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("api/narrative POST:", err);
    return NextResponse.json({ error: "narrative_failed" }, { status: 500 });
  }
}
