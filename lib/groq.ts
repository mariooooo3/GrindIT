import { createClient } from "@supabase/supabase-js";
import type {
  WrappedProfile,
  NarrativeOutput,
  AiTone,
} from "@/types/wrapped";
import { buildFallbackNarrative, type FallbackInput } from "@/lib/fallbackNarrative";

type NarrativeCore = Omit<NarrativeOutput, "generatedAt" | "fromCache">;

type GroqApiResponse = {
  choices: Array<{ message: { content: string } }>;
};

// ── randomness pools ────────────────────────────────────────────────────────

const VOICES = [
  "a cynical late-night comedian who secretly admires the developer",
  "an overly enthusiastic sports announcer calling a championship game",
  "a nature documentary narrator following a rare species in the wild",
  "a detective presenting forensic evidence of coding behavior to a jury",
  "a Silicon Valley VC pitching this developer to investors on stage",
  "an 80s movie trailer narrator at maximum dramatic intensity",
  "a sommelier describing a rare vintage — except the vintage is their git log",
  "a disappointed parent who is secretly extremely proud",
  "a hype man at a rap concert introducing the headliner",
  "a mission control officer logging a space mission in real time",
  "a sports analyst breaking down game tape — the game being their commit history",
  "an epic fantasy bard who turns GitHub stats into legend",
  "a true-crime podcast host uncovering the developer's secret coding schedule",
  "a robot gaining sentience and trying to understand what these numbers say about humans",
  "a chef describing a complex dish — the dish being their coding style",
];

const MANDATORY_ELEMENTS = [
  "a comparison to a specific animal",
  "a weather metaphor",
  "a reference to a specific time of day (not just 'night' — pick an actual hour like 2am or 11pm)",
  "a cooking or food metaphor",
  "a space or astronomy metaphor",
  "a sports record-breaking moment metaphor",
  "an architecture or construction metaphor",
  "a music performance metaphor",
  "a geological or natural forces metaphor",
  "a battle or siege metaphor",
  "a scientific discovery metaphor",
  "a marathon or endurance sport metaphor",
];

// Each run focuses on a DIFFERENT aspect of the developer's data
const FOCUS_AREAS = [
  "Focus the narrative on their peak coding hour (see stats.peakHourLabel) and what it reveals about their life outside work.",
  "Focus on the gap between their longest streak and their current one — what story does that tell?",
  "Focus on their top repository — what does spending that much time on one project say about who they are?",
  "Focus on their primary language and what choosing it over everything else says about their personality.",
  "Focus on the weekday vs weekend commit split — are they escaping work with more work?",
  "Focus on how long they've been on GitHub and what they've actually done with all that time.",
  "Focus on their total stars received — what does that number mean in human terms?",
  "Focus on their nocturnal vs daytime coding split and what it implies about their lifestyle.",
  "Focus on their active days count — how many of the year's days actually had them coding?",
  "Focus on their archetype and the specific numbers that earned them that label.",
];

// Words banned per-run — forces the model off its default vocabulary
const FORBIDDEN_POOL = [
  "commit", "code", "developer", "repository", "repo", "programming",
  "software", "engineer", "keyboard", "terminal", "project", "feature",
  "branch", "merge", "push", "pull", "contribute", "build", "ship", "hack",
  "work", "create", "write", "craft", "develop", "deploy", "release",
];

function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── prompts ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  `You are a creative writer generating GitHub Wrapped narratives. Each call MUST produce genuinely different text.\n\n` +
  `Output ONLY this JSON — no markdown fences, no preamble, nothing else:\n` +
  `{"roastLine":"...","archetypeDescription":"...","introVibeLine":"...","shareCaption":"..."}\n\n` +
  `Rules:\n` +
  `1. Reference SPECIFIC numbers from the data (exact commit count, streak, peak hour, repo name, language).\n` +
  `2. Apply the voice, focus area, mandatory element, and forbidden words given in the user message — they change each call to force genuine variety.\n` +
  `3. Never use: "another great year", "keep it up", "year in review", or any similar generic filler.\n` +
  `4. Each of the four JSON fields must use completely different vocabulary and metaphors.\n` +
  `5. Output ONLY the raw JSON object — nothing before or after.`;

const USER_PROMPTS: Record<AiTone, string> = {
  funny:
    "Write a funny, affectionately sarcastic GitHub Wrapped. " +
    "Make jokes that only land because of their SPECIFIC numbers. ",
  brutal:
    "Write a brutally honest, zero-filter roast. " +
    "Call out what the numbers actually imply — no comfort, no softening. ",
  motivational:
    "Write an epic, cinematic GitHub Wrapped that makes this developer feel legendary. " +
    "Ground every word in their SPECIFIC data — make it feel like a movie trailer for their story. ",
};

// ── utilities ────────────────────────────────────────────────────────────────

// djb2 hash to base36, 8 chars
function djb2(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).slice(0, 8);
}

export function buildCacheKey(profile: WrappedProfile): string {
  const hashInput = [
    profile.metrics.totalCommits,
    profile.metrics.topRepo.name,
    profile.archetypeBlend.primary.id,
    profile.raw.totalStarsReceived,
  ].join("|");
  return [
    profile.user.login,
    profile.period.type,
    profile.period.startDate,
    djb2(hashInput),
    profile.tone,
    "v2",
  ].join(":");
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function buildPayload(profile: WrappedProfile): Record<string, unknown> {
  const m = profile.metrics;
  const r = profile.raw;
  return {
    username: r.user.login,
    bio: r.user.bio ?? null,
    followers: r.user.followersCount,
    period: profile.period.label,
    tone: profile.tone,
    archetype: {
      label: profile.archetypeBlend.label,
      primary: profile.archetypeBlend.primary.id,
      secondary: profile.archetypeBlend.secondary?.id ?? null,
    },
    stats: {
      totalCommits: m.totalCommits,
      currentStreak: m.streak.currentStreak,
      longestStreak: m.streak.longestStreak,
      peakHour: m.hourBias.peakHour,
      peakHourLabel: m.hourBias.peakHourLabel,
      isNocturnal: m.hourBias.isNocturnal,
      activeDays: m.activeDays.totalDays,
      weekdayCommitDays: m.activeDays.weekdayCount,
      weekendCommitDays: m.activeDays.weekendCount,
      weekendWarrior: m.activeDays.weekendWarrior,
      mostActiveDayOfWeek: m.activeDays.mostActiveDayOfWeek,
      topRepo: m.topRepo.name,
      totalStars: r.totalStarsReceived,
      githubAge: m.githubAge,
      prsMerged: r.pullRequests.filter((p) => p.state === "merged").length,
    },
    languages: r.languages.slice(0, 4).map((l) => ({
      name: l.language,
      percentage: l.percentage,
    })),
    scores: m.scores,
    topInsights: profile.insights.narrativeTop3.map((i) => ({
      id: i.id,
      value: i.value,
      rarity: i.rarity,
    })),
    mainStory: {
      id: profile.insights.mainStoryArc.id,
      value: profile.insights.mainStoryArc.value,
    },
  };
}

// Map a full profile to the minimal stat bag the fallback generator needs.
function toFallbackInput(profile: WrappedProfile): FallbackInput {
  const m = profile.metrics;
  const r = profile.raw;
  let total = 0;
  let night = 0;
  for (const c of r.contributions ?? []) {
    total += c.count;
    if (c.hour < 5) night += c.count;
  }
  const nightRatio = total > 0 ? night / total : (m.hourBias.isNocturnal ? 0.4 : 0.1);
  return {
    username: r.user.login,
    archetype: profile.archetypeBlend.primary.label,
    totalCommits: m.totalCommits,
    longestStreak: m.streak.longestStreak,
    currentStreak: m.streak.currentStreak,
    peakHour: m.hourBias.peakHour,
    topLanguage: r.languages[0]?.language ?? "code",
    topRepo: m.topRepo.name,
    nightRatio,
    prsMerged: r.pullRequests.filter((p) => p.state === "merged").length,
    totalRepos: r.user.publicReposCount,
    periodLabel: profile.period.label,
  };
}

// Always-available narrative grounded in the user's data — re-rolled per call,
// so two runs of the same user/tone differ. Used whenever the LLM is unavailable.
function fallbackOutput(profile: WrappedProfile): NarrativeOutput {
  const core = buildFallbackNarrative(toFallbackInput(profile), profile.tone);
  return { ...core, generatedAt: new Date().toISOString(), fromCache: false, isFallback: true };
}

function parseLLMResponse(content: string): NarrativeCore | null {
  // Strip any markdown fences and leading/trailing whitespace
  const clean = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Find the JSON object — look for the first { ... } block
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const { roastLine, archetypeDescription, introVibeLine, shareCaption } = parsed;
    if (
      typeof roastLine === "string" && roastLine.length > 0 &&
      typeof archetypeDescription === "string" && archetypeDescription.length > 0 &&
      typeof introVibeLine === "string" && introVibeLine.length > 0 &&
      typeof shareCaption === "string" && shareCaption.length > 0
    ) {
      return { roastLine, archetypeDescription, introVibeLine, shareCaption };
    }
  } catch { /* ignore */ }

  return null;
}

// ── main export ──────────────────────────────────────────────────────────────

export async function generateNarrative(profile: WrappedProfile): Promise<NarrativeOutput | null> {
  const supabase = getSupabase();
  const apiKey = process.env.GROQ_API_KEY;

  // Four independent dice rolls — each call has a unique combinatorial fingerprint
  const voice     = rand(VOICES);
  const element   = rand(MANDATORY_ELEMENTS);
  const focusArea = rand(FOCUS_AREAS);
  const banned    = pickN(FORBIDDEN_POOL, 5).join(", ");
  const rollId    = Math.random().toString(36).slice(2, 10); // unique per call, breaks any provider cache

  let payload: Record<string, unknown>;
  try {
    payload = buildPayload(profile);
  } catch (e) {
    console.error("generateNarrative: buildPayload failed", e);
    return fallbackOutput(profile);
  }

  const userPrompt =
    USER_PROMPTS[profile.tone] +
    `\n[Run ${rollId}]` +
    `\nVoice: ${voice}.` +
    `\nFocus area for this generation: ${focusArea}` +
    `\nMandatory element: include ${element} somewhere.` +
    `\nForbidden words — do NOT use any of: ${banned}.` +
    `\nDeveloper stats: ${JSON.stringify(payload)}`;

  console.log(`[groq] run=${rollId} voice="${voice.slice(0, 30)}..." focus="${focusArea.slice(0, 40)}..."`);

  let narrativeCore: NarrativeCore | null = null;

  if (!apiKey) {
    console.warn("[groq] GROQ_API_KEY is not set — using profile-based fallback");
    return fallbackOutput(profile);
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 450,
        temperature: 0.95,
        top_p: 0.9,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[groq] HTTP ${res.status}:`, errText);
      return fallbackOutput(profile);
    }
    const json = (await res.json()) as GroqApiResponse;
    const raw = json.choices[0]?.message.content ?? "";
    console.log("[groq] raw response:", raw.slice(0, 300));
    narrativeCore = parseLLMResponse(raw);
    console.log("[groq] parsed:", narrativeCore ? "OK" : "FAILED — using fallback");
  } catch (e) {
    console.error("[groq] fetch threw:", e);
    return fallbackOutput(profile);
  }

  if (!narrativeCore) return fallbackOutput(profile);

  const generatedAt = new Date().toISOString();

  if (supabase) {
    const cacheKey = buildCacheKey(profile) + ":" + Date.now().toString(36);
    try {
      await supabase.from("narrative_cache").insert({
        cache_key: cacheKey,
        username: profile.user.login,
        narrative: narrativeCore,
        created_at: generatedAt,
      });
    } catch { /* non-fatal */ }
  }

  return { ...narrativeCore, generatedAt, fromCache: false };
}
