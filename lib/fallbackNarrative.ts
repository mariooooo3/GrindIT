import type { AiTone } from "@/types/wrapped";

// ── Profile-driven, per-run-diverse fallback narrative ──────────────────────
// Produces the same four fields the LLM would, but assembled procedurally from
// the user's REAL stats. Every call re-rolls, so two runs of the same user with
// the same tone yield different text — and every line references actual numbers.

export type FallbackInput = {
  username: string;
  archetype: string;        // human label, e.g. "Night Owl"
  totalCommits: number;
  longestStreak: number;
  currentStreak: number;
  peakHour: number;         // 0-23
  topLanguage: string;
  topRepo: string;
  nightRatio: number;       // 0..1 share of commits before 5am
  prsMerged: number;
  totalRepos: number;
  periodLabel: string;
};

export type FallbackNarrative = {
  roastLine: string;
  archetypeDescription: string;
  introVibeLine: string;
  shareCaption: string;
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hourLabel(h: number): string {
  const norm = ((h % 24) + 24) % 24;
  const isAm = norm < 12;
  const base = norm % 12 === 0 ? 12 : norm % 12;
  return `${base}${isAm ? "am" : "pm"}`;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(Math.max(0, Math.round(n)));
}

// Build a token bag from the real profile so templates can interpolate freely.
function tokens(p: FallbackInput) {
  const peak = hourLabel(p.peakHour);
  const nightPct = Math.round(p.nightRatio * 100);
  const lang = p.topLanguage || "code";
  const repo = p.topRepo || "your repo";
  return {
    name: p.username,
    arch: p.archetype || "Developer",
    commits: fmt(p.totalCommits),
    commitsRaw: p.totalCommits,
    streak: p.longestStreak,
    curStreak: p.currentStreak,
    peak,
    lang,
    repo,
    nightPct,
    prs: p.prsMerged,
    repos: p.totalRepos,
    period: p.periodLabel || "this run",
  };
}

type T = ReturnType<typeof tokens>;

// Each field has many template functions; one is chosen at random per call.
// Templates reference different stat combinations so collisions are rare and
// every output is grounded in the user's data.

const ROAST: Record<AiTone, ((t: T) => string)[]> = {
  funny: [
    (t) => `${t.commits} commits and your peak hour is ${t.peak} — sleep is clearly a "v2" feature.`,
    (t) => `${t.repo} has seen more of you than your friends have. ${t.commits} commits deep and counting.`,
    (t) => `A ${t.streak}-day streak? Your houseplants wish you were that consistent with watering.`,
    (t) => `You and ${t.lang} are basically dating at this point — it's all over your ${t.repos} repos.`,
    (t) => `${t.nightPct}% of your commits happen before sunrise. The owls have started taking notes.`,
    (t) => `${t.prs} merged PRs and a ${t.peak} bedtime. Somewhere a deadline is very, very happy.`,
    (t) => `${t.commits} commits across ${t.repos} repos. Hobbies? This is the hobby.`,
    (t) => `Your longest streak hit ${t.streak} days. Your current one is ${t.curStreak}. We won't ask what happened.`,
  ],
  brutal: [
    (t) => `${t.commits} commits and your peak is ${t.peak}. That's not dedication, that's a sleep schedule held together with tape.`,
    (t) => `${t.nightPct}% of your work happens before 5am. The code isn't the only thing crashing.`,
    (t) => `A ${t.streak}-day streak that's now down to ${t.curStreak}. Consistency was a phase, apparently.`,
    (t) => `${t.repos} repos, and ${t.repo} ate most of your year. Spreading thin or just stuck?`,
    (t) => `${t.prs} PRs merged. Impressive — until you realize how many ${t.peak} nights it cost you.`,
    (t) => `All that ${t.lang} and nothing to show but ${t.commits} commits. The numbers don't lie, and they're not kind.`,
    (t) => `You call it ${t.arch}. The data calls it a cry for a calendar.`,
  ],
  motivational: [
    (t) => `${t.commits} commits. ${t.streak} unbroken days. This wasn't luck — this was you, on repeat.`,
    (t) => `While the world slept, you shipped. ${t.nightPct}% of your work at ${t.peak} built something real.`,
    (t) => `${t.repo} didn't build itself. ${t.commits} commits of pure intent did that.`,
    (t) => `${t.prs} merged PRs. Every single one a decision to make the codebase better than you found it.`,
    (t) => `${t.streak} days in a row. That's not a streak — that's a signature.`,
    (t) => `${t.lang} across ${t.repos} repos. You didn't dabble. You committed, literally.`,
    (t) => `They'll measure ${t.period} in commits. You'll remember it as the year you didn't quit.`,
  ],
};

const DESC: Record<AiTone, ((t: T) => string)[]> = {
  funny: [
    (t) => `As a card-carrying ${t.arch}, you logged ${t.commits} commits with a suspicious spike at ${t.peak}. ${t.repo} is less a project and more a roommate at this point. Somewhere, ${t.lang} is filing for joint custody.`,
    (t) => `${t.commits} commits, ${t.repos} repos, and a ${t.streak}-day streak that put your gym membership to shame. The ${t.peak} timestamps suggest your "work-life balance" is a single very enthusiastic line.`,
    (t) => `The ${t.arch} archetype fits: ${t.nightPct}% of your commits land before dawn and ${t.repo} carries the rest. You speak fluent ${t.lang} and apparently very little "go to bed".`,
    (t) => `${t.prs} PRs merged, ${t.commits} commits shipped, and not one of them at a reasonable hour. ${t.peak} is your golden hour and ${t.repo} is the willing victim.`,
  ],
  brutal: [
    (t) => `${t.arch}, sure. The receipts say ${t.commits} commits, mostly funneled into ${t.repo}, mostly at ${t.peak}. That's not range — that's a rut with good lighting. ${t.lang} can only carry you so far.`,
    (t) => `A ${t.streak}-day streak that collapsed to ${t.curStreak}. ${t.nightPct}% of your output bleeds past midnight. ${t.commits} commits and you still treat sleep like an optional dependency.`,
    (t) => `${t.repos} repos, one real obsession: ${t.repo}. ${t.prs} PRs merged, the rest of GitHub barely knows you exist. The ${t.peak} grind is loud; the results are quieter than you'd like.`,
    (t) => `You wear ${t.arch} like a badge. The data reads more like a warning label: ${t.commits} commits, a dying streak, and a ${t.peak} habit that's running the show.`,
  ],
  motivational: [
    (t) => `You are, without apology, a ${t.arch}. ${t.commits} commits. A ${t.streak}-day streak forged one decision at a time. ${t.repo} stands because you showed up — even at ${t.peak}, even when no one was watching.`,
    (t) => `${t.nightPct}% of your work happened in the quiet hours, and that's where legends are quietly made. ${t.commits} commits in ${t.lang}, ${t.prs} PRs merged — proof that ${t.period} had a author, and it was you.`,
    (t) => `The ${t.arch} doesn't wait for motivation. Across ${t.repos} repos and ${t.commits} commits, you turned ${t.peak} into a launchpad. ${t.repo} is the monument; the streak is the receipt.`,
    (t) => `${t.streak} days unbroken. ${t.prs} PRs that left things better. ${t.commits} commits that each said "again." This is what ${t.arch} looks like when it's earned, not claimed.`,
  ],
};

const INTRO: Record<AiTone, ((t: T) => string)[]> = {
  funny: [
    (t) => `${t.period}, decoded: ${t.commits} commits and one very tired keyboard.`,
    (t) => `Welcome to your ${t.arch} era — sponsored by ${t.lang} and a ${t.peak} bedtime.`,
    (t) => `${t.repo} called. It misses you already. Also: ${t.commits} commits, nice.`,
  ],
  brutal: [
    (t) => `${t.period}, no filter: ${t.commits} commits and a streak that didn't make it.`,
    (t) => `${t.arch}? Let's see if the ${t.commits} commits agree.`,
    (t) => `${t.nightPct}% before dawn. Let's talk about what that ${t.peak} habit cost you.`,
  ],
  motivational: [
    (t) => `${t.period} was yours: ${t.commits} commits, ${t.streak} days, zero excuses.`,
    (t) => `This is the story of a ${t.arch} who refused to coast.`,
    (t) => `${t.commits} commits. One direction: forward. Let's run it back.`,
  ],
};

const CAPTION: Record<AiTone, ((t: T) => string)[]> = {
  funny: [
    (t) => `@${t.name}: ${t.arch}, ${t.commits} commits, and a ${t.peak} sleep schedule. Send help.`,
    (t) => `My planet runs on ${t.lang} and ${t.commits} commits. No notes.`,
    (t) => `${t.streak}-day streak, ${t.repos} repos, zero regrets. Mostly.`,
  ],
  brutal: [
    (t) => `@${t.name} — ${t.commits} commits, a streak down to ${t.curStreak}. The grind is real, the sleep is not.`,
    (t) => `${t.arch} on paper. ${t.commits} commits in reality. You decide.`,
    (t) => `${t.nightPct}% nocturnal. ${t.commits} commits. This is fine.`,
  ],
  motivational: [
    (t) => `@${t.name}: ${t.commits} commits, ${t.streak} unbroken days. Built, not given.`,
    (t) => `${t.arch}. ${t.commits} commits. ${t.prs} PRs. This is what showing up looks like.`,
    (t) => `${t.period} in one line: ${t.commits} commits and a refusal to quit.`,
  ],
};

export function buildFallbackNarrative(input: FallbackInput, tone: AiTone): FallbackNarrative {
  const safeTone: AiTone = (["funny", "brutal", "motivational"] as AiTone[]).includes(tone) ? tone : "funny";
  const t = tokens(input);
  return {
    roastLine: rand(ROAST[safeTone])(t),
    archetypeDescription: rand(DESC[safeTone])(t),
    introVibeLine: rand(INTRO[safeTone])(t),
    shareCaption: rand(CAPTION[safeTone])(t),
  };
}
