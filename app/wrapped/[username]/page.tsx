"use client";

import { useState, useEffect, useCallback, useRef, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SlideIntro         from "@/components/slides/SlideIntro";
import SlideContributions from "@/components/slides/SlideContributions";
import SlideLanguages     from "@/components/slides/SlideLanguages";
import SlideTopRepo       from "@/components/slides/SlideTopRepo";
import SlideJourney       from "@/components/slides/SlideJourney";
import SlideAchievements  from "@/components/slides/SlideAchievements";
import SlideArchetype     from "@/components/slides/SlideArchetype";
import SlideShare         from "@/components/slides/SlideShare";
import PlanetProgress     from "@/components/ui/PlanetProgress";
import type { WrappedProfile, SlideId, SlideState } from "@/types/wrapped";

// Each slide's planet colour — the top journey dots mirror the planet shown on
// that slide. The last (share) slide is coloured by the user's top language,
// matching SlideShare's LANG_PALETTES.
const SHARE_LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", Python: "#f1c40f", Rust: "#ff5a1f", Go: "#22d3ee", JavaScript: "#facc15",
};
function planetColors(profile: WrappedProfile): string[] {
  const shareColor = SHARE_LANG_COLORS[profile.raw?.languages?.[0]?.language ?? ""] ?? "#a78bfa";
  return [
    "#cbd5e1", // intro — moon (silver)
    "#ff8c3c", // contributions — orange gas giant
    "#d6552a", // languages — mars red
    "#7cff8a", // top_repo — alien green
    "#ffb627", // journey — amber/gold gas
    "#ec4899", // achievements — yarn pink
    "#a855f7", // archetype — party neon
    shareColor, // share — top language
  ];
}

const SLIDES: SlideId[] = [
  "intro","contributions","languages","top_repo",
  "journey","achievements","archetype","share",
];

const SLIDE_COMPONENTS: Record<SlideId, ComponentType<{ profile: WrappedProfile }>> = {
  intro: SlideIntro, contributions: SlideContributions, languages: SlideLanguages,
  top_repo: SlideTopRepo, journey: SlideJourney, achievements: SlideAchievements,
  archetype: SlideArchetype, share: SlideShare,
};

const EASE = [0.32, 0.72, 0, 1] as const;

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
  exit:   (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.3, ease: EASE } }),
};

// ── loading skeleton ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5"
      style={{ background: "var(--space-deep)" }}>
      {/* pulsing orbit ring */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" style={{ animationDuration: "1.6s" }} />
        <div className="absolute inset-[5px] rounded-full border border-violet-500/30" />
        <div className="absolute inset-[10px] rounded-full bg-violet-500/10 blur-sm" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[13px] font-medium text-white/70">Loading your story</span>
        <span className="text-[11px] text-zinc-600">Fetching from the void…</span>
      </div>
    </div>
  );
}

// ── close/x icon ──────────────────────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

// ── chevron icons ──────────────────────────────────────────────────────────
function ChevronLeft()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ChevronRight() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

// ── main ───────────────────────────────────────────────────────────────────
export default function WrappedPage() {
  const router = useRouter();
  const [profile,          setProfile]          = useState<WrappedProfile | null>(null);
  const [slideState,       setSlideState]       = useState<SlideState>({ current: "intro", index: 0, total: 8, visited: [] });
  const [direction,        setDirection]        = useState<1 | -1>(1);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const touchStartX = useRef(0);

  const fetchNarrative = useCallback(async (p: WrappedProfile) => {
    setNarrativeLoading(true);
    try {
      const res = await fetch("/api/narrative", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) return;
      const data = (await res.json()) as WrappedProfile;
      setProfile(prev => prev ? { ...prev, narrative: data.narrative } : prev);
    } catch { /* narrative is optional */ }
    finally { setNarrativeLoading(false); }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("wrappedProfile");
    if (!stored) { router.push("/"); return; }
    try {
      const parsed = JSON.parse(stored) as WrappedProfile;
      queueMicrotask(() => { setProfile(parsed); setLoading(false); fetchNarrative(parsed); });
    } catch {
      queueMicrotask(() => { setError("Failed to load profile"); setLoading(false); });
    }
  }, [router, fetchNarrative]);

  const goNext = useCallback(() => {
    setSlideState(prev => {
      if (prev.index >= SLIDES.length - 1) return prev;
      setDirection(1);
      return { current: SLIDES[prev.index + 1], index: prev.index + 1, total: 8, visited: [...prev.visited, prev.current] };
    });
  }, []);

  const goPrev = useCallback(() => {
    setSlideState(prev => {
      if (prev.index <= 0) return prev;
      setDirection(-1);
      return { current: SLIDES[prev.index - 1], index: prev.index - 1, total: 8, visited: prev.visited.slice(0, -1) };
    });
  }, []);

  const goTo = useCallback((index: number) => {
    setSlideState(prev => {
      if (index === prev.index || index < 0 || index > SLIDES.length - 1) return prev;
      setDirection(index > prev.index ? 1 : -1);
      return { current: SLIDES[index], index, total: 8, visited: [...prev.visited, prev.current] };
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, router]);

  if (loading) return <LoadingScreen />;

  if (error || !profile) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: "var(--space-deep)" }}>
      <p className="text-[13px] text-white/60">Something went wrong</p>
      <button onClick={() => router.push("/")}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[12px] text-violet-400 transition-colors hover:bg-white/10">
        Try again
      </button>
    </div>
  );

  const CurrentSlide = SLIDE_COMPONENTS[slideState.current];

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden"
      style={{ background: "var(--space-deep)" }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const d = e.changedTouches[0].clientX - touchStartX.current;
        if (d > 50) goNext(); else if (d < -50) goPrev();
      }}
    >
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.12) 0%,transparent 65%)" }} />
      {/* film grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.028]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      {/* ── top bar ── */}
      <div className="fixed inset-x-0 top-0 z-40 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* prev button */}
          <button onClick={goPrev}
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-white/40 transition-all duration-200 hover:border-white/20 hover:text-white/70 ${slideState.index === 0 ? "invisible" : ""}`}>
            <ChevronLeft />
          </button>

          {/* planet journey bar */}
          <div className="flex-1">
            <PlanetProgress total={8} current={slideState.index} colors={planetColors(profile)} onNavigate={goTo} />
          </div>

          {/* close button */}
          <button onClick={() => router.push("/")}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-white/40 transition-all duration-200 hover:border-white/20 hover:text-white/70">
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* ── slide ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={slideState.current} custom={direction}
          variants={slideVariants} initial="enter" animate="center" exit="exit"
          className="absolute inset-0 z-10 overflow-hidden">
          <CurrentSlide profile={profile} />
        </motion.div>
      </AnimatePresence>

      {/* ── tap zones with hover arrows ── */}
      <div className="absolute inset-0 z-30 flex pointer-events-none">
        <div className="w-2/5 h-full pointer-events-auto group flex items-center cursor-pointer" onClick={goPrev}>
          <span className="ml-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/0 bg-white/0 text-white/0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-white/10 group-hover:bg-white/5 group-hover:text-white/50">
            <ChevronLeft />
          </span>
        </div>
        <div className="w-3/5 h-full pointer-events-auto group flex items-center justify-end cursor-pointer" onClick={goNext}>
          <span className="mr-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/0 bg-white/0 text-white/0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-white/10 group-hover:bg-white/5 group-hover:text-white/50">
            <ChevronRight />
          </span>
        </div>
      </div>

      {/* ── narrative loading indicator ── */}
      {narrativeLoading && (slideState.current === "archetype" || slideState.current === "share") && (
        <div className="pointer-events-none fixed bottom-10 right-5 z-30 flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/40 px-3 py-1.5"
          style={{ backdropFilter: "blur(12px)" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--violet-glow)" }} />
          <span className="text-[10px] text-zinc-500">Generating story…</span>
        </div>
      )}
    </div>
  );
}
