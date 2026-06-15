export type Period = {
  type: "week" | "month" | "year" | "alltime" | "custom";
  startDate: string;
  endDate: string;
  label: string;
};

export type GitHubUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  accountCreatedAt: string;
  publicReposCount: number;
  followersCount: number;
  pinnedRepos: string[];
};

export type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  isPrivate: boolean;
  createdAt: string;
  pushedAt: string;
  isFork: boolean;
  topics: string[];
};

// Best-effort breakdown of commit messages by conventional-commit type.
// Sampled (not exhaustive) and only populated when commit messages are reachable.
export type CommitStats = {
  sampleSize: number;
  fix: number;
  feat: number;
  refactor: number;
  docs: number;
  test: number;
  chore: number;
  other: number;
  hourHistogram: number[]; // 24 buckets, from real commit timestamps in the sample
};

export type Contribution = {
  date: string;
  count: number;
  hour: number;
  repoName: string;
};

export type LanguageStats = {
  language: string;
  linesOfCode: number;
  repoCount: number;
  percentage: number;
  color: string;
};

export type PullRequest = {
  repoName: string;
  title: string;
  mergedAt: string | null;
  state: "open" | "closed" | "merged";
};

export type GitHubRawData = {
  user: GitHubUser;
  repos: GitHubRepo[];
  contributions: Contribution[];
  languages: LanguageStats[];
  pullRequests: PullRequest[];
  totalStarsReceived: number;
  totalForksReceived: number;
  commitStats: CommitStats | null;
  period: Period;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
};

export type HourBias = {
  peakHour: number;
  peakHourLabel: string;
  isNocturnal: boolean;
  distributionByHour: number[];
};

export type ActiveDays = {
  totalDays: number;
  weekdayCount: number;
  weekendCount: number;
  weekendWarrior: boolean;
  mostActiveDayOfWeek: string;
};

export type Scores = {
  intensityScore: number;
  consistencyScore: number;
  nocturnalScore: number;
  openSourceScore: number;
  explorerScore: number;
  focusScore: number;
};

export type GrowthDelta = {
  previousPeriodCommits: number;
  currentPeriodCommits: number;
  deltaPercent: number;
  trend: "up" | "down" | "flat";
};

export type CalculatedMetrics = {
  totalCommits: number;
  streak: StreakData;
  hourBias: HourBias;
  activeDays: ActiveDays;
  scores: Scores;
  growthDelta: GrowthDelta;
  topRepo: GitHubRepo;
  languageEntropy: number;
  repoSpread: number;
  firstContributionDate: string;
  githubAge: number;
};

export type AchievementId =
  | "night_owl"
  | "on_fire"
  | "polyglot"
  | "weekend_warrior"
  | "speed_demon"
  | "architect"
  | "consistent"
  | "midnight_coder"
  | "open_source_hero"
  | "graveyard_keeper"
  | "centurion"
  | "grandmaster"
  | "machine"
  | "marathoner"
  | "unstoppable"
  | "early_bird"
  | "polyglot_master"
  | "specialist"
  | "repo_baron"
  | "star_collector"
  | "star_magnate"
  | "forked"
  | "influencer"
  | "veteran"
  | "decade_dev"
  | "fixer"
  | "feature_factory"
  | "documenter"
  | "rising_star";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Achievement = {
  id: AchievementId;
  icon: string; // GlyphName from components/wrapped/TrophyIcons
  color: string;
  rarity: Rarity;
  importance: number;
  label: string;
  description: string;
  unlocked: boolean;
  unlockedReason: string | null;
};

export type ArchetypeId =
  | "builder"
  | "night_owl"
  | "explorer"
  | "architect"
  | "ghost"
  | "open_source_hero"
  | "grinder"
  | "chaotic_builder";

export type ArchetypeWeight = {
  id: ArchetypeId;
  label: string;
  weight: number;
};

export type ArchetypeBlend = {
  primary: ArchetypeWeight;
  secondary: ArchetypeWeight | null;
  tertiary: ArchetypeWeight | null;
  label: string;
};

export type InsightId = string;

export type Insight = {
  id: InsightId;
  value: string | number;
  importanceScore: number;
  noveltyBonus: number;
  emotionBonus: number;
  finalScore: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  confidence: number;
};

export type SelectedInsights = {
  primaryArchetype: Insight;
  narrativeTop3: Insight[];
  achievementsTop3: Insight[];
  mainStoryArc: Insight;
};

export type ThemeId = "intense" | "chill" | "nostalgic" | "epic";

export type VisualTheme = {
  id: ThemeId;
  primaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  label: string;
};

export type AiTone = "funny" | "brutal" | "motivational";

export type NarrativeOutput = {
  roastLine: string;
  archetypeDescription: string;
  introVibeLine: string;
  shareCaption: string;
  generatedAt: string;
  fromCache: boolean;
  isFallback?: boolean;
};

export type WrappedProfile = {
  user: GitHubUser;
  period: Period;
  raw: GitHubRawData;
  metrics: CalculatedMetrics;
  achievements: Achievement[];
  archetypeBlend: ArchetypeBlend;
  insights: SelectedInsights;
  theme: VisualTheme;
  tone: AiTone;
  narrative: NarrativeOutput | null;
  generatedAt: string;
  cacheKey: string;
};

export type SlideId =
  | "intro"
  | "contributions"
  | "languages"
  | "top_repo"
  | "journey"
  | "achievements"
  | "archetype"
  | "share";

export type SlideState = {
  current: SlideId;
  index: number;
  total: number;
  visited: SlideId[];
};
