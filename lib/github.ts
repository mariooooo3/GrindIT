import type {
  GitHubUser,
  GitHubRepo,
  Contribution,
  LanguageStats,
  PullRequest,
  GitHubRawData,
  CommitStats,
  Period,
} from "@/types/wrapped";

export type GitHubError = {
  type: "rate_limited" | "not_found" | "unauthorized" | "network" | "unknown";
  message: string;
  retryAfter?: number;
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Scala: "#c22d40",
};

const DEFAULT_COLOR = "#8b8b8b";
const GH_API = "https://api.github.com";
const SEARCH_PAGE_SIZE = 100;
const MAX_SEARCH_PAGES = 10;
const LANGUAGE_STATS_CONCURRENCY = 6;
// GitHub's public events endpoint only exposes the latest ~300 events.
// Scanning past 3 pages does not increase historical coverage.
const MAX_UNAUTH_EVENT_PAGES = 3;

function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "github-wrapped-app",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function toGitHubError(res: Response): GitHubError {
  if (res.status === 401) return { type: "unauthorized", message: "Unauthorized" };
  if (res.status === 404) return { type: "not_found", message: "Not found" };
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    const reset = res.headers.get("x-ratelimit-reset");
    const retryAfter = reset
      ? Math.max(0, Number(reset) - Math.floor(Date.now() / 1000))
      : 60;
    return { type: "rate_limited", message: "Rate limit exceeded", retryAfter };
  }
  return { type: "unknown", message: `HTTP ${res.status}` };
}

async function apiFetch<T>(url: string, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { headers: buildHeaders(token) });
  } catch {
    throw { type: "network", message: "Network request failed" } as GitHubError;
  }
  if (!res.ok) throw toGitHubError(res);
  return res.json() as Promise<T>;
}

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${GH_API}/graphql`, {
      method: "POST",
      headers: {
        ...(buildHeaders(token) as Record<string, string>),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw { type: "network", message: "GraphQL request failed" } as GitHubError;
  }
  if (!res.ok) throw toGitHubError(res);
  const json = (await res.json()) as { data: T; errors?: unknown[] };
  if (json.errors?.length) throw { type: "unknown", message: "GraphQL errors" } as GitHubError;
  return json.data;
}

const PINNED_REPOS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes { ... on Repository { name } }
      }
    }
  }
`;

const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

// Combined query: fetches PRs opened + issues opened in a contribution window.
// Using contributionsCollection avoids the unreliable merged:/created: search qualifiers
// and correctly includes private repos when using the user's own token.
const CONTRIB_EXTRAS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        pullRequestContributions(first: 100) {
          totalCount
          nodes {
            pullRequest {
              title
              mergedAt
              state
              repository { name }
            }
          }
        }
        issueContributions(first: 1) {
          totalCount
        }
      }
    }
  }
`;

export async function fetchGitHubUser(username: string, token?: string): Promise<GitHubUser> {
  type RawUser = {
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    created_at: string;
    public_repos: number;
    followers: number;
  };

  const u = await apiFetch<RawUser>(`${GH_API}/users/${encodeURIComponent(username)}`, token);

  let pinnedRepos: string[] = [];
  if (token) {
    try {
      type PinnedData = { user: { pinnedItems: { nodes: Array<{ name: string }> } } };
      const d = await gql<PinnedData>(PINNED_REPOS_QUERY, { username }, token);
      pinnedRepos = d.user.pinnedItems.nodes.map((n) => n.name);
    } catch (e) {
      console.error("fetchGitHubUser: pinned repos failed", e);
    }
  }

  return {
    login: u.login,
    name: u.name,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    accountCreatedAt: u.created_at,
    publicReposCount: u.public_repos,
    followersCount: u.followers,
    pinnedRepos,
  };
}

async function fetchGitHubRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  type RawRepo = {
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    private: boolean;
    created_at: string;
    pushed_at: string;
    fork: boolean;
    topics?: string[];
  };

  const all: GitHubRepo[] = [];
  let page = 1;
  let base = `${GH_API}/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100&type=owner`;

  if (token) {
    try {
      const viewer = await apiFetch<{ login: string }>(`${GH_API}/user`, token);
      if (viewer.login.toLowerCase() === username.toLowerCase()) {
        base = `${GH_API}/user/repos?affiliation=owner&sort=pushed&per_page=100`;
      }
    } catch (e) {
      console.error("fetchGitHubRepos: viewer lookup failed", e);
    }
  }

  while (true) {
    const batch = await apiFetch<RawRepo[]>(`${base}&page=${page}`, token);
    all.push(
      ...batch.map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        isPrivate: r.private,
        createdAt: r.created_at,
        pushedAt: r.pushed_at,
        isFork: r.fork,
        topics: r.topics ?? [],
      }))
    );
    if (batch.length < 100) break;
    page++;
  }

  return all;
}

function isDateInPeriod(date: string, period: Period): boolean {
  return date >= period.startDate && date <= period.endDate;
}

type CommitSearchItem = {
  commit: { message: string; author: { date: string } };
  repository: { name: string };
};

async function searchCommits(
  username: string,
  period: Period,
  token: string,
  maxPages = MAX_SEARCH_PAGES
): Promise<CommitSearchItem[]> {
  type SearchResult = { items: CommitSearchItem[] };
  const query = encodeURIComponent(`author:${username} author-date:${period.startDate}..${period.endDate}`);
  const items: CommitSearchItem[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= maxPages; page++) {
    const data = await apiFetch<SearchResult>(
      `${GH_API}/search/commits?q=${query}&sort=author-date&order=desc&per_page=${SEARCH_PAGE_SIZE}&page=${page}`,
      token
    );
    if (!data.items.length) break;

    for (const item of data.items) {
      const date = item.commit.author.date.slice(0, 10);
      if (!isDateInPeriod(date, period)) continue;

      const dedupeKey = `${item.repository.name}:${item.commit.author.date}:${item.commit.message}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      items.push(item);
    }

    if (data.items.length < SEARCH_PAGE_SIZE) break;
  }

  return items;
}

// Classify a commit message by conventional-commit type (with keyword fallback).
type CommitType = "fix" | "feat" | "refactor" | "docs" | "test" | "chore" | "other";
function classifyCommit(message: string): CommitType {
  const m = message.trim().toLowerCase();
  const conv = m.match(/^(\w+)(?:\([^)]*\))?!?:/)?.[1];
  if (conv) {
    if (["fix", "bugfix", "hotfix"].includes(conv)) return "fix";
    if (conv === "feat") return "feat";
    if (["refactor", "perf"].includes(conv)) return "refactor";
    if (["docs", "doc"].includes(conv)) return "docs";
    if (["test", "tests"].includes(conv)) return "test";
    if (["chore", "build", "ci", "style"].includes(conv)) return "chore";
  }
  if (/\b(fix|fixes|fixed|bug|bugfix|patch|hotfix)\b/.test(m)) return "fix";
  if (/\b(add|added|feat|feature|implement|introduce|create)\b/.test(m)) return "feat";
  if (/\b(refactor|cleanup|simplif|optimi|perf)\b/.test(m)) return "refactor";
  if (/\b(docs?|readme|comment)\b/.test(m)) return "docs";
  if (/\b(tests?|spec)\b/.test(m)) return "test";
  if (/\b(chore|bump|release|merge|ci|build|lint|format)\b/.test(m)) return "chore";
  return "other";
}

// Fetch commit messages from private owned repos. Search API doesn't index private repos,
// so we call the Commits REST endpoint per repo. One call per repo (per_page=100).
async function fetchPrivateRepoCommits(
  username: string,
  repos: GitHubRepo[],
  period: Period,
  token: string
): Promise<{ message: string }[]> {
  const privateOwned = repos.filter((r) => r.isPrivate && !r.isFork);
  const results: { message: string }[] = [];

  await Promise.allSettled(
    privateOwned.map(async (repo) => {
      try {
        type RawCommit = { commit: { message: string } };
        const commits = await apiFetch<RawCommit[]>(
          `${GH_API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/commits?author=${encodeURIComponent(username)}&since=${period.startDate}T00:00:00Z&until=${period.endDate}T23:59:59Z&per_page=100`,
          token
        );
        for (const c of commits) results.push({ message: c.commit.message });
      } catch {
        // repo may be empty or inaccessible — skip silently
      }
    })
  );

  return results;
}

// Best-effort: sample the user's recent commits and break them down by type.
// search/commits effectively requires auth, so this returns null when unauthenticated.
// When repos are provided, private repo commits are also classified (Search API misses them).
async function fetchCommitStats(
  username: string,
  period: Period,
  token?: string,
  cachedItems?: CommitSearchItem[],
  repos?: GitHubRepo[]
): Promise<CommitStats | null> {
  if (!token) return null;
  try {
    const publicItems = cachedItems ?? await searchCommits(username, period, token);

    const privateItems = repos
      ? await fetchPrivateRepoCommits(username, repos, period, token)
      : [];

    const totalSample = publicItems.length + privateItems.length;
    if (!totalSample) return null;

    const stats: CommitStats = {
      sampleSize: totalSample,
      fix: 0, feat: 0, refactor: 0, docs: 0, test: 0, chore: 0, other: 0,
      hourHistogram: Array(24).fill(0),
    };

    for (const it of publicItems) {
      stats[classifyCommit(it.commit.message)]++;
      const h = new Date(it.commit.author.date).getUTCHours();
      if (h >= 0 && h <= 23) stats.hourHistogram[h]++;
    }

    for (const pm of privateItems) {
      stats[classifyCommit(pm.message)]++;
    }

    return stats;
  } catch (e) {
    console.error("fetchCommitStats failed", e);
    return null;
  }
}

async function fetchLanguageStats(
  repos: GitHubRepo[],
  username: string,
  token?: string
): Promise<LanguageStats[]> {
  const bytes: Record<string, number> = {};
  const counts: Record<string, number> = {};
  const ownedRepos = repos.filter((r) => !r.isFork);

  for (let i = 0; i < ownedRepos.length; i += LANGUAGE_STATS_CONCURRENCY) {
    const batch = ownedRepos.slice(i, i + LANGUAGE_STATS_CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (r) => {
        try {
          const data = await apiFetch<Record<string, number>>(
            `${GH_API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(r.name)}/languages`,
            token
          );
          for (const [lang, b] of Object.entries(data)) {
            bytes[lang] = (bytes[lang] ?? 0) + b;
            counts[lang] = (counts[lang] ?? 0) + 1;
          }
        } catch (e) {
          console.error(`fetchLanguageStats: ${r.name} failed`, e);
        }
      })
    );
  }

  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  if (!total) return [];

  return Object.entries(bytes)
    .map(([language, b]) => ({
      language,
      linesOfCode: Math.round(b / 50),
      repoCount: counts[language] ?? 0,
      percentage: Math.round((b / total) * 1000) / 10,
      color: LANGUAGE_COLORS[language] ?? DEFAULT_COLOR,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

async function fetchContributionsUnauthed(
  username: string,
  period: Period
): Promise<Contribution[]> {
  type GHEvent = {
    type: string;
    created_at: string;
    payload: { size?: number; commits?: unknown[] };
    repo: { name: string };
  };

  const byDate = new Map<
    string,
    { count: number; weightedHour: number; repoCounts: Map<string, number> }
  >();

  outer: for (let page = 1; page <= MAX_UNAUTH_EVENT_PAGES; page++) {
    let events: GHEvent[];
    try {
      events = await apiFetch<GHEvent[]>(
        `${GH_API}/users/${encodeURIComponent(username)}/events?per_page=100&page=${page}`
      );
    } catch { break; }

    for (const ev of events) {
      const evDate = ev.created_at.slice(0, 10);
      if (evDate < period.startDate) break outer;
      if (ev.type !== "PushEvent") continue;
      if (evDate > period.endDate) continue;

      const commitCount = ev.payload.size ?? ev.payload.commits?.length ?? 1;
      const repoName = ev.repo.name.split("/")[1] ?? ev.repo.name;
      const hour = new Date(ev.created_at).getUTCHours();

      const existing = byDate.get(evDate);
      if (existing) {
        existing.count += commitCount;
        existing.weightedHour += hour * commitCount;
        existing.repoCounts.set(repoName, (existing.repoCounts.get(repoName) ?? 0) + commitCount);
      } else {
        byDate.set(evDate, {
          count: commitCount,
          weightedHour: hour * commitCount,
          repoCounts: new Map([[repoName, commitCount]]),
        });
      }
    }
    if (events.length < 100) break;
  }

  return Array.from(byDate.entries())
    .map(([date, d]) => {
      const repoName =
        Array.from(d.repoCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
      return {
        date,
        count: d.count,
        hour: Math.round(d.weightedHour / d.count),
        repoName,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

type CalData = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: Array<{
          contributionDays: Array<{ date: string; contributionCount: number }>;
        }>;
      };
    };
  };
};

// GitHub's contributionsCollection API only supports up to 1 year per query.
// This helper splits a date range into ≤1-year chunks.
function buildYearChunks(startDate: string, endDate: string): Array<{ from: string; to: string }> {
  const chunks: Array<{ from: string; to: string }> = [];
  let cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59Z`);

  while (cursor < end) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setFullYear(chunkEnd.getFullYear() + 1);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());

    chunks.push({
      from: cursor.toISOString(),
      to: chunkEnd.toISOString(),
    });

    cursor = new Date(chunkEnd);
    cursor.setMilliseconds(cursor.getMilliseconds() + 1);
  }

  return chunks;
}

async function fetchContributions(
  username: string,
  period: Period,
  token?: string,
  cachedItems?: CommitSearchItem[]
): Promise<Contribution[]> {
  if (!token) return fetchContributionsUnauthed(username, period);

  const chunks = buildYearChunks(period.startDate, period.endDate);

  const chunkResults = await Promise.allSettled(
    chunks.map(({ from, to }) =>
      gql<CalData>(CONTRIBUTIONS_QUERY, { username, from, to }, token).then((cal) =>
        cal.user.contributionsCollection.contributionCalendar.weeks
          .flatMap((w) => w.contributionDays)
          .filter((d) => d.contributionCount > 0)
      )
    )
  );

  const days = chunkResults.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  const hourMap: Record<string, { hour: number; repo: string }> = {};
  try {
    const items = cachedItems ?? await searchCommits(username, period, token);
    const byDate = new Map<string, { count: number; weightedHour: number; repoCounts: Map<string, number> }>();
    for (const c of items) {
      const d = new Date(c.commit.author.date);
      const key = d.toISOString().slice(0, 10);
      const existing = byDate.get(key);
      const repoName = c.repository.name;
      const hour = d.getUTCHours();
      if (existing) {
        existing.count += 1;
        existing.weightedHour += hour;
        existing.repoCounts.set(repoName, (existing.repoCounts.get(repoName) ?? 0) + 1);
      } else {
        byDate.set(key, {
          count: 1,
          weightedHour: hour,
          repoCounts: new Map([[repoName, 1]]),
        });
      }
    }
    for (const [date, stats] of byDate.entries()) {
      const repo =
        Array.from(stats.repoCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
      hourMap[date] = {
        hour: Math.round(stats.weightedHour / stats.count),
        repo,
      };
    }
  } catch (e) {
    console.error("fetchContributions: commit hours failed", e);
  }

  return days
    .map((d) => ({
      date: d.date,
      count: d.contributionCount,
      hour: hourMap[d.date]?.hour ?? 12,
      repoName: hourMap[d.date]?.repo ?? "",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

type ContribExtras = {
  pullRequests: PullRequest[];
  prsOpened: number;
  issuesOpened: number;
};

type ContribExtrasData = {
  user: {
    contributionsCollection: {
      pullRequestContributions: {
        totalCount: number;
        nodes: Array<{
          pullRequest: {
            title: string;
            mergedAt: string | null;
            state: string;
            repository: { name: string };
          };
        }>;
      };
      issueContributions: { totalCount: number };
    };
  };
};

async function fetchContribExtras(
  username: string,
  period: Period,
  token?: string
): Promise<ContribExtras> {
  // ── Authenticated: GraphQL contributionsCollection ──────────────────────
  // Correctly filters by period, includes private repos, avoids Search API quirks.
  if (token) {
    try {
      const chunks = buildYearChunks(period.startDate, period.endDate);
      const chunkResults = await Promise.allSettled(
        chunks.map(({ from, to }) =>
          gql<ContribExtrasData>(CONTRIB_EXTRAS_QUERY, { username, from, to }, token)
        )
      );
      const seen = new Set<string>();
      const pullRequests: PullRequest[] = [];
      let prsOpened = 0;
      let issuesOpened = 0;

      for (const r of chunkResults) {
        if (r.status !== "fulfilled") continue;
        const col = r.value.user.contributionsCollection;

        prsOpened += col.pullRequestContributions.totalCount;
        issuesOpened += col.issueContributions.totalCount;

        for (const n of col.pullRequestContributions.nodes) {
          const pr = n.pullRequest;
          if (!pr) continue;
          if (pr.state !== "MERGED" || !pr.mergedAt) continue;
          if (!isDateInPeriod(pr.mergedAt.slice(0, 10), period)) continue;
          const key = `${pr.repository.name}:${pr.title}`;
          if (seen.has(key)) continue;
          seen.add(key);
          pullRequests.push({
            repoName: pr.repository.name,
            title: pr.title,
            mergedAt: pr.mergedAt,
            state: "merged" as const,
          });
        }
      }

      return { pullRequests, prsOpened, issuesOpened };
    } catch (e) {
      console.error("[fetchContribExtras graphql] failed:", e);
      // fall through to Search API
    }
  }

  // ── Unauthenticated (or GraphQL fallback): Search API ───────────────────
  // Single request sorted by created:desc — mirrors the original working approach.
  // Avoids paginating through old PRs (rate-limit risk) and puts recent PRs first.
  const pullRequests: PullRequest[] = [];
  let issuesOpened = 0;

  try {
    type PRSearch = { items: Array<{ title: string; merged_at: string | null; repository_url: string }> };
    const data = await apiFetch<PRSearch>(
      `${GH_API}/search/issues?q=author:${username}+type:pr+is:merged&sort=updated&per_page=50`,
      token
    );
    for (const pr of data.items) {
      pullRequests.push({
        repoName: pr.repository_url.split("/").pop() ?? "",
        title: pr.title,
        mergedAt: pr.merged_at ?? "",
        state: "merged" as const,
      });
    }
  } catch (e) {
    console.error("[fetchContribExtras PRs] failed:", e);
  }

  try {
    type IssueSearch = { total_count: number };
    const issueQuery = encodeURIComponent(
      `author:${username} is:issue created:${period.startDate}..${period.endDate}`
    );
    const data = await apiFetch<IssueSearch>(
      `${GH_API}/search/issues?q=${issueQuery}&per_page=1`,
      token
    );
    issuesOpened = data.total_count;
  } catch (e) {
    console.error("[fetchContribExtras issues] failed:", e);
  }

  return { pullRequests, prsOpened: pullRequests.length, issuesOpened };
}

export async function fetchGitHubRawData(
  username: string,
  period: Period,
  token?: string
): Promise<GitHubRawData> {
  const [user, repos] = await Promise.all([
    fetchGitHubUser(username, token),
    fetchGitHubRepos(username, token),
  ]);

  // When authed, fetch search commits once and share between contributions (hours) and commitStats.
  // This avoids hitting the Search API twice for the same query.
  let cachedSearchItems: CommitSearchItem[] | undefined;
  if (token) {
    try {
      cachedSearchItems = await searchCommits(username, period, token);
    } catch (e) {
      console.error("fetchGitHubRawData: searchCommits failed", e);
    }
  }

  const [languages, contributions, extras, commitStats] = await Promise.all([
    fetchLanguageStats(repos, username, token),
    fetchContributions(username, period, token, cachedSearchItems),
    fetchContribExtras(username, period, token),
    fetchCommitStats(username, period, token, cachedSearchItems, repos),
  ]);

  return {
    user,
    repos,
    contributions,
    languages,
    pullRequests: extras.pullRequests,
    prsOpened: extras.prsOpened,
    issueContributions: { opened: extras.issuesOpened },
    totalStarsReceived: repos.reduce((s, r) => s + r.stargazersCount, 0),
    totalForksReceived: repos.reduce((s, r) => s + r.forksCount, 0),
    commitStats,
    period,
  };
}
