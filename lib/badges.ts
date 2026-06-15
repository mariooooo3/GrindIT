// Trait/vibe badges for the archetype slide (slide 7). Distinct from the
// milestone trophies on slide 6: these describe *who the developer is* and are
// derived from the six behavioural scores plus a few standout flags. Each badge
// carries an importance used to rank and show only the strongest few.

export type TraitBadge = {
  id: string;
  label: string;
  icon: string; // GlyphName
  color: string;
  importance: number;
  detail: string;
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
};

export function deriveTraitBadges(t: TraitInput): TraitBadge[] {
  const s = t.scores;
  const nightPct = t.totalCommits > 0 ? t.nightCommits / t.totalCommits : 0;
  const candidates: (TraitBadge & { earned: boolean })[] = [
    { id: "intense",    label: "Intense",     icon: "flame",   color: "#fb7185", importance: s.intensity,   detail: `${s.intensity} intensity`,     earned: s.intensity >= 40 },
    { id: "consistent", label: "Consistent",  icon: "calendar",color: "#34d399", importance: s.consistency, detail: `${s.consistency} consistency`, earned: s.consistency >= 45 },
    { id: "nocturnal",  label: "Nocturnal",   icon: "moon",    color: "#818cf8", importance: s.nocturnal,   detail: `${s.nocturnal} after dark`,    earned: s.nocturnal >= 30 || nightPct >= 0.3 },
    { id: "openSource", label: "Open Source", icon: "heart",   color: "#f472b6", importance: s.openSource,  detail: `${s.openSource} reach`,        earned: s.openSource >= 25 },
    { id: "explorer",   label: "Explorer",    icon: "compass", color: "#22d3ee", importance: s.explorer,    detail: `${s.explorer} breadth`,        earned: s.explorer >= 40 },
    { id: "focused",    label: "Focused",     icon: "target",  color: "#a78bfa", importance: s.focus,       detail: `${s.focus} focus`,            earned: s.focus >= 50 },
    { id: "polyglot",   label: "Polyglot",    icon: "globe",   color: "#2dd4bf", importance: 50 + t.languageCount * 3, detail: `${t.languageCount} languages`, earned: t.languageCount >= 3 },
    { id: "weekend",    label: "Weekend Dev", icon: "swords",  color: "#fbbf24", importance: 72,            detail: "Every weekend",                earned: t.weekendWarrior },
    { id: "veteran",    label: "Veteran",     icon: "shield",  color: "#94a3b8", importance: 48 + t.githubAgeYears, detail: `${t.githubAgeYears}y on GitHub`, earned: t.githubAgeYears >= 5 },
    { id: "streaker",   label: "Streaker",    icon: "bolt",    color: "#f59e0b", importance: Math.min(60 + t.longestStreak, 100), detail: `${t.longestStreak}d streak`, earned: t.longestStreak >= 7 },
    { id: "rising",     label: "Rising",      icon: "trending",color: "#4ade80", importance: 55,            detail: `+${t.growthDelta}%`,           earned: t.growthTrend === "up" && t.growthDelta >= 30 },
  ];
  return candidates
    .filter((b) => b.earned)
    .sort((a, b) => b.importance - a.importance)
    .map((b): TraitBadge => ({ id: b.id, label: b.label, icon: b.icon, color: b.color, importance: b.importance, detail: b.detail }));
}
