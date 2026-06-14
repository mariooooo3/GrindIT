import type {
  GitHubUser,
  GitHubRepo,
  Contribution,
  LanguageStats,
  PullRequest,
  GitHubRawData,
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

const PULL_REQUESTS_QUERY = `
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: 50, states: [MERGED]) {
        nodes { title mergedAt }
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

  const u = await apiFetch<RawUser>(`${GH_API}/users/${username}`, token);

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
  };

  const all: GitHubRepo[] = [];
  let page = 1;
  const base = token
    ? `${GH_API}/user/repos?affiliation=owner&sort=pushed&per_page=100`
    : `${GH_API}/users/${username}/repos?sort=pushed&per_page=100`;

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
      }))
    );
    if (batch.length < 100) break;
    page++;
  }

  return all;
}

async function fetchLanguageStats(
  repos: GitHubRepo[],
  username: string,
  token?: string
): Promise<LanguageStats[]> {
  const bytes: Record<string, number> = {};
  const counts: Record<string, number> = {};

  await Promise.allSettled(
    repos
      .filter((r) => !r.isFork)
      .slice(0, 30)
      .map(async (r) => {
        try {
          const data = await apiFetch<Record<string, number>>(
            `${GH_API}/repos/${username}/${r.name}/languages`,
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

  const byDate = new Map<string, { count: number; hour: number; repoName: string }>();

  outer: for (let page = 1; page <= 3; page++) {
    let events: GHEvent[];
    try {
      events = await apiFetch<GHEvent[]>(
        `${GH_API}/users/${username}/events?per_page=100&page=${page}`
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
      } else {
        byDate.set(evDate, { count: commitCount, hour, repoName });
      }
    }
    if (events.length < 100) break;
  }

  return Array.from(byDate.entries())
    .map(([date, d]) => ({ date, count: d.count, hour: d.hour, repoName: d.repoName }))
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
  token?: string
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
    type SearchResult = {
      items: Array<{
        commit: { author: { date: string } };
        repository: { name: string };
      }>;
    };
    const { items } = await apiFetch<SearchResult>(
      `${GH_API}/search/commits?q=author:${username}&sort=author-date&per_page=100`,
      token
    );
    for (const c of items) {
      const d = new Date(c.commit.author.date);
      const key = d.toISOString().slice(0, 10);
      if (!hourMap[key]) hourMap[key] = { hour: d.getHours(), repo: c.repository.name };
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

async function fetchPullRequests(
  repos: GitHubRepo[],
  username: string,
  token?: string
): Promise<PullRequest[]> {
  if (!token) {
    // Without OAuth, use REST search API (public repos only, max 100 results)
    try {
      type SearchResult = { items: Array<{ title: string; merged_at: string | null; repository_url: string }> };
      const data = await apiFetch<SearchResult>(
        `${GH_API}/search/issues?q=author:${username}+type:pr+is:merged&sort=updated&per_page=50`
      );
      return data.items.map((pr) => ({
        repoName: pr.repository_url.split("/").pop() ?? "",
        title: pr.title,
        mergedAt: pr.merged_at,
        state: "merged" as const,
      }));
    } catch {
      return [];
    }
  }

  type PRData = {
    repository: {
      pullRequests: { nodes: Array<{ title: string; mergedAt: string | null }> };
    } | null;
  };

  const top = repos
    .filter((r) => !r.isFork)
    .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
    .slice(0, 10);

  const results = await Promise.allSettled(
    top.map((r) => gql<PRData>(PULL_REQUESTS_QUERY, { owner: username, name: r.name }, token))
  );

  return results.flatMap((res, i) => {
    if (res.status !== "fulfilled" || !res.value.repository) return [];
    return res.value.repository.pullRequests.nodes.map((pr) => ({
      repoName: top[i].name,
      title: pr.title,
      mergedAt: pr.mergedAt,
      state: pr.mergedAt ? ("merged" as const) : ("closed" as const),
    }));
  });
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

  const [languages, contributions, pullRequests] = await Promise.all([
    fetchLanguageStats(repos, username, token),
    fetchContributions(username, period, token),
    fetchPullRequests(repos, username, token),
  ]);

  return {
    user,
    repos,
    contributions,
    languages,
    pullRequests,
    totalStarsReceived: repos.reduce((s, r) => s + r.stargazersCount, 0),
    totalForksReceived: repos.reduce((s, r) => s + r.forksCount, 0),
    period,
  };
}
