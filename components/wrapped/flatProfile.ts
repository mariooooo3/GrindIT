import type { WrappedProfile } from "@/types/wrapped";
import { deriveTraitBadges, BADGE_COUNT, type TraitBadge } from "@/lib/badges";
import { daysBetween, formatHour, parseUTCDate } from "@/lib/datetime";

export type TrophyEntry = { icon: string; color: string; rarity: string; importance: number; label: string; reason: string; description: string };

export type RepoCard = {
  name: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
  description: string | null;
  topics: string[];
  ageDays: number;
};

export type FlatProfile = {
  username: string;
  name?: string;
  avatarUrl: string;
  bio?: string;
  period: { label: string; startDate: string; endDate: string };
  totalCommits: number;
  longestStreak: number;
  currentStreak: number;
  peakHour: number;
  peakHourLabel: string;
  isNocturnal: boolean;
  topLanguages: { name: string; percentage: number; color: string; linesOfCode: number; repoCount: number }[];
  topRepos: { name: string; commits: number }[];
  pullRequests: { merged: number };
  totalRepos: number;
  nightCommits: number;
  weekendCommits: number;
  weekdayCommits: number;
  fixCommits: number;
  firstCommitDate: string;
  mostProductiveDay: { date: string; commits: number };
  archetype: string;
  narrative: string;
  mostActiveMonth: string;
  commitsByHour: number[];
  commitsByWeekday: Record<string, number>;
  commitsByMonth: number[];

  // ── enriched ──────────────────────────────────────────────────────────────
  // repos & impact
  totalStars: number;
  totalForks: number;
  followers: number;
  ownedRepoCount: number;
  pinnedRepos: string[];
  topRepoCard: RepoCard | null;
  topReposEnriched: { name: string; commits: number; stars: number; language: string | null }[];
  mostStarredRepo: { name: string; stars: number; forks: number; language: string | null; description: string | null } | null;
  graveyardRepo: { name: string; year: number } | null;
  // tech
  languageCount: number;
  languageEntropyPct: number;
  totalLinesOfCode: number;
  topics: string[];
  commitTypes: { fix: number; feat: number; refactor: number; docs: number; test: number; chore: number; other: number; sampleSize: number } | null;
  fixRatioPct: number | null;
  // time / rhythm
  scores: { intensity: number; consistency: number; nocturnal: number; openSource: number; explorer: number; focus: number };
  growth: { deltaPercent: number; trend: "up" | "down" | "flat" };
  hourDistribution: number[];
  mostActiveDayOfWeek: string;
  weekendWarrior: boolean;
  githubAgeYears: number;
  accountCreatedYear: number;
  activeDayCount: number;
  reposTouched: number;
  // pull requests & issues
  prTitles: string[];
  prRepos: string[];
  prsOpened: number;
  issuesOpened: number;
  // achievements / trophies (sorted by importance, desc)
  achievementsUnlocked: TrophyEntry[];
  achievementsLocked: TrophyEntry[];
  achievementsTotal: number;
  // trait badges for the archetype slide (sorted by importance, desc)
  traitBadges: TraitBadge[];
  traitBadgesTotal: number;
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// mapToFlat is a pure function of the profile object, but it's a heavy ~200-line
// transform (iterates every contribution + repo, builds several maps, sorts). It
// is called once per slide render with no memoization, and the wrapped page mounts
// two slide layers (space + world-cup) at once — so the same work ran up to ~14×
// per frame during animations. profile is treated immutably (state only ever
// replaces it with a new object, e.g. when the narrative arrives), so caching by
// object identity is always correct: a new profile ⇒ cache miss ⇒ recompute.
const flatCache = new WeakMap<WrappedProfile, FlatProfile>();

export function mapToFlat(p: WrappedProfile): FlatProfile {
  const cached = flatCache.get(p);
  if (cached) return cached;
  const result = computeFlat(p);
  flatCache.set(p, result);
  return result;
}

function computeFlat(p: WrappedProfile): FlatProfile {
  const byRepo: Record<string, number> = {};
  const byHour = Array(24).fill(0) as number[];
  const byDay: Record<string, number> = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
  const byDate: Record<string, number> = {};
  const byMonth: number[] = Array(12).fill(0);
  let nightCommits = 0;
  let weekendCommits = 0;

  for (const c of p.raw.contributions) {
    byRepo[c.repoName] = (byRepo[c.repoName] || 0) + c.count;
    byHour[c.hour] = (byHour[c.hour] || 0) + c.count;
    byDate[c.date] = (byDate[c.date] || 0) + c.count;
    const d = parseUTCDate(c.date);
    const dow = d.getUTCDay();
    const dayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow];
    byDay[dayKey] = (byDay[dayKey] || 0) + c.count;
    byMonth[d.getUTCMonth()] += c.count;
    if (c.hour < 5) nightCommits += c.count;
    if (dow === 0 || dow === 6) weekendCommits += c.count;
  }

  const topRepos = Object.entries(byRepo)
    .filter(([name]) => name) // drop empty repo names from unauthed event gaps
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, commits]) => ({ name, commits }));

  const mostProdEntry = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const hotMonthIdx = byMonth.indexOf(Math.max(...byMonth));
  const merged = p.raw.pullRequests.filter(pr => pr.state === "merged").length;

  // ── repos ──
  const ownRepos = p.raw.repos.filter(r => !r.isFork);
  const repoByName = new Map(p.raw.repos.map(r => [r.name, r]));
  const endDate = p.period.endDate;

  const findRepo = (name: string) => repoByName.get(name);

  const topReposEnriched = topRepos.map(r => {
    const repo = findRepo(r.name);
    return { name: r.name, commits: r.commits, stars: repo?.stargazersCount ?? 0, language: repo?.language ?? null };
  });

  const topByCommits = topRepos[0]?.name ? findRepo(topRepos[0].name) : undefined;
  const topRepoSource = topByCommits ?? (p.metrics.topRepo.name ? p.metrics.topRepo : undefined);
  const topRepoCard: FlatProfile["topRepoCard"] = topRepoSource
    ? {
        name: topRepoSource.name,
        commits: topRepos[0]?.commits ?? 0,
        stars: topRepoSource.stargazersCount,
        forks: topRepoSource.forksCount,
        language: topRepoSource.language,
        description: topRepoSource.description,
        topics: topRepoSource.topics ?? [],
        ageDays: Math.round(daysBetween(topRepoSource.createdAt, endDate)),
      }
    : null;

  const starSorted = ownRepos.slice().sort((a, b) => b.stargazersCount - a.stargazersCount);
  const mostStarred = starSorted[0];
  const mostStarredRepo = mostStarred && mostStarred.stargazersCount > 0
    ? { name: mostStarred.name, stars: mostStarred.stargazersCount, forks: mostStarred.forksCount, language: mostStarred.language, description: mostStarred.description }
    : null;

  const cutoff = new Date(`${endDate}T00:00:00Z`); cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  const grave = ownRepos.find(r => r.stargazersCount === 0 && r.pushedAt && new Date(r.pushedAt) < cutoff);
  const graveyardRepo = grave ? { name: grave.name, year: new Date(grave.pushedAt).getFullYear() } : null;

  // ── tech ──
  const topicFreq: Record<string, number> = {};
  for (const r of ownRepos) for (const t of (r.topics ?? [])) topicFreq[t] = (topicFreq[t] ?? 0) + 1;
  const topics = Object.entries(topicFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);

  const totalLinesOfCode = p.raw.languages.reduce((s, l) => s + (l.linesOfCode || 0), 0);

  const cs = p.raw.commitStats;
  const commitTypes = cs
    ? { fix: cs.fix, feat: cs.feat, refactor: cs.refactor, docs: cs.docs, test: cs.test, chore: cs.chore, other: cs.other, sampleSize: cs.sampleSize }
    : null;
  const fixRatioPct = cs && cs.sampleSize > 0 ? Math.round((cs.fix / cs.sampleSize) * 1000) / 10 : null;
  const fixCommits = cs && cs.sampleSize > 0 ? Math.round((cs.fix / cs.sampleSize) * p.metrics.totalCommits) : 0;

  // ── pull requests ──
  const mergedPRs = p.raw.pullRequests.filter(pr => pr.state === "merged");
  const prTitles = mergedPRs.map(pr => pr.title).filter(Boolean).slice(0, 3);
  const prRepos = [...new Set(p.raw.pullRequests.map(pr => pr.repoName).filter(Boolean))];

  // ── achievements / trophies ──
  const toTrophy = (a: WrappedProfile["achievements"][number]): TrophyEntry => ({
    icon: a.icon, color: a.color, rarity: a.rarity, importance: a.importance,
    label: a.label, reason: a.unlockedReason ?? a.description, description: a.description,
  });
  const achievementsUnlocked = p.achievements.filter(a => a.unlocked).map(toTrophy).sort((x, y) => y.importance - x.importance);
  const achievementsLocked = p.achievements.filter(a => !a.unlocked).map(toTrophy).sort((x, y) => y.importance - x.importance);

  const weekdayCommits = byDay.Mon + byDay.Tue + byDay.Wed + byDay.Thu + byDay.Fri;

  // Prefer the real commit-timestamp histogram (more accurate active-hours shape)
  // over the day-bucketed contribution hours when we have a decent sample.
  const sampleHours = p.raw.commitStats?.hourHistogram;
  const useSampleHours = !!sampleHours && sampleHours.reduce((a, b) => a + b, 0) >= 10;
  const hourDistribution = useSampleHours ? sampleHours! : p.metrics.hourBias.distributionByHour;
  const peakHour = useSampleHours ? hourDistribution.indexOf(Math.max(...hourDistribution)) : p.metrics.hourBias.peakHour;
  const peakHourLabel = useSampleHours ? formatHour(peakHour) : p.metrics.hourBias.peakHourLabel;
  const isNocturnal = useSampleHours
    ? (() => {
        const total = hourDistribution.reduce((a, b) => a + b, 0);
        const night = hourDistribution.slice(0, 5).reduce((a, b) => a + b, 0);
        return total > 0 && night / total >= 0.25;
      })()
    : p.metrics.hourBias.isNocturnal;

  const scoresShort = {
    intensity: p.metrics.scores.intensityScore,
    consistency: p.metrics.scores.consistencyScore,
    nocturnal: p.metrics.scores.nocturnalScore,
    openSource: p.metrics.scores.openSourceScore,
    explorer: p.metrics.scores.explorerScore,
    focus: p.metrics.scores.focusScore,
  };
  const traitBadges = deriveTraitBadges({
    scores: scoresShort,
    languageCount: p.raw.languages.length,
    weekendWarrior: p.metrics.activeDays.weekendWarrior,
    githubAgeYears: Math.floor(p.metrics.githubAge / 365),
    nightCommits,
    totalCommits: p.metrics.totalCommits,
    longestStreak: p.metrics.streak.longestStreak,
    growthTrend: p.metrics.growthDelta.trend,
    growthDelta: p.metrics.growthDelta.deltaPercent,
    // commit craft
    fixRatioPct: cs && cs.sampleSize >= 10 ? Math.round((cs.fix / cs.sampleSize) * 100) : undefined,
    refactorRatioPct: cs && cs.sampleSize >= 10 ? Math.round((cs.refactor / cs.sampleSize) * 100) : undefined,
    testRatioPct: cs && cs.sampleSize >= 10 ? Math.round((cs.test / cs.sampleSize) * 100) : undefined,
    docsCount: cs?.docs,
    choreRatioPct: cs && cs.sampleSize >= 10 ? Math.round((cs.chore / cs.sampleSize) * 100) : undefined,
    featRatioPct: cs && cs.sampleSize >= 10 ? Math.round((cs.feat / cs.sampleSize) * 100) : undefined,
    // collaboration & impact
    mergedPRs: merged,
    totalForks: p.raw.totalForksReceived,
    totalStars: p.raw.totalStarsReceived,
    followersCount: p.user.followersCount,
    ownedRepoCount: ownRepos.length,
    // activity patterns
    peakHour,
    commitsByMonth: byMonth,
    // language
    topLanguage: p.raw.languages[0]?.language,
  });

  return {
    username: p.user.login,
    name: p.user.name ?? undefined,
    avatarUrl: p.user.avatarUrl,
    bio: p.user.bio ?? undefined,
    period: { label: p.period.label, startDate: p.period.startDate, endDate: p.period.endDate },
    totalCommits: p.metrics.totalCommits,
    longestStreak: p.metrics.streak.longestStreak,
    currentStreak: p.metrics.streak.currentStreak,
    peakHour,
    peakHourLabel,
    isNocturnal,
    topLanguages: p.raw.languages.map(l => ({ name: l.language, percentage: l.percentage, color: l.color, linesOfCode: l.linesOfCode, repoCount: l.repoCount })),
    topRepos,
    pullRequests: { merged },
    totalRepos: ownRepos.length,
    nightCommits,
    weekendCommits,
    weekdayCommits,
    fixCommits,
    firstCommitDate: p.metrics.firstContributionDate,
    mostProductiveDay: { date: mostProdEntry[0] as string, commits: mostProdEntry[1] as number },
    archetype: p.archetypeBlend.primary.label,
    narrative: p.narrative?.archetypeDescription ?? "",
    mostActiveMonth: MONTH_NAMES[hotMonthIdx] ?? "",
    commitsByHour: byHour,
    commitsByWeekday: byDay,
    commitsByMonth: byMonth,

    totalStars: p.raw.totalStarsReceived,
    totalForks: p.raw.totalForksReceived,
    followers: p.user.followersCount,
    ownedRepoCount: ownRepos.length,
    pinnedRepos: p.user.pinnedRepos,
    topRepoCard,
    topReposEnriched,
    mostStarredRepo,
    graveyardRepo,
    languageCount: p.raw.languages.length,
    languageEntropyPct: Math.round(p.metrics.languageEntropy * 100),
    totalLinesOfCode,
    topics,
    commitTypes,
    fixRatioPct,
    scores: scoresShort,
    growth: { deltaPercent: p.metrics.growthDelta.deltaPercent, trend: p.metrics.growthDelta.trend },
    hourDistribution,
    mostActiveDayOfWeek: p.metrics.activeDays.mostActiveDayOfWeek,
    weekendWarrior: p.metrics.activeDays.weekendWarrior,
    githubAgeYears: Math.floor(p.metrics.githubAge / 365),
    accountCreatedYear: p.user.accountCreatedAt ? new Date(p.user.accountCreatedAt).getFullYear() : 0,
    activeDayCount: p.metrics.activeDays.totalDays,
    reposTouched: p.metrics.repoSpread,
    prTitles,
    prRepos,
    prsOpened: p.raw.prsOpened ?? 0,
    issuesOpened: p.raw.issueContributions?.opened ?? 0,
    achievementsUnlocked,
    achievementsLocked,
    achievementsTotal: p.achievements.length,
    traitBadges,
    traitBadgesTotal: BADGE_COUNT,
  };
}

export function formatGitHubAge(githubAgeDays: number): string {
  if (githubAgeDays < 30) {
    return `${githubAgeDays} day${githubAgeDays !== 1 ? "s" : ""}`;
  }
  if (githubAgeDays < 365) {
    const months = Math.round(githubAgeDays / 30.4);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  const years = githubAgeDays / 365;
  const rounded = Math.round(years * 10) / 10;
  if (rounded % 1 === 0) {
    return rounded === 1 ? "1 year" : `${rounded} years`;
  }
  return `${rounded} years`;
}

export function formatWrappedLabel(type: string): string {
  switch (type) {
    case "week":    return "Weekly Wrapped";
    case "month":   return "Monthly Wrapped";
    case "year":    return "Yearly Wrapped";
    case "alltime": return "All-Time Wrapped";
    default:        return "Wrapped";
  }
}
