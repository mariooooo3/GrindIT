"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/lib/theme-context";
import { isValidGitHubUsername } from "@/lib/validation";
import { LOADING_MESSAGES, pickRandom } from "@/lib/loadingMessages";
import type { AiTone } from "@/types/wrapped";

export const PERIODS = [
  { label: "Last week",  value: "week",    requiresAuth: false },
  { label: "Last month", value: "month",   requiresAuth: false },
  { label: "Last year",  value: "year",    requiresAuth: false },
  { label: "All time",   value: "alltime", requiresAuth: true  },
] as const;

export type PeriodType = (typeof PERIODS)[number]["value"];

export function authCallbackUrl() {
  if (typeof window === "undefined") return "/";
  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  return `${window.location.origin}${window.location.pathname}`;
}

export function useWrappedHome() {
  const { data: session, status: sessionStatus } = useSession();
  const { worldCup, ready, animate } = useTheme();
  const isLoggedIn = !!session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUsername = (session as any)?.login ?? "";

  const [manualUsername, setManualUsername] = useState("");
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [tone, setTone] = useState<AiTone>("funny");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--hero-height", `${window.innerHeight}px`);
  }, []);

  const usernameTouched = manualUsername.length > 0;
  const usernameValid = isValidGitHubUsername(manualUsername);
  const username = isLoggedIn ? sessionUsername : manualUsername;

  const handleGenerate = useCallback(async () => {
    if (!username.trim() || loading) return;
    if (!isLoggedIn && !usernameValid) {
      setError("That doesn't look like a valid GitHub username");
      return;
    }
    setLoadingMsg(pickRandom(LOADING_MESSAGES));
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/github?username=${encodeURIComponent(username.trim())}&periodType=${periodType}`
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error("GitHub user not found");
        if (res.status === 429) throw new Error("GitHub rate limit — try again in a minute");
        if (res.status === 401) throw new Error("GitHub auth error — check server token in .env.local");
        const errBody = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errBody.error === "github_unavailable" ? "GitHub is unavailable, try again" : "Could not fetch GitHub data");
      }
      const rawData = await res.json();
      const analyzeRes = await fetch(`/api/analyze?tone=${tone}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawData),
      });
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const profile = await analyzeRes.json();
      sessionStorage.setItem("wrappedProfile", JSON.stringify({ ...profile, tone }));
      // Keep `loading` true through the navigation: window.location.href triggers a
      // full-page load, and the slides route shows its own LoadingScreen until the
      // profile is read. Resetting loading here would briefly hide the "generating"
      // message before the browser unloads, causing a visible flicker. We let the
      // new page replace the overlay instead — it's removed only once off-screen.
      window.location.href = `/wrapped/${encodeURIComponent(username.trim())}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [username, periodType, tone, loading, isLoggedIn, usernameValid]);

  return {
    session,
    sessionStatus,
    worldCup,
    ready,
    animate,
    isLoggedIn,
    sessionUsername,
    manualUsername,
    setManualUsername,
    periodType,
    setPeriodType,
    tone,
    setTone,
    loading,
    loadingMsg,
    error,
    usernameTouched,
    usernameValid,
    handleGenerate,
  };
}

export type WrappedHomeState = ReturnType<typeof useWrappedHome>;
