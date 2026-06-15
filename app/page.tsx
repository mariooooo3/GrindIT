"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import type { AiTone } from "@/types/wrapped";
import AuthButton from "@/components/ui/AuthButton";
import { HeroScene } from "@/components/HeroScene";

// ── constants ──────────────────────────────────────────────────────────────
const PERIODS = [
  { label: "Last week",  value: "week",    requiresAuth: false },
  { label: "Last month", value: "month",   requiresAuth: false },
  { label: "Last year",  value: "year",    requiresAuth: false },
  { label: "All time",   value: "alltime", requiresAuth: true  },
] as const;

const TONES: { label: string; value: AiTone }[] = [
  { label: "Funny 😄",        value: "funny"        },
  { label: "Brutal 💀",       value: "brutal"       },
  { label: "Motivational 🔥", value: "motivational" },
];

type PeriodType = (typeof PERIODS)[number]["value"];

const EASE = [0.32, 0.72, 0, 1] as const;
const pillBase = "rounded-full px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-all duration-300 border";
const pillOff  = "bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300";
const pillOn   = "bg-violet-500/[0.15] border-violet-500/40 text-violet-300 shadow-[0_0_14px_-4px_rgba(139,92,246,0.5)]";

// ── git branch commit nodes animation ─────────────────────────────────────
// Positions detected via PIL at 72×72 display: original_px * 72/1024
const BRANCH_NODES = [
  { x: 43, y: 16 }, // mid-left node
  { x: 58, y: 11 }, // top node
  { x: 62, y: 19 }, // right node
];

function CommitNodes() {
  const [lit, setLit] = useState<Set<number>>(new Set());

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const idx = Math.floor(Math.random() * BRANCH_NODES.length);
      setLit(prev => new Set([...prev, idx]));
      setTimeout(() => setLit(prev => { const n = new Set(prev); n.delete(idx); return n; }), 280 + Math.random() * 320);
      t = setTimeout(flash, 550 + Math.random() * 1300);
    };
    t = setTimeout(flash, 800 + Math.random() * 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {BRANCH_NODES.map((node, i) => (
        <span key={i} className="pointer-events-none absolute rounded-full"
          style={{
            left: node.x, top: node.y,
            width: 6, height: 6,
            marginLeft: -3, marginTop: -3,
            background: lit.has(i) ? "oklch(0.88 0.32 145)" : "transparent",
            boxShadow: lit.has(i)
              ? "0 0 10px 3px oklch(0.78 0.28 145 / 0.85), 0 0 4px 1px oklch(0.92 0.36 145)"
              : "none",
            transition: "background 0.12s ease, box-shadow 0.12s ease",
          }}
        />
      ))}
    </>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────
function GithubMark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
      <path d="M12 .5C5.73.5.99 5.24.99 11.51c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53 0-.26-.01-.95-.02-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.71-1.49-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.15-5.03 5.42.4.34.76 1.02.76 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.76.53 4.37-1.45 7.51-5.57 7.51-10.43C23.01 5.24 18.27.5 12 .5Z"/>
    </svg>
  );
}

function TrophyMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-7 w-7">
      <defs>
        <linearGradient id="trophyGold" x1="18" x2="46" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff2a8" />
          <stop offset="0.42" stopColor="#d7a83d" />
          <stop offset="1" stopColor="#7a5119" />
        </linearGradient>
      </defs>
      <path d="M18 12h28v10c0 10.8-5.9 19.5-14 19.5S18 32.8 18 22V12Z" fill="url(#trophyGold)" />
      <path d="M20 16h-8v5.4c0 6.7 4.3 11.3 10.4 11.9" fill="none" stroke="#d7a83d" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 16h8v5.4c0 6.7-4.3 11.3-10.4 11.9" fill="none" stroke="#d7a83d" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 41h8v8h-8z" fill="#b7842d" />
      <path d="M22 51h20l3 6H19l3-6Z" fill="url(#trophyGold)" />
      <path d="M25 17h14" stroke="#fff7c8" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function SoccerBallMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-7 w-7">
      <circle cx="32" cy="32" r="28" fill="#f8fafc" />
      <path d="M32 17 44 26l-4.5 14h-15L20 26l12-9Z" fill="#151515" />
      <path d="m32 17 2.4-9.2M44 26l9.2-2.6M39.5 40l5.7 7.8M24.5 40l-5.7 7.8M20 26l-9.2-2.6" stroke="#151515" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 5.5a26.5 26.5 0 1 1 0 53 26.5 26.5 0 0 1 0-53Z" fill="none" stroke="#d4d4d8" strokeWidth="3" />
      <path d="M21 12.5c-5.2 2.7-9.1 7.1-11.1 12.4M43 12.5c5.2 2.7 9.1 7.1 11.1 12.4M13.6 46.5c4.3 6.5 11 10 18.4 10s14.1-3.5 18.4-10" fill="none" stroke="#151515" strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />
    </svg>
  );
}

function WorldCupAccent() {
  return (
    <div className="pointer-events-none absolute right-12 bottom-2 hidden flex-col items-center gap-1 sm:flex">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/10 bg-amber-300/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute inset-1 rounded-full bg-amber-300/10 blur-md" />
        <div className="relative">
          <TrophyMark />
        </div>
      </div>
        <button
          type="button"
          aria-label="World Cup theme preview"
          className="pointer-events-auto group relative grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-zinc-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-zinc-900 active:scale-[0.95]"
        >
          <motion.span
            className="block"
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          >
            <SoccerBallMark />
          </motion.span>
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-300/0 transition-colors duration-500 group-hover:bg-emerald-300/[0.06]" />
        </button>
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-5xl px-5 pt-5 pointer-events-auto">
        {/* floating glass pill */}
        <div className="relative flex items-center justify-between rounded-full border border-white/[0.08] bg-black/50 px-3 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)]"
          style={{ backdropFilter: "blur(20px) saturate(1.6)" }}>
          {/* left: logo */}
          <a href="/" className="relative z-10 flex items-center gap-2">
            <div className="relative h-[72px] w-[72px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo1.png" alt="GitHub Wrapped" width={72} height={72}
                className="h-[72px] w-[72px] rounded-2xl object-cover select-none"
                draggable={false} />
              <CommitNodes />
            </div>
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-white/90">
              wrapped<span style={{ color: "var(--violet-glow)" }}>.dev</span>
            </span>
          </a>
          {/* center: tagline — absolutely positioned so it's truly centered */}
          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <div className="hidden flex-col items-center gap-1 md:flex">
              <span className="text-[17px] font-bold tracking-[-0.03em] text-white/90">
                Your GitHub story,{" "}
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(108deg,var(--silver),var(--violet-glow) 55%,var(--commit-green))" }}>
                  unwrapped.
                </span>
              </span>
              <a
                href="#features"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  window.history.pushState(null, "", "#features");
                }}
                className="pointer-events-auto rounded-full border border-violet-300/20 bg-white/[0.075] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-300 shadow-[0_6px_18px_-12px_rgba(167,139,250,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-violet-400/[0.16] hover:text-white hover:shadow-[0_10px_24px_-14px_rgba(167,139,250,1),inset_0_1px_0_rgba(255,255,255,0.16)] active:translate-y-0 active:scale-[0.96]"
              >
                How it works
              </a>
            </div>
          </div>
          {/* right: auth + eyebrow sub-label */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <AuthButton />
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--commit-green)" }} />
              Developer Recap · Any Period
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── TV signal-loss effect (8s cycle) ──────────────────────────────────────
// 0–2.8s: clean | 2.8–3.3s: lines burst | 3.3–3.6s: hard cut to blur
// 3.6–6s: signal lost | 6–6.6s: flicker recovery | 6.6–7s: clear | 7–8s: stable
function TVSignal() {
  return (
    <div className="relative overflow-hidden rounded-[0.55rem]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video src="/vid2.mp4" autoPlay loop muted playsInline className="block w-full" />

      {/* CRT scanlines */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.045) 3px, rgba(0,0,0,0.045) 4px)" }} />
      {/* glass glare */}
      <div className="pointer-events-none absolute inset-0 z-20"
        style={{ background: "radial-gradient(ellipse at 32% 18%, rgba(255,255,255,0.07), transparent 52%)" }} />

      {/* ── glitch line A ── */}
      <motion.div className="pointer-events-none absolute inset-x-0 z-30 h-[3px]"
        style={{ top: "22%", background: "rgba(255,255,255,1)" }}
        animate={{ opacity: [0,0,1,0,1,0,0,1,0,0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear",
          times: [0,0.33,0.36,0.38,0.41,0.44,0.75,0.79,0.83,1] }} />

      {/* ── glitch line B ── */}
      <motion.div className="pointer-events-none absolute inset-x-0 z-30 h-[3px]"
        style={{ top: "61%", background: "rgba(200,220,255,1)" }}
        animate={{ opacity: [0,0,0,1,0,1,0,0,0.8,0,0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear",
          times: [0,0.34,0.36,0.38,0.40,0.43,0.45,0.76,0.80,0.84,1] }} />

      {/* ── glitch line C (thicker band) ── */}
      <motion.div className="pointer-events-none absolute inset-x-0 z-30 h-[5px]"
        style={{ top: "42%", background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))" }}
        animate={{ opacity: [0,0,0,0.9,1,0,0,0.7,0,0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear",
          times: [0,0.35,0.38,0.40,0.43,0.46,0.77,0.81,0.85,1] }} />

      {/* ── rolling band ── */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 z-[31]"
        style={{ height: 20, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.5) 60%, transparent)" }}
        animate={{
          top:     ["5%", "5%", "5%", "40%",  "80%",  "105%", "105%", "5%",  "55%", "5%"],
          opacity: [0,    0,    0,    1,       1,      0.3,    0,      0,     0.7,   0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear",
          times: [0,0.33,0.37,0.40,0.44,0.46,0.48,0.75,0.81,1] }} />

      {/* ── full blur — hard cut in, hard cut out ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[35]"
        style={{
          backdropFilter: "blur(16px) brightness(1.4) contrast(0.4) saturate(0.15)",
          WebkitBackdropFilter: "blur(16px) brightness(1.4) contrast(0.4) saturate(0.15)",
          background: "repeating-linear-gradient(0deg, rgba(220,220,220,0.08) 0px, rgba(220,220,220,0.08) 1px, transparent 1px, transparent 4px)",
        }}
        animate={{ opacity: [0,0,0,1,1,0.7,0,0.5,0,0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear",
          times: [0,0.44,0.46,0.48,0.75,0.78,0.82,0.84,0.87,1] }} />
    </div>
  );
}

// ── pixel-star font & renderer ─────────────────────────────────────────────
const GLYPH: Record<string, number[][]> = {
  A: [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0]],
  P: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  D: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
};
const CELL = 7;
const CHAR_GAP = 4;
const WORD_GAP = 10;

function buildStars(lines: string[]) {
  const stars: { x: number; y: number; delay: number; dur: number }[] = [];
  let s = 7;
  const rnd = () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
  let baseY = 0;
  for (const line of lines) {
    let curX = 0;
    for (const ch of line) {
      if (ch === " ") { curX += WORD_GAP; continue; }
      const g = GLYPH[ch];
      if (!g) { curX += CELL * 5 + CHAR_GAP; continue; }
      for (let row = 0; row < g.length; row++)
        for (let col = 0; col < g[row].length; col++)
          if (g[row][col]) stars.push({ x: curX + col * CELL, y: baseY + row * CELL, delay: rnd() * 3, dur: 1.0 + rnd() * 2.0 });
      curX += 5 * CELL + CHAR_GAP;
    }
    baseY += 5 * CELL + 10;
  }
  return stars;
}

const PIXEL_STARS = buildStars(["ALL TIME", "WRAPPER"]);

function StarPixelText({ onConnect, isLoggedIn }: { onConnect: () => void; isLoggedIn: boolean }) {
  return (
    <div className="flex flex-col items-start gap-4 select-none">
      <style>{`@keyframes sf{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div className="relative cursor-pointer" style={{ width: 280, height: 108 }}
        onClick={!isLoggedIn ? onConnect : undefined}
      >
        {PIXEL_STARS.map((st, i) => {
          const green = i % 7 === 0;
          return (
            <span key={i} className="pointer-events-none absolute"
              style={{
                left: st.x, top: st.y,
                width: CELL, height: CELL,
                fontSize: CELL + 1,
                lineHeight: 1,
                color: green ? "rgb(134,239,172)" : "rgb(196,181,253)",
                textShadow: green
                  ? "0 0 5px rgba(74,222,128,0.95), 0 0 10px rgba(74,222,128,0.6)"
                  : "0 0 5px rgba(167,139,250,0.95), 0 0 10px rgba(139,92,246,0.6)",
                animation: `sf ${st.dur}s ease-in-out ${st.delay}s infinite`,
              }}
            >✦</span>
          );
        })}
      </div>
      {isLoggedIn && (
        <p className="text-[8px] tracking-[0.22em] uppercase" style={{ color: "rgba(74,222,128,0.6)" }}>✓ unlocked</p>
      )}
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
function HomePageInner() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const sessionUsername = session?.login ?? "";

  const [manualUsername, setManualUsername] = useState("");
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [tone,       setTone]       = useState<AiTone>("funny");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const username = isLoggedIn ? sessionUsername : manualUsername;

  const handleGenerate = useCallback(async () => {
    if (!username.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const token = session?.accessToken;
      const res = await fetch(
        `/api/github?username=${encodeURIComponent(username.trim())}&periodType=${periodType}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
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
      window.location.href = `/wrapped/${encodeURIComponent(username.trim())}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [username, periodType, tone, loading, session]);

  return (
    <main className="relative overflow-hidden text-white" style={{ background: "var(--space-deep)" }}>
      <Nav />

      {/* ══ HERO — full-screen scene, content overlaid at bottom ══════════ */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-end pb-4 pt-20">
        <HeroScene />

        {/* top fade — covers nav area */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36"
          style={{ background: "linear-gradient(to bottom,color-mix(in oklab,var(--space-deep) 85%,transparent),transparent)" }} />
        {/* bottom fade — blends scene into content */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
          style={{ background: "linear-gradient(to top,var(--space-deep) 35%,color-mix(in oklab,var(--space-deep) 50%,transparent) 68%,transparent)" }} />

        {/* ── hero TV — right side, xl screens only ── */}
        <motion.div
          className="pointer-events-none absolute right-10 top-[54%] z-[5] hidden -translate-y-1/2 xl:block"
          style={{ width: "min(21vw, 270px)" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ambient glow behind TV */}

          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.45) 0%, rgba(74,222,128,0.18) 55%, transparent 75%)", opacity: 0.7 }} />

          {/* antennas */}
          <div className="absolute left-1/2 -top-9 -translate-x-1/2 flex gap-5">
            <div className="relative h-9 w-[2px] origin-bottom -rotate-12 rounded-full"
              style={{ background: "linear-gradient(to top, rgba(139,92,246,0.9), rgba(139,92,246,0.1))" }}>
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(139,92,246,1)", boxShadow: "0 0 10px 3px rgba(139,92,246,0.8)", display: "block" }} />
            </div>
            <div className="relative h-9 w-[2px] origin-bottom rotate-12 rounded-full"
              style={{ background: "linear-gradient(to top, rgba(74,222,128,0.9), rgba(74,222,128,0.1))" }}>
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(74,222,128,1)", boxShadow: "0 0 10px 3px rgba(74,222,128,0.8)", display: "block" }} />
            </div>
          </div>

          {/* TV body */}
          <div className="relative rounded-[1.5rem] p-[10px]"
            style={{
              background: "linear-gradient(145deg, #1c0e3f 0%, #0a0618 45%, #130a28 100%)",
              border: "1.5px solid rgba(139,92,246,0.22)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 50px rgba(0,0,0,0.95), 0 0 40px rgba(139,92,246,0.12)",
            }}>

            {/* screen bezel */}
            <div className="rounded-[0.85rem] p-[5px]"
              style={{ background: "rgba(0,0,0,0.85)", boxShadow: "inset 0 2px 12px rgba(0,0,0,1), inset 0 0 0 1px rgba(255,255,255,0.03)" }}>
              <TVSignal />
            </div>

            {/* bottom control strip */}
            <div className="mt-2 flex items-center justify-between px-1.5">
              <div className="flex items-center gap-1.5">
                <motion.span className="block h-1.5 w-1.5 rounded-full"
                  animate={{
                    background: ["#4ade80","#4ade80","#facc15","#ef4444","#ef4444","#facc15","#4ade80","#4ade80"],
                    boxShadow: ["0 0 6px 2px rgba(74,222,128,0.75)","0 0 6px 2px rgba(74,222,128,0.75)","0 0 6px 2px rgba(250,204,21,0.75)","0 0 6px 2px rgba(239,68,68,0.75)","0 0 6px 2px rgba(239,68,68,0.75)","0 0 6px 2px rgba(250,204,21,0.75)","0 0 6px 2px rgba(74,222,128,0.75)","0 0 6px 2px rgba(74,222,128,0.75)"],
                  }}
                  transition={{ duration: 8, times: [0,0.33,0.46,0.50,0.75,0.82,0.90,1], repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[6px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "rgba(139,92,246,0.55)", fontFamily: "monospace" }}>SPACE·1</span>
              </div>
              <div className="flex gap-1.5">
                {["-20deg", "25deg"].map((rot, i) => (
                  <div key={i} className="relative h-[14px] w-[14px] rounded-full"
                    style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), rgba(0,0,0,0.7))", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.07)" }}>
                    <div className="absolute left-1/2 top-[18%] h-[38%] w-[2px] -translate-x-1/2 rounded-full"
                      style={{ background: "rgba(255,255,255,0.28)", transform: `translateX(-50%) rotate(${rot})`, transformOrigin: "bottom center" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TV stand */}
          <div className="flex flex-col items-center">
            <div className="h-4 w-5"
              style={{ background: "linear-gradient(to bottom, #1c0e3f, #0a0618)", borderLeft: "1.5px solid rgba(139,92,246,0.18)", borderRight: "1.5px solid rgba(139,92,246,0.18)", borderBottom: "1.5px solid rgba(139,92,246,0.18)", borderRadius: "0 0 3px 3px" }} />
            <div className="h-[5px] w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 30%, rgba(74,222,128,0.35) 70%, transparent 100%)", boxShadow: "0 0 14px 2px rgba(139,92,246,0.35)" }} />
          </div>
        </motion.div>

        {/* ── star callout — left center ── */}
        <motion.div
          className="pointer-events-none absolute left-24 z-[6] hidden lg:block"
          style={{ top: "60%", transform: "translateY(-50%)" }}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 1.0, ease: EASE }}
        >
          <StarPixelText isLoggedIn={isLoggedIn} onConnect={() => signIn("github")} />
        </motion.div>

        {/* ── content overlay ── */}
        <div className="relative z-10 mx-auto w-full max-w-xl px-5">
          <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="relative flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-black/50 px-5 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)]"
            style={{ backdropFilter: "blur(20px) saturate(1.6)" }}
          >
            <p className="text-center text-[12px] font-bold leading-snug text-zinc-200">
              Pick any period — week, month, year or all time. Get a cinematic recap of your commits, repos, languages and streaks.
            </p>
            {/* username row — shown only when not logged in */}
            <WorldCupAccent />
            {!isLoggedIn && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <GithubMark size={13} />
                  </span>
                  <input
                    type="text" value={manualUsername}
                    onChange={e => setManualUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleGenerate()}
                    placeholder="github username"
                    className="w-full rounded-2xl border border-white/[0.1] bg-black/50 py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-zinc-600 focus:border-violet-500/40 focus:bg-black/70 focus:outline-none transition-all duration-300"
                    style={{ backdropFilter: "blur(16px)" }}
                  />
                </div>
                <button onClick={handleGenerate} disabled={loading || !manualUsername.trim()}
                  className="group flex items-center gap-2 rounded-2xl px-5 py-2 text-[13px] font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(118deg,var(--violet-glow),color-mix(in oklab,var(--violet-glow) 65%,var(--commit-green)))",
                    boxShadow: "0 6px 24px -6px color-mix(in oklab,var(--violet-glow) 55%,transparent),inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  {loading ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : <>Generate →</>}
                </button>
              </div>
            )}

            {/* logged-in: show username + big generate button */}
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/[0.1] bg-black/30 px-3 py-2">
                  {session.user?.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt={sessionUsername} className="h-5 w-5 rounded-full" />
                  )}
                  <span className="text-[13px] text-white/70">@{sessionUsername}</span>
                </div>
                <button onClick={handleGenerate} disabled={loading || !sessionUsername}
                  className="flex items-center gap-2 rounded-2xl px-5 py-2 text-[13px] font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(118deg,var(--violet-glow),color-mix(in oklab,var(--violet-glow) 65%,var(--commit-green)))",
                    boxShadow: "0 6px 24px -6px color-mix(in oklab,var(--violet-glow) 55%,transparent),inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  {loading ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : <>Generate →</>}
                </button>
              </div>
            )}

            {/* period row */}
            <div className="flex items-center justify-center gap-1.5">
              {PERIODS.map(({ label, value, requiresAuth }) => {
                const locked = requiresAuth && !isLoggedIn;
                return (
                  <button key={value}
                    onClick={() => !locked && setPeriodType(value as PeriodType)}
                    title={locked ? "Connect GitHub to unlock All time" : undefined}
                    className={`${pillBase} ${!locked && periodType === value ? pillOn : ""} ${locked ? "opacity-35 cursor-not-allowed" : !locked && periodType !== value ? pillOff : ""}`}>
                    {label}{locked && " 🔒"}
                  </button>
                );
              })}
            </div>
            {/* tone row */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">AI tone</span>
              {TONES.map(({ label, value }) => (
                <button key={value} onClick={() => setTone(value)}
                  className={`${pillBase} ${tone === value ? pillOn : pillOff}`}>
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-[11px] text-red-400/90">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section id="features" className="relative scroll-mt-28 px-5 py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }}>
            {/* outer shell */}
            <div className="rounded-[1.7rem] border border-white/[0.08] bg-white/[0.025] p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {/* inner core */}
              <div className="relative overflow-hidden rounded-[calc(1.7rem-5px)] bg-black/45 px-5 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] md:px-7 md:py-7">
                {/* accent glow spot */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, var(--violet-glow), transparent 70%)", filter: "blur(16px)" }} />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full opacity-[0.15]"
                  style={{ background: "radial-gradient(circle, var(--commit-green), transparent 70%)", filter: "blur(16px)" }} />

                <div className="relative grid items-center gap-7 md:grid-cols-[1fr_0.9fr]">
                  <div className="text-center md:text-left">
                <span className="relative inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  How it works
                </span>
                <h2 className="relative mt-4 text-[22px] font-bold leading-tight tracking-[-0.03em] text-white md:text-[28px]">
                  Your GitHub activity, decoded into a cinematic recap.
                </h2>
                <p className="relative mt-5 text-[14px] leading-relaxed text-zinc-300">
                  Generate a cinematic recap of your GitHub year for any period. For the most complete
                  experience, authentication is recommended: the{" "}
                  <span className="font-semibold text-violet-300">All time</span> mode unlocks once you
                  connect your GitHub account.
                </p>
                <p className="relative mt-3 text-[13px] leading-relaxed text-zinc-500">
                  Every month we ship a fresh <span className="font-semibold text-zinc-300">visual theme</span>{" "}to keep
                  things diverse — and this month&apos;s theme is{" "}
                  <span className="font-semibold" style={{ color: "var(--commit-green)" }}>World Cup</span> ⚽
                </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-3 rounded-[1.4rem] bg-[radial-gradient(circle_at_50%_75%,rgba(139,92,246,0.28),transparent_58%)]" />
                    <div className="relative rounded-[1.35rem] border border-white/[0.08] bg-white/[0.035] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="overflow-hidden rounded-[calc(1.35rem-0.5rem)] border border-white/[0.08] bg-black shadow-[0_20px_70px_-35px_rgba(139,92,246,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logo2.png"
                          alt="Terminal cat illustration"
                          width={520}
                          height={325}
                          className="aspect-[16/10] w-full object-cover object-center opacity-95"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="py-10 text-center">
        <div className="mx-auto max-w-xs border-t border-white/[0.06] pt-8">
          <p className="text-[11px] text-zinc-700">
            Made with GitHub API · No data stored · Open source
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function HomePage() {
  return <HomePageInner />;
}
