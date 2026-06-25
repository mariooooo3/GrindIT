import type {
  GitHubRawData,
  GitHubRepo,
  Contribution,
  CalculatedMetrics,
  StreakData,
  HourBias,
  ActiveDays,
  Scores,
  GrowthDelta,
  Achievement,
  AchievementId,
  LanguageStats,
  Period,
} from "@/types/wrapped";
import { daysBetween, formatHour, parseUTCDate, dayOfWeekUTC } from "@/lib/datetime";

// --- Utilities ---

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function getWeekNumber(date: string): string {
  const d = parseUTCDate(date);
  const year = d.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getUTCDay() + 1) / 7);
  return `${year}-${String(week).padStart(2, "0")}`;
}

function isoToDay(d: string): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    dayOfWeekUTC(d)
  ];
}

// --- Sub-functions ---

function calcStreak(contributions: Contribution[], periodEndDate: string): StreakData {
  const active = new Set(contributions.filter((c) => c.count > 0).map((c) => c.date));
  if (!active.size) return { currentStreak: 0, longestStreak: 0, lastActiveDate: "" };

  const sorted = [...active].sort();
  const lastActiveDate = sorted.at(-1)!;

  let currentStreak = 0;
  if (active.has(periodEndDate)) {
    const cur = new Date(`${periodEndDate}T00:00:00Z`);
    while (active.has(cur.toISOString().slice(0, 10))) {
      currentStreak++;
      cur.setUTCDate(cur.getUTCDate() - 1);
    }
  }

  let longestStreak = 0, run = 0;
  for (let i = 0; i < sorted.length; i++) {
    const gap =
      i === 0
        ? 0
        : (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000;
    run = gap === 1 ? run + 1 : 1;
    if (run > longestStreak) longestStreak = run;
  }

  return { currentStreak, longestStreak, lastActiveDate };
}

function calcHourBias(contributions: Contribution[]): HourBias {
  const dist = Array<number>(24).fill(0);
  for (const c of contributions) if (c.hour >= 0 && c.hour <= 23) dist[c.hour] += c.count;
  const total = dist.reduce((a, b) => a + b, 0);
  if (!total) return { peakHour: 12, peakHourLabel: "12 PM", isNocturnal: false, distributionByHour: dist };
  const peakHour = dist.indexOf(Math.max(...dist));
  return {
    peakHour,
    peakHourLabel: formatHour(peakHour),
    isNocturnal: peakHour >= 22 || peakHour <= 5,
    distributionByHour: dist,
  };
}

function calcActiveDays(contributions: Contribution[], period: Period): ActiveDays {
  const active = contributions.filter((c) => c.count > 0);
  const unique = [...new Set(active.map((c) => c.date))];
  const activeSet = new Set(unique);

  const dayTotals: Record<string, number> = {};
  for (const c of active) {
    const day = isoToDay(c.date);
    dayTotals[day] = (dayTotals[day] ?? 0) + c.count;
  }

  const weekdayCount = unique.filter((d) => {
    const n = dayOfWeekUTC(d);
    return n >= 1 && n <= 5;
  }).length;
  const mostActiveDayOfWeek =
    Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Monday";

  const weekends = new Map<string, boolean>();
  const end = parseUTCDate(period.endDate);
  for (let d = parseUTCDate(period.startDate); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const n = d.getUTCDay();
    if (n === 0 || n === 6) {
      const iso = d.toISOString().slice(0, 10);
      const key = n === 0 ? iso : new Date(d.getTime() + 86_400_000).toISOString().slice(0, 10);
      if (!weekends.has(key)) weekends.set(key, false);
      if (activeSet.has(iso)) weekends.set(key, true);
    }
  }

  return {
    totalDays: unique.length,
    weekdayCount,
    weekendCount: unique.length - weekdayCount,
    weekendWarrior: weekends.size > 0 && [...weekends.values()].every(Boolean),
    mostActiveDayOfWeek,
  };
}

function calcGrowthDelta(contributions: Contribution[], period: Period): GrowthDelta {
  const mid = new Date(
    (new Date(period.startDate).getTime() + new Date(period.endDate).getTime()) / 2
  )
    .toISOString()
    .slice(0, 10);
  let prev = 0, curr = 0;
  for (const c of contributions) {
    if (c.date < mid) prev += c.count;
    else curr += c.count;
  }
  const deltaPercent = Math.round(((curr - prev) / Math.max(prev, 1)) * 1000) / 10;
  const trend: GrowthDelta["trend"] = deltaPercent > 5 ? "up" : deltaPercent < -5 ? "down" : "flat";
  return { previousPeriodCommits: prev, currentPeriodCommits: curr, deltaPercent, trend };
}

function calcLanguageEntropy(languages: LanguageStats[]): number {
  if (languages.length <= 1) return 0;
  const ps = languages.map((l) => l.percentage / 100).filter((p) => p > 0);
  const entropy = -ps.reduce((s, p) => s + p * Math.log2(p), 0);
  return clamp(entropy / Math.log2(languages.length), 0, 1);
}

function findTopRepo(repos: GitHubRepo[], contributions: Contribution[]): GitHubRepo {
  const counts: Record<string, number> = {};
  for (const c of contributions) counts[c.repoName] = (counts[c.repoName] ?? 0) + c.count;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (
    repos.find((r) => r.name === top) ??
    repos.slice().sort((a, b) => b.stargazersCount - a.stargazersCount)[0] ?? {
      name: "", description: null, language: null, stargazersCount: 0,
      forksCount: 0, isPrivate: false, createdAt: "", pushedAt: "", isFork: false, topics: [],
    }
  );
}

function calcScores(
  data: GitHubRawData,
  streak: StreakData,
  activeDays: ActiveDays,
  growthDelta: GrowthDelta,
  languageEntropy: number,
  repoSpread: number
): Scores {
  const STK_BOOST = 15, DAY_BOOST = 10, DAY_THRESH = 20;
  const CURR_STK_THRESH = 7, CONS_BOOST = 10, CONS_PEN = 10;
  const LANG_THRESH = 5, SPREAD_THRESH = 8, EXP_BOOST = 10;
  const FOCUS_BOOST = 15, FOCUS_THRESH = 0.7, OS_MAX = 200;

  const total = data.contributions.reduce((s, c) => s + c.count, 0);
  const periodDays = Math.max(1, daysBetween(data.period.startDate, data.period.endDate));

  const dateTotals = data.contributions.reduce<Record<string, number>>(
    (a, c) => { a[c.date] = (a[c.date] ?? 0) + c.count; return a; }, {}
  );
  const maxDay = Math.max(0, ...Object.values(dateTotals));

  let intensity = (total / periodDays) * 100;
  if (streak.longestStreak > 30) intensity += STK_BOOST;
  if (maxDay > DAY_THRESH) intensity += DAY_BOOST;
  const intensityScore = clamp(Math.round(intensity), 0, 100);

  let consistency = (activeDays.totalDays / periodDays) * 100;
  if (streak.currentStreak > CURR_STK_THRESH) consistency += CONS_BOOST;
  if (growthDelta.trend === "down") consistency -= CONS_PEN;
  const consistencyScore = clamp(Math.round(consistency), 0, 100);

  const nocturnal = data.contributions
    .filter((c) => c.hour >= 22 || c.hour <= 5)
    .reduce((s, c) => s + c.count, 0);
  const nocturnalScore = total === 0 ? 0 : clamp(Math.round((nocturnal / total) * 100), 0, 100);

  let explorer = languageEntropy * 100;
  if (data.languages.length >= LANG_THRESH) explorer += EXP_BOOST;
  if (repoSpread >= SPREAD_THRESH) explorer += EXP_BOOST;
  const explorerScore = clamp(Math.round(explorer), 0, 100);

  const repoCounts = data.contributions.reduce<Record<string, number>>(
    (a, c) => { a[c.repoName] = (a[c.repoName] ?? 0) + c.count; return a; }, {}
  );
  const topRepoRatio = total === 0 ? 0 : Math.max(0, ...Object.values(repoCounts)) / total;
  let focus = 100 - explorerScore;
  if (topRepoRatio > FOCUS_THRESH) focus += FOCUS_BOOST;
  const focusScore = clamp(Math.round(focus), 0, 100);

  const mergedPRs = data.pullRequests.filter((pr) => pr.state === "merged").length;
  const osBase = data.totalStarsReceived * 3 + data.totalForksReceived * 5 + mergedPRs * 2;
  const openSourceScore = clamp(Math.round((Math.min(osBase, OS_MAX) / OS_MAX) * 100), 0, 100);

  return { intensityScore, consistencyScore, nocturnalScore, explorerScore, focusScore, openSourceScore };
}

// --- Achievements ---

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

const RARITY: Record<Rarity, { color: string; imp: number }> = {
  common:    { color: "#9aa4b2", imp: 20 },
  uncommon:  { color: "#34d399", imp: 45 },
  rare:      { color: "#a78bfa", imp: 70 },
  epic:      { color: "#38bdf8", imp: 85 },
  legendary: { color: "#fbbf24", imp: 95 },
};

type AchievementDef = {
  id: AchievementId;
  icon: string;
  rarity: Rarity;
  boost?: number; // tie-breaker / within-tier importance nudge
  label: string;
  description: string;
  check: (data: GitHubRawData, metrics: CalculatedMetrics) => string | null;
};

function nightCommitsOf(data: GitHubRawData): number {
  return data.contributions.filter((c) => c.hour >= 0 && c.hour <= 5).reduce((s, c) => s + c.count, 0);
}
function busiestDay(data: GitHubRawData): [string, number] {
  const totals: Record<string, number> = {};
  for (const c of data.contributions) totals[c.date] = (totals[c.date] ?? 0) + c.count;
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
}
function distinctHourCount(data: GitHubRawData): number {
  return new Set(
    data.contributions
      .filter((c) => c.count > 0 && c.hour >= 0 && c.hour <= 23)
      .map((c) => c.hour)
  ).size;
}
function activeWeekdayCount(data: GitHubRawData): number {
  return new Set(
    data.contributions
      .filter((c) => c.count > 0)
      .map((c) => dayOfWeekUTC(c.date))
  ).size;
}
function mergedRepoCount(data: GitHubRawData): number {
  return new Set(
    data.pullRequests
      .filter((pr) => pr.state === "merged")
      .map((pr) => pr.repoName)
  ).size;
}
function doubleShiftDays(data: GitHubRawData): number {
  const flags = new Map<string, { early: boolean; late: boolean }>();
  for (const c of data.contributions) {
    if (c.count <= 0) continue;
    if (!flags.has(c.date)) flags.set(c.date, { early: false, late: false });
    const entry = flags.get(c.date)!;
    if (c.hour >= 0 && c.hour <= 5) entry.early = true;
    if (c.hour >= 18 && c.hour <= 23) entry.late = true;
  }
  return [...flags.values()].filter((v) => v.early && v.late).length;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // ── volume ──
  {
    id: "centurion", icon: "medal", rarity: "uncommon", label: "Centurion", description: "100+ commits",
    check: (_, m) => m.totalCommits >= 100 ? `${m.totalCommits.toLocaleString()} commits` : null,
  },
  {
    id: "grandmaster", icon: "rocket", rarity: "rare", boost: 6, label: "Grandmaster", description: "1,000+ commits",
    check: (_, m) => m.totalCommits >= 1000 ? `${m.totalCommits.toLocaleString()} commits` : null,
  },
  {
    id: "machine", icon: "gauge", rarity: "epic", boost: 5, label: "Machine", description: "5,000+ commits",
    check: (_, m) => m.totalCommits >= 5000 ? `${m.totalCommits.toLocaleString()} commits` : null,
  },
  {
    id: "god_mode", icon: "crown", rarity: "legendary", boost: 8, label: "God Mode", description: "10,000+ commits",
    check: (_, m) => m.totalCommits >= 10000 ? `${m.totalCommits.toLocaleString()} commits` : null,
  },
  {
    id: "speed_demon", icon: "bolt", rarity: "uncommon", boost: 3, label: "Speed Demon", description: "20+ commits in a single day",
    check: (data) => { const [d, c] = busiestDay(data); return c >= 20 ? `${c} commits on ${d}` : null; },
  },
  // ── streaks ──
  {
    id: "on_fire", icon: "flame", rarity: "uncommon", label: "On Fire", description: "7+ day streak",
    check: (_, m) => m.streak.longestStreak >= 7 ? `${m.streak.longestStreak} day streak` : null,
  },
  {
    id: "marathoner", icon: "infinity", rarity: "rare", label: "Marathoner", description: "30+ day streak",
    check: (_, m) => m.streak.longestStreak >= 30 ? `${m.streak.longestStreak} day streak` : null,
  },
  {
    id: "unstoppable", icon: "mountain", rarity: "legendary", boost: 3, label: "Unstoppable", description: "100+ day streak",
    check: (_, m) => m.streak.longestStreak >= 100 ? `${m.streak.longestStreak} day streak` : null,
  },
  {
    id: "consistent", icon: "calendar", rarity: "epic", label: "Iron Consistent", description: "Contributions every single week",
    check: (data) => {
      const active = new Set(data.contributions.filter((c) => c.count > 0).map((c) => getWeekNumber(c.date)));
      const allWeeks = new Set<string>();
      for (
        let d = new Date(`${data.period.startDate}T00:00:00Z`);
        d.toISOString().slice(0, 10) <= data.period.endDate;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        allWeeks.add(getWeekNumber(d.toISOString().slice(0, 10)));
      }
      return active.size >= allWeeks.size ? "Active every week" : null;
    },
  },
  // ── time of day ──
  {
    id: "night_owl", icon: "owl", rarity: "uncommon", label: "Night Owl", description: "50+ commits after midnight",
    check: (data) => { const n = nightCommitsOf(data); return n >= 50 ? `${n} late-night commits` : null; },
  },
  {
    id: "midnight_coder", icon: "moon", rarity: "common", label: "Midnight Coder", description: "Coded after midnight on 10+ nights",
    check: (data) => {
      const nights = new Set(data.contributions.filter((c) => c.count > 0 && c.hour >= 0 && c.hour <= 4).map((c) => c.date));
      return nights.size >= 10 ? `${nights.size} late-night sessions` : null;
    },
  },
  {
    id: "early_bird", icon: "sunrise", rarity: "uncommon", label: "Early Bird", description: "Productive at dawn",
    check: (data) => {
      const n = data.contributions.filter((c) => c.hour >= 5 && c.hour <= 8).reduce((s, c) => s + c.count, 0);
      return n >= 20 ? `${n} dawn commits` : null;
    },
  },
  {
    id: "weekend_warrior", icon: "swords", rarity: "epic", label: "Weekend Warrior", description: "Committed every single weekend",
    check: (_, m) => m.activeDays.weekendWarrior ? "Every weekend covered" : null,
  },
  // ── languages / tech ──
  {
    id: "polyglot", icon: "globe", rarity: "common", label: "Polyglot", description: "3+ languages",
    check: (data) => data.languages.length >= 3 ? `${data.languages.length} languages` : null,
  },
  {
    id: "polyglot_master", icon: "atom", rarity: "rare", boost: 2, label: "Polyglot Master", description: "6+ languages",
    check: (data) => data.languages.length >= 6 ? `${data.languages.length} languages` : null,
  },
  {
    id: "specialist", icon: "diamond", rarity: "uncommon", label: "Specialist", description: "One language, 80%+",
    check: (data) => data.languages[0] && data.languages[0].percentage >= 80 ? `${data.languages[0].language} ${data.languages[0].percentage}%` : null,
  },
  {
    id: "architect", icon: "columns", rarity: "uncommon", label: "Architect", description: "Active in 5+ repos",
    check: (data) => {
      const n = new Set(data.contributions.filter((c) => c.count > 0 && c.repoName).map((c) => c.repoName)).size;
      return n >= 5 ? `${n} repos at once` : null;
    },
  },
  {
    id: "repo_baron", icon: "layers", rarity: "rare", label: "Repo Baron", description: "15+ public repos",
    check: (data) => { const n = data.repos.filter((r) => !r.isFork).length; return n >= 15 ? `${n} repositories` : null; },
  },
  // ── impact / open source ──
  {
    id: "open_source_hero", icon: "star", rarity: "uncommon", label: "Open Source Hero", description: "10+ stars received",
    check: (data) => data.totalStarsReceived >= 10 ? `${data.totalStarsReceived} stars` : null,
  },
  {
    id: "star_collector", icon: "telescope", rarity: "rare", boost: 2, label: "Star Collector", description: "50+ stars received",
    check: (data) => data.totalStarsReceived >= 50 ? `${data.totalStarsReceived} stars` : null,
  },
  {
    id: "star_magnate", icon: "satellite", rarity: "epic", label: "Star Magnate", description: "250+ stars received",
    check: (data) => data.totalStarsReceived >= 250 ? `${data.totalStarsReceived} stars` : null,
  },
  {
    id: "forked", icon: "fork", rarity: "rare", label: "Forked", description: "10+ forks received",
    check: (data) => data.totalForksReceived >= 10 ? `${data.totalForksReceived} forks` : null,
  },
  {
    id: "influencer", icon: "users", rarity: "rare", boost: 1, label: "Influencer", description: "100+ followers",
    check: (data) => data.user.followersCount >= 100 ? `${data.user.followersCount} followers` : null,
  },
  // ── tenure ──
  {
    id: "veteran", icon: "shield", rarity: "uncommon", boost: 2, label: "Veteran", description: "5+ years on GitHub",
    check: (_, m) => m.githubAge >= 5 * 365 ? `${Math.floor(m.githubAge / 365)} years in` : null,
  },
  {
    id: "decade_dev", icon: "hourglass", rarity: "legendary", label: "Decade Dev", description: "10+ years on GitHub",
    check: (_, m) => m.githubAge >= 10 * 365 ? `${Math.floor(m.githubAge / 365)} years in` : null,
  },
  // ── commit craft (best-effort, needs commitStats) ──
  {
    id: "fixer", icon: "bug", rarity: "uncommon", label: "Fixer", description: "Heavy on bug fixes",
    check: (data) => { const c = data.commitStats; return c && c.sampleSize >= 10 && c.fix / c.sampleSize >= 0.25 ? `${Math.round((c.fix / c.sampleSize) * 100)}% fixes` : null; },
  },
  {
    id: "feature_factory", icon: "sparkles", rarity: "uncommon", boost: 1, label: "Feature Factory", description: "Mostly new features",
    check: (data) => { const c = data.commitStats; return c && c.sampleSize >= 10 && c.feat / c.sampleSize >= 0.4 ? `${Math.round((c.feat / c.sampleSize) * 100)}% features` : null; },
  },
  {
    id: "documenter", icon: "book", rarity: "common", label: "Documenter", description: "Writes the docs",
    check: (data) => { const c = data.commitStats; return c && c.docs >= 5 ? `${c.docs} docs commits` : null; },
  },
  // ── momentum / legacy ──
  {
    id: "rising_star", icon: "trending", rarity: "uncommon", label: "Rising Star", description: "Activity trending up",
    check: (_, m) => m.growthDelta.trend === "up" && m.growthDelta.deltaPercent >= 50 ? `+${m.growthDelta.deltaPercent}% momentum` : null,
  },
  {
    id: "code_comet", icon: "comet", rarity: "epic", boost: 1, label: "Code Comet", description: "2,500+ commits",
    check: (_, m) => m.totalCommits >= 2500 ? `${m.totalCommits.toLocaleString()} commits` : null,
  },
  // ── new diverse achievements ──
  {
    id: "christmas_dev", icon: "snowflake", rarity: "rare", boost: 4, label: "Christmas Dev", description: "Committed on Dec 25th",
    check: (data) => data.contributions.some((c) => c.count > 0 && c.date.slice(5) === "12-25") ? "Shipped on Christmas Day" : null,
  },
  {
    id: "refactorer", icon: "wrench", rarity: "uncommon", label: "Refactorer", description: "20%+ of commits are refactors",
    check: (data) => { const c = data.commitStats; return c && c.sampleSize >= 10 && c.refactor / c.sampleSize >= 0.2 ? `${Math.round((c.refactor / c.sampleSize) * 100)}% refactors` : null; },
  },
  {
    id: "tester", icon: "flask", rarity: "common", label: "Test Driven", description: "20+ test commits",
    check: (data) => { const c = data.commitStats; return c && c.test >= 20 ? `${c.test} test commits` : null; },
  },
  {
    id: "pr_champion", icon: "merge", rarity: "uncommon", boost: 2, label: "PR Champion", description: "20+ pull requests merged",
    check: (data) => {
      const merged = data.pullRequests.filter((pr) => pr.state === "merged").length;
      return merged >= 20 ? `${merged} PRs merged` : null;
    },
  },
  {
    id: "solo_artist", icon: "feather", rarity: "uncommon", label: "Solo Artist", description: "300+ commits, fewer than 5 PRs",
    check: (data, m) => {
      const prs = data.pullRequests.length;
      return m.totalCommits >= 300 && prs < 5 ? `${m.totalCommits.toLocaleString()} commits solo` : null;
    },
  },
  {
    id: "prolific_creator", icon: "compass", rarity: "uncommon", boost: 1, label: "Prolific Creator", description: "25+ original repos created",
    check: (data) => { const n = data.repos.filter((r) => !r.isFork).length; return n >= 25 ? `${n} repositories` : null; },
  },
  {
    id: "all_nighter", icon: "coffee", rarity: "uncommon", boost: 2, label: "All-Nighter", description: "Committed past 2 AM on 5+ nights",
    check: (data) => {
      const nights = new Set(data.contributions.filter((c) => c.count > 0 && c.hour >= 0 && c.hour <= 2).map((c) => c.date));
      return nights.size >= 5 ? `${nights.size} late nights` : null;
    },
  },
  {
    id: "dedicated", icon: "trophy", rarity: "epic", boost: 2, label: "Dedicated", description: "Active on 200+ unique days",
    check: (data) => {
      const days = new Set(data.contributions.filter((c) => c.count > 0).map((c) => c.date));
      return days.size >= 200 ? `${days.size} active days` : null;
    },
  },
  // ── calendar / rhythm / signature ──
  {
    id: "new_year_hacker", icon: "firework", rarity: "common", boost: 1, label: "New Year Hacker", description: "Committed on Jan 1st",
    check: (data) => data.contributions.some((c) => c.count > 0 && c.date.slice(5) === "01-01") ? "Opened the year with code" : null,
  },
  {
    id: "halloween_hacker", icon: "lantern", rarity: "uncommon", boost: 1, label: "Halloween Hacker", description: "Committed on Oct 31st",
    check: (data) => data.contributions.some((c) => c.count > 0 && c.date.slice(5) === "10-31") ? "Shipped on Halloween" : null,
  },
  {
    id: "seven_day_circuit", icon: "orbit", rarity: "rare", boost: 2, label: "Seven-Day Circuit", description: "Active on all seven weekdays",
    check: (data) => activeWeekdayCount(data) === 7 ? "Touched every day of the week" : null,
  },
  {
    id: "full_spectrum", icon: "prism", rarity: "epic", boost: 1, label: "Full Spectrum", description: "Committed across 18+ hours of the day",
    check: (data) => {
      const hours = distinctHourCount(data);
      return hours >= 18 ? `${hours} distinct hours active` : null;
    },
  },
  {
    id: "relay_runner", icon: "bridge", rarity: "rare", boost: 3, label: "Relay Runner", description: "Merged PRs across 8+ repos",
    check: (data) => {
      const repos = mergedRepoCount(data);
      return repos >= 8 ? `${repos} repos with merged PRs` : null;
    },
  },
  {
    id: "time_capsule", icon: "key", rarity: "rare", boost: 1, label: "Time Capsule", description: "Contributed to a repo created 8+ years ago",
    check: (data) => {
      const cutoff = new Date(`${data.period.endDate}T00:00:00Z`);
      cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 8);
      const oldRepo = data.repos.find((repo) =>
        data.contributions.some((c) => c.count > 0 && c.repoName === repo.name) &&
        !!repo.createdAt &&
        new Date(repo.createdAt) <= cutoff
      );
      return oldRepo ? `${oldRepo.name} predates the current era` : null;
    },
  },
  {
    id: "double_shift", icon: "pulse", rarity: "epic", boost: 4, label: "Double Shift", description: "Early and late commits on 12+ separate days",
    check: (data) => {
      const days = doubleShiftDays(data);
      return days >= 12 ? `${days} two-shift days` : null;
    },
  },
  // ── ultra-tier achievements ──
  {
    id: "galaxy_impact", icon: "heart", rarity: "legendary", boost: 6, label: "Galaxy Impact", description: "1,000+ stars received",
    check: (data) => data.totalStarsReceived >= 1000 ? `${data.totalStarsReceived.toLocaleString()} stars` : null,
  },
  {
    id: "social_butterfly", icon: "target", rarity: "epic", boost: 3, label: "Social Butterfly", description: "500+ GitHub followers",
    check: (data) => data.user.followersCount >= 500 ? `${data.user.followersCount} followers` : null,
  },
  {
    id: "sprint_king", icon: "hammer", rarity: "epic", boost: 4, label: "Sprint King", description: "50+ commits in a single day",
    check: (data) => { const [d, c] = busiestDay(data); return c >= 50 ? `${c} commits on ${d}` : null; },
  },
  {
    id: "language_wizard", icon: "broom", rarity: "epic", boost: 3, label: "Language Wizard", description: "8+ programming languages",
    check: (data) => data.languages.length >= 8 ? `${data.languages.length} languages` : null,
  },
  {
    id: "lighthouse_repo", icon: "beacon", rarity: "legendary", boost: 4, label: "Lighthouse Repo", description: "Most active repo this period has 500+ stars",
    check: (_, m) => !m.topRepo.isFork && m.topRepo.stargazersCount >= 500 ? `${m.topRepo.name} · ${m.topRepo.stargazersCount} stars` : null,
  },
];

// --- Exported functions ---

export function calculateMetrics(data: GitHubRawData): CalculatedMetrics {
  const streak = calcStreak(data.contributions, data.period.endDate);
  const hourBias = calcHourBias(data.contributions);
  const activeDays = calcActiveDays(data.contributions, data.period);
  const growthDelta = calcGrowthDelta(data.contributions, data.period);
  const languageEntropy = calcLanguageEntropy(data.languages);
  const repoSpread = new Set(
    data.contributions.filter((c) => c.count > 0).map((c) => c.repoName)
  ).size;
  const scores = calcScores(data, streak, activeDays, growthDelta, languageEntropy, repoSpread);
  const topRepo = findTopRepo(data.repos, data.contributions);
  const firstContributionDate =
    data.contributions
      .filter((c) => c.count > 0)
      .map((c) => c.date)
      .sort()[0] ?? "";
  const githubAge = Math.floor(daysBetween(data.user.accountCreatedAt, data.period.endDate));

  return {
    totalCommits: data.contributions.reduce((s, c) => s + c.count, 0),
    streak,
    hourBias,
    activeDays,
    scores,
    growthDelta,
    topRepo,
    languageEntropy,
    repoSpread,
    firstContributionDate,
    githubAge,
  };
}

export function calculateAchievements(
  data: GitHubRawData,
  metrics: CalculatedMetrics
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const reason = def.check(data, metrics);
    const tier = RARITY[def.rarity];
    return {
      id: def.id,
      icon: def.icon,
      color: tier.color,
      rarity: def.rarity,
      importance: tier.imp + (def.boost ?? 0),
      label: def.label,
      description: def.description,
      unlocked: reason !== null,
      unlockedReason: reason,
    };
  });
}
