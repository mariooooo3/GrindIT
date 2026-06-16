export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type TraitBadge = {
  id: string;
  label: string;
  icon: string;
  color: string;
  rarity: BadgeRarity;
  importance: number;
  detail: string;
  explanation: string;
};

export type TraitInput = {
  scores: { intensity: number; consistency: number; nocturnal: number; openSource: number; explorer: number; focus: number };
  languageCount: number;
  weekendWarrior: boolean;
  githubAgeYears: number;
  nightCommits: number;
  totalCommits: number;
  longestStreak: number;
  growthTrend: string;
  growthDelta: number;
  // commit craft (from commitStats — optional, only when authenticated)
  fixRatioPct?: number;
  refactorRatioPct?: number;
  testRatioPct?: number;
  docsCount?: number;
  choreRatioPct?: number;
  featRatioPct?: number;
  // collaboration & impact
  mergedPRs?: number;
  totalForks?: number;
  totalStars?: number;
  followersCount?: number;
  ownedRepoCount?: number;
  // activity patterns
  peakHour?: number;
  commitsByMonth?: number[];
  // language
  topLanguage?: string;
};

// Importance ranges per rarity (used for stable sort within same rarity)
const IMP: Record<BadgeRarity, number> = {
  common: 20, uncommon: 40, rare: 65, epic: 83, legendary: 97,
};

function imp(rarity: BadgeRarity, boost = 0) { return IMP[rarity] + boost; }

export function deriveTraitBadges(t: TraitInput): TraitBadge[] {
  const s = t.scores;
  const nightPct = t.totalCommits > 0 ? t.nightCommits / t.totalCommits : 0;

  const candidates: (Omit<TraitBadge, "importance"> & { importance: number; earned: boolean })[] = [
    // ── CORE PERSONALITY ──────────────────────────────────────────
    {
      id: "intense", label: "Intense", icon: "flame", color: "#fb7185", rarity: "common",
      importance: imp("common", 3), detail: `${s.intensity} intensity`,
      explanation: "You code with relentless energy — high volume, fast pace, maximum output.",
      earned: s.intensity >= 40,
    },
    {
      id: "consistent", label: "Consistent", icon: "calendar", color: "#34d399", rarity: "uncommon",
      importance: imp("uncommon", 2), detail: `${s.consistency} consistency`,
      explanation: "You show up every single week. Steady cadence is your superpower.",
      earned: s.consistency >= 45,
    },
    {
      id: "nocturnal", label: "Nocturnal", icon: "moon", color: "#818cf8", rarity: "common",
      importance: imp("common"), detail: `${s.nocturnal} after dark`,
      explanation: "Night shifts are your default. You do your best work after the world goes quiet.",
      earned: s.nocturnal >= 30 || nightPct >= 0.3,
    },
    {
      id: "openSource", label: "Open Source", icon: "heart", color: "#f472b6", rarity: "common",
      importance: imp("common", 2), detail: `${s.openSource} reach`,
      explanation: "Your work has real reach — stars, forks, and attention across the ecosystem.",
      earned: s.openSource >= 25,
    },
    {
      id: "explorer", label: "Explorer", icon: "compass", color: "#22d3ee", rarity: "uncommon",
      importance: imp("uncommon", 3), detail: `${s.explorer} breadth`,
      explanation: "You roam across languages and repos, never staying in one spot too long.",
      earned: s.explorer >= 40,
    },
    {
      id: "focused", label: "Focused", icon: "target", color: "#a78bfa", rarity: "rare",
      importance: imp("rare"), detail: `${s.focus} focus`,
      explanation: "One repo, one language, laser-sharp. You go deep rather than wide.",
      earned: s.focus >= 50,
    },
    {
      id: "polyglot", label: "Polyglot", icon: "globe", color: "#2dd4bf", rarity: "common",
      importance: imp("common", 1), detail: `${t.languageCount} languages`,
      explanation: "Multiple programming languages? No problem. You're fluent in code's many dialects.",
      earned: t.languageCount >= 3,
    },
    {
      id: "weekend", label: "Weekend Dev", icon: "swords", color: "#fbbf24", rarity: "epic",
      importance: imp("epic", 1), detail: "Every weekend",
      explanation: "Weekends aren't rest time — they're bonus coding time. No days off, ever.",
      earned: t.weekendWarrior,
    },
    {
      id: "veteran", label: "Veteran", icon: "shield", color: "#94a3b8", rarity: "rare",
      importance: imp("rare", 2), detail: `${t.githubAgeYears}y on GitHub`,
      explanation: "You've been on GitHub long enough to have seen it all. A true original.",
      earned: t.githubAgeYears >= 5,
    },
    {
      id: "streaker", label: "Streaker", icon: "bolt", color: "#f59e0b", rarity: "uncommon",
      importance: imp("uncommon", 1), detail: `${t.longestStreak}d streak`,
      explanation: "Consecutive days are your thing. The streak fuels the momentum.",
      earned: t.longestStreak >= 7,
    },
    {
      id: "rising", label: "Rising", icon: "trending", color: "#4ade80", rarity: "uncommon",
      importance: imp("uncommon"), detail: `+${t.growthDelta}%`,
      explanation: "Your output is accelerating — second half of the period blew the first away.",
      earned: t.growthTrend === "up" && t.growthDelta >= 30,
    },

    // ── COMMIT CRAFT ──────────────────────────────────────────────
    {
      id: "bug_hunter", label: "Bug Hunter", icon: "bug", color: "#f87171", rarity: "uncommon",
      importance: imp("uncommon", 4), detail: `${t.fixRatioPct ?? 0}% fixes`,
      explanation: "Fix commits dominate your history. You're the one who actually reads the bug reports.",
      earned: (t.fixRatioPct ?? 0) >= 25,
    },
    {
      id: "doc_writer", label: "Doc Writer", icon: "book", color: "#60a5fa", rarity: "common",
      importance: imp("common", 2), detail: `${t.docsCount ?? 0} docs`,
      explanation: "You write the docs others skip. Future developers owe you one.",
      earned: (t.docsCount ?? 0) >= 8,
    },
    {
      id: "refactorer", label: "Refactorer", icon: "broom", color: "#fb923c", rarity: "uncommon",
      importance: imp("uncommon", 2), detail: `${t.refactorRatioPct ?? 0}% refactors`,
      explanation: "You clean more than you build. Refactor commits are your form of love.",
      earned: (t.refactorRatioPct ?? 0) >= 20,
    },
    {
      id: "tester", label: "Test Driven", icon: "flask", color: "#a78bfa", rarity: "uncommon",
      importance: imp("uncommon", 3), detail: `${t.testRatioPct ?? 0}% tests`,
      explanation: "Tests aren't optional for you — they're the baseline. Quality is your obsession.",
      earned: (t.testRatioPct ?? 0) >= 10,
    },
    {
      id: "chore_master", label: "Chore Master", icon: "wrench", color: "#9ca3af", rarity: "common",
      importance: imp("common"), detail: `${t.choreRatioPct ?? 0}% chores`,
      explanation: "Maintenance, updates, and cleanup — the unglamorous work that keeps things running.",
      earned: (t.choreRatioPct ?? 0) >= 20,
    },
    {
      id: "feature_shipper", label: "Feature Shipper", icon: "trophy", color: "#fb923c", rarity: "uncommon",
      importance: imp("uncommon", 5), detail: `${t.featRatioPct ?? 0}% features`,
      explanation: "You build more than you fix. Feature commits lead the way in your history.",
      earned: (t.featRatioPct ?? 0) >= 40,
    },

    // ── COLLABORATION ─────────────────────────────────────────────
    {
      id: "lone_wolf", label: "Lone Wolf", icon: "feather", color: "#c4b5fd", rarity: "uncommon",
      importance: imp("uncommon", 1), detail: "Flying solo",
      explanation: "Big output, few PRs. You work alone and ship anyway. No committees needed.",
      earned: t.totalCommits >= 150 && (t.mergedPRs ?? 0) < 5,
    },
    {
      id: "team_player", label: "Team Player", icon: "merge", color: "#22c55e", rarity: "uncommon",
      importance: imp("uncommon", 3), detail: `${t.mergedPRs ?? 0} PRs merged`,
      explanation: "PRs merged, feedback given, collaboration done. A genuine team player.",
      earned: (t.mergedPRs ?? 0) >= 15,
    },
    {
      id: "fork_magnet", label: "Fork Magnet", icon: "fork", color: "#60a5fa", rarity: "uncommon",
      importance: imp("uncommon", 4), detail: `${t.totalForks ?? 0} forks`,
      explanation: "Your repos get forked. Other devs are using your work as a foundation to build on.",
      earned: (t.totalForks ?? 0) >= 15,
    },
    {
      id: "repo_hoarder", label: "Repo Hoarder", icon: "columns", color: "#34d399", rarity: "uncommon",
      importance: imp("uncommon"), detail: `${t.ownedRepoCount ?? 0} repos`,
      explanation: "Your GitHub is a gallery of projects. You don't just code — you collect.",
      earned: (t.ownedRepoCount ?? 0) >= 20,
    },

    // ── VOLUME MILESTONES ─────────────────────────────────────────
    {
      id: "power_user", label: "Power User", icon: "rocket", color: "#f472b6", rarity: "uncommon",
      importance: imp("uncommon", 6), detail: `${t.totalCommits.toLocaleString()} commits`,
      explanation: "500+ commits and still pushing. This isn't a hobby — it's a lifestyle.",
      earned: t.totalCommits >= 500,
    },
    {
      id: "hyper_coder", label: "Hyper Coder", icon: "layers", color: "#a78bfa", rarity: "rare",
      importance: imp("rare", 2), detail: `${t.totalCommits.toLocaleString()} commits`,
      explanation: "2,000+ commits. You're not just active — you're in another league entirely.",
      earned: t.totalCommits >= 2000,
    },
    {
      id: "skull_legend", label: "Skull Legend", icon: "skull", color: "#ef4444", rarity: "legendary",
      importance: imp("legendary"), detail: `${t.totalCommits.toLocaleString()} commits`,
      explanation: "5,000+ commits. You've outlasted every excuse, every distraction, every doubt.",
      earned: t.totalCommits >= 5000,
    },
    {
      id: "peak_performer", label: "Peak Performer", icon: "gauge", color: "#e879f9", rarity: "epic",
      importance: imp("epic", 2), detail: `${s.intensity} intensity`,
      explanation: "Intensity in the top percentile. You don't just commit — you push hard every session.",
      earned: s.intensity >= 80,
    },

    // ── STREAK MILESTONES ─────────────────────────────────────────
    {
      id: "marathon_dev", label: "Marathon Dev", icon: "infinity", color: "#4ade80", rarity: "rare",
      importance: imp("rare", 4), detail: `${t.longestStreak}d streak`,
      explanation: "50 consecutive coding days. That's not a streak — that's a way of life.",
      earned: t.longestStreak >= 50,
    },
    {
      id: "legend_streak", label: "Legend Streak", icon: "mountain", color: "#fbbf24", rarity: "legendary",
      importance: imp("legendary", 1), detail: `${t.longestStreak}d streak`,
      explanation: "100 days straight. You've turned coding into a daily meditation. Absolute legend.",
      earned: t.longestStreak >= 100,
    },

    // ── IMPACT & INFLUENCE ────────────────────────────────────────
    {
      id: "star_earner", label: "Star Earner", icon: "medal", color: "#fbbf24", rarity: "common",
      importance: imp("common", 4), detail: `${t.totalStars ?? 0} stars`,
      explanation: "Your repos light up the night sky. People are starring your work.",
      earned: (t.totalStars ?? 0) >= 10,
    },
    {
      id: "star_builder", label: "Star Builder", icon: "telescope", color: "#38bdf8", rarity: "rare",
      importance: imp("rare", 5), detail: `${t.totalStars ?? 0} stars`,
      explanation: "100+ GitHub stars. You're building things people genuinely love and bookmark.",
      earned: (t.totalStars ?? 0) >= 100,
    },
    {
      id: "galaxy_brain", label: "Galaxy Brain", icon: "atom", color: "#f59e0b", rarity: "epic",
      importance: imp("epic", 4), detail: `${t.totalStars ?? 0} stars`,
      explanation: "500+ stars across your work. You've built something that resonates at scale.",
      earned: (t.totalStars ?? 0) >= 500,
    },
    {
      id: "known_dev", label: "Known Dev", icon: "users", color: "#22d3ee", rarity: "common",
      importance: imp("common", 2), detail: `${t.followersCount ?? 0} followers`,
      explanation: "People follow you on GitHub. You've made yourself known in the community.",
      earned: (t.followersCount ?? 0) >= 20,
    },
    {
      id: "thought_leader", label: "Thought Leader", icon: "crown", color: "#c084fc", rarity: "epic",
      importance: imp("epic", 3), detail: `${t.followersCount ?? 0} followers`,
      explanation: "200+ followers. Your GitHub is a destination. People watch what you build.",
      earned: (t.followersCount ?? 0) >= 200,
    },

    // ── TIME OF DAY ───────────────────────────────────────────────
    {
      id: "morning_glory", label: "Morning Dev", icon: "sunrise", color: "#fde68a", rarity: "uncommon",
      importance: imp("uncommon"), detail: "Peak: dawn",
      explanation: "Your best work happens at sunrise. The world is quiet and so is your brain.",
      earned: (t.peakHour ?? -1) >= 5 && (t.peakHour ?? -1) <= 10,
    },
    {
      id: "prime_timer", label: "Prime Timer", icon: "star", color: "#c084fc", rarity: "common",
      importance: imp("common"), detail: "Peak: evening",
      explanation: "Peak productivity hits in the evening. Primetime for shipping code.",
      earned: (t.peakHour ?? -1) >= 19 && (t.peakHour ?? -1) <= 22,
    },
    {
      id: "night_shift", label: "Night Shift", icon: "coffee", color: "#818cf8", rarity: "rare",
      importance: imp("rare", 3), detail: `${Math.round(nightPct * 100)}% night`,
      explanation: "Half your commits land between midnight and dawn. Fuelled by coffee and determination.",
      earned: nightPct >= 0.5,
    },
    {
      id: "night_creature", label: "Night Creature", icon: "owl", color: "#4338ca", rarity: "rare",
      importance: imp("rare", 6), detail: `${s.nocturnal} nocturnal`,
      explanation: "The most extreme night owl. When others sleep, you're in full flow.",
      earned: s.nocturnal >= 60,
    },

    // ── LANGUAGE / STACK ──────────────────────────────────────────
    {
      id: "js_dev", label: "JS Native", icon: "diamond", color: "#f0e05a", rarity: "common",
      importance: imp("common", 1), detail: "JavaScript/TypeScript",
      explanation: "JavaScript or TypeScript is home base. The web is your playground.",
      earned: ["JavaScript", "TypeScript"].includes(t.topLanguage ?? ""),
    },
    {
      id: "pythonista", label: "Pythonista", icon: "satellite", color: "#4ec8f4", rarity: "common",
      importance: imp("common", 1), detail: "Python",
      explanation: "Python flows naturally — whether it's data, web, AI, or all three.",
      earned: t.topLanguage === "Python",
    },
    {
      id: "systems_builder", label: "Systems Builder", icon: "hammer", color: "#f97316", rarity: "rare",
      importance: imp("rare", 1), detail: t.topLanguage ?? "",
      explanation: "You code close to the metal — Rust, Go, C, or C++. Performance is the obsession.",
      earned: ["Rust", "Go", "C", "C++"].includes(t.topLanguage ?? ""),
    },

    // ── TENURE & ACTIVITY ─────────────────────────────────────────
    {
      id: "rising_dev", label: "Rising Dev", icon: "sparkles", color: "#e879f9", rarity: "common",
      importance: imp("common", 1), detail: "New & building fast",
      explanation: "Relatively new on GitHub but already shipping consistently. Just getting started.",
      earned: t.githubAgeYears <= 2 && t.totalCommits >= 50,
    },
    {
      id: "all_year_dev", label: "All-Year Dev", icon: "hourglass", color: "#94a3b8", rarity: "rare",
      importance: imp("rare", 5), detail: "10+ active months",
      explanation: "You were active in almost every month. No off-season, no excuses.",
      earned: (t.commitsByMonth ?? []).filter((v) => v > 0).length >= 10,
    },
    {
      id: "winter_coder", label: "Winter Coder", icon: "snowflake", color: "#93c5fd", rarity: "common",
      importance: imp("common"), detail: "Peaks in winter",
      explanation: "When it gets cold outside, you go inside and write code. Seasonal productivity.",
      earned: (() => {
        const m = t.commitsByMonth;
        if (!m) return false;
        const winter = (m[11] ?? 0) + (m[0] ?? 0) + (m[1] ?? 0);
        const total = m.reduce((a, b) => a + b, 0);
        return total > 0 && winter / total >= 0.35;
      })(),
    },
  ];

  return candidates
    .filter((b) => b.earned)
    .sort((a, b) => b.importance - a.importance)
    .map(({ earned: _earned, ...b }): TraitBadge => b);
}

export const BADGE_COUNT = 42;
