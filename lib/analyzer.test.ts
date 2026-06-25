import { describe, it, expect } from "vitest";
import { calculateMetrics, calculateAchievements } from "@/lib/analyzer";
import type { GitHubRawData, Contribution } from "@/types/wrapped";

function contrib(date: string, count: number, hour = 12, repoName = "repo-a"): Contribution {
  return { date, count, hour, repoName };
}

function makeRawData(overrides: Partial<GitHubRawData> = {}): GitHubRawData {
  return {
    user: {
      login: "tester", name: "Tester", avatarUrl: "", bio: null,
      accountCreatedAt: "2018-01-01", publicReposCount: 3,
      followersCount: 10, pinnedRepos: [],
    },
    repos: [
      {
        name: "repo-a", description: null, language: "TypeScript", stargazersCount: 12,
        forksCount: 2, isPrivate: false, createdAt: "2020-01-01", pushedAt: "2024-06-01",
        isFork: false, topics: [],
      },
    ],
    contributions: [],
    languages: [
      { language: "TypeScript", linesOfCode: 1000, repoCount: 2, percentage: 60, color: "#3178c6" },
      { language: "Python", linesOfCode: 400, repoCount: 1, percentage: 25, color: "#f1c40f" },
      { language: "Go", linesOfCode: 200, repoCount: 1, percentage: 15, color: "#22d3ee" },
    ],
    pullRequests: [],
    prsOpened: 0,
    issueContributions: { opened: 0 },
    totalStarsReceived: 12,
    totalForksReceived: 2,
    commitStats: null,
    period: { type: "month", startDate: "2024-06-01", endDate: "2024-06-30", label: "Last 30 days" },
    ...overrides,
  };
}

describe("calculateMetrics", () => {
  it("sums total commits", () => {
    const data = makeRawData({ contributions: [contrib("2024-06-03", 5), contrib("2024-06-04", 3)] });
    expect(calculateMetrics(data).totalCommits).toBe(8);
  });

  it("computes the longest streak across consecutive days", () => {
    const data = makeRawData({
      contributions: [
        contrib("2024-06-03", 1), contrib("2024-06-04", 1), contrib("2024-06-05", 1), // 3-day run
        contrib("2024-06-10", 1), // gap then single day
      ],
    });
    expect(calculateMetrics(data).streak.longestStreak).toBe(3);
  });

  it("keeps weekday + weekend = total active days, computed in UTC", () => {
    const data = makeRawData({
      contributions: [
        contrib("2024-06-03", 1), // Mon
        contrib("2024-06-07", 1), // Fri
        contrib("2024-06-08", 1), // Sat
        contrib("2024-06-09", 1), // Sun
      ],
    });
    const a = calculateMetrics(data).activeDays;
    expect(a.totalDays).toBe(4);
    expect(a.weekdayCount + a.weekendCount).toBe(a.totalDays);
    expect(a.weekdayCount).toBe(2);
    expect(a.weekendCount).toBe(2);
  });

  it("finds the peak commit hour", () => {
    const data = makeRawData({
      contributions: [contrib("2024-06-03", 1, 2), contrib("2024-06-04", 5, 23), contrib("2024-06-05", 1, 9)],
    });
    expect(calculateMetrics(data).hourBias.peakHour).toBe(23);
  });
});

describe("calculateAchievements", () => {
  const unlocked = (data: GitHubRawData, id: string) =>
    calculateAchievements(data, calculateMetrics(data)).find((a) => a.id === id)?.unlocked;

  it("unlocks Centurion at 100+ commits", () => {
    expect(unlocked(makeRawData({ contributions: [contrib("2024-06-03", 120)] }), "centurion")).toBe(true);
  });

  it("unlocks Polyglot with 3+ languages", () => {
    expect(unlocked(makeRawData({ contributions: [contrib("2024-06-03", 1)] }), "polyglot")).toBe(true);
  });

  it("does not unlock God Mode below 10k commits", () => {
    expect(unlocked(makeRawData({ contributions: [contrib("2024-06-03", 50)] }), "god_mode")).toBe(false);
  });
});
