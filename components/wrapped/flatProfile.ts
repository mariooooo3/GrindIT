import type { WrappedProfile } from "@/types/wrapped";
import { deriveTraitBadges, type TraitBadge } from "@/lib/badges";

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
  pullRequests: { opened: number; merged: number; reviewed: number };
  totalRepos: number;
  nightCommits: number;
  weekendCommits: number;
  weekdayCommits: number;
  fixCommits: number;
  firstCommitDate: string;
  mostProductiveDay: { date: string; commits: number };
  collaborators: { username: string; avatarUrl?: string }[];
  archetype: string;
  narrative: string;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number;
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
  // pull requests
  prTitles: string[];
  prRepos: string[];
  prMergeRatePct: number;
  // achievements / trophies (sorted by importance, desc)
  achievementsUnlocked: TrophyEntry[];
  achievementsLocked: TrophyEntry[];
  achievementsTotal: number;
  // trait badges for the archetype slide (sorted by importance, desc)
  traitBadges: TraitBadge[];
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  return Math.abs((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function mapToFlat(p: WrappedProfile): FlatProfile {
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
    const d = new Date(c.date);
    const dayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    byDay[dayKey] = (byDay[dayKey] || 0) + c.count;
    byMonth[d.getMonth()] += c.count;
    if (c.hour < 5) nightCommits += c.count;
    if (d.getDay() === 0 || d.getDay() === 6) weekendCommits += c.count;
  }

  const topRepos = Object.entries(byRepo)
    .filter(([name]) => name) // drop empty repo names from unauthed event gaps
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, commits]) => ({ name, commits }));

  const mostProdEntry = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const hotMonthIdx = byMonth.indexOf(Math.max(...byMonth));
  const merged = p.raw.pullRequests.filter(pr => pr.state === "merged").length;
  const opened = p.raw.pullRequests.length;

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

  const cutoff = new Date(endDate); cutoff.setFullYear(cutoff.getFullYear() - 1);
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
  const prMergeRatePct = opened > 0 ? Math.round((merged / opened) * 100) : 0;

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
    isNocturnal: p.metrics.hourBias.isNocturnal,
    topLanguages: p.raw.languages.map(l => ({ name: l.language, percentage: l.percentage, color: l.color, linesOfCode: l.linesOfCode, repoCount: l.repoCount })),
    topRepos,
    pullRequests: { opened, merged, reviewed: opened - merged },
    totalRepos: p.user.publicReposCount,
    nightCommits,
    weekendCommits,
    weekdayCommits,
    fixCommits,
    firstCommitDate: p.metrics.firstContributionDate,
    mostProductiveDay: { date: mostProdEntry[0] as string, commits: mostProdEntry[1] as number },
    collaborators: [],
    archetype: p.archetypeBlend.primary.label,
    narrative: p.narrative?.archetypeDescription ?? "",
    linesAdded: 0,
    linesDeleted: 0,
    filesChanged: 0,
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
    prMergeRatePct,
    achievementsUnlocked,
    achievementsLocked,
    achievementsTotal: p.achievements.length,
    traitBadges,
  };
}
