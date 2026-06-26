"use client";

import { useState, useEffect, useCallback, useRef, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { WorldCupSlide } from "@/components/pawcup/WorldCupTheme";
import { determineAward } from "@/lib/wc-award";
import SlideIntro         from "@/components/slides/SlideIntro";
import SlideContributions from "@/components/slides/SlideContributions";
import SlideLanguages     from "@/components/slides/SlideLanguages";
import SlideTopRepo       from "@/components/slides/SlideTopRepo";
import SlideJourney       from "@/components/slides/SlideJourney";
import SlideAchievements  from "@/components/slides/SlideAchievements";
import SlideArchetype     from "@/components/slides/SlideArchetype";
import SlideShare         from "@/components/slides/SlideShare";
import PlanetProgress     from "@/components/ui/PlanetProgress";
import ShareModal         from "@/components/ui/ShareModal";
import { SlideWatermark } from "@/components/ui/SlideWatermark";
import { SlideErrorBoundary } from "@/components/ui/SlideErrorBoundary";
import type { WrappedProfile, SlideId, SlideState } from "@/types/wrapped";
import logo from "@/components/pawcup/assets/logo3.asset.json";

// Short chapter title per slide, used in the share caption.
const SLIDE_TITLES: Record<SlideId, string> = {
  intro: "Liftoff",
  contributions: "The Chase",
  languages: "Dodging Bugs",
  top_repo: "Home Base",
  journey: "Refuel Stop",
  achievements: "Trophy Haul",
  archetype: "The Reveal",
  share: "Your Planet",
  bonus: "Bonus Round",
};

const SHARE_LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Python: "#f1c40f",
  Rust: "#ff5a1f",
  Go: "#22d3ee",
  JavaScript: "#facc15",
};

function planetColors(profile: WrappedProfile): string[] {
  const shareColor = SHARE_LANG_COLORS[profile.raw?.languages?.[0]?.language ?? ""] ?? "#a78bfa";
  return [
    "#cbd5e1",
    "#ff8c3c",
    "#d6552a",
    "#7cff8a",
    "#ffb627",
    "#ec4899",
    "#a855f7",
    shareColor,
    "#facc15",
  ];
}

const BASE_SLIDES: SlideId[] = [
  "intro", "contributions", "languages", "top_repo",
  "journey", "achievements", "archetype", "share",
];

const WORLD_CUP_BONUS_SLIDES: SlideId[] = [...BASE_SLIDES, "bonus"];

const SLIDE_COMPONENTS: Record<SlideId, ComponentType<{ profile: WrappedProfile }>> = {
  intro: SlideIntro,
  contributions: SlideContributions,
  languages: SlideLanguages,
  top_repo: SlideTopRepo,
  journey: SlideJourney,
  achievements: SlideAchievements,
  archetype: SlideArchetype,
  share: SlideShare,
  bonus: SlideShare,
};

const EASE = [0.32, 0.72, 0, 1] as const;

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
  exit:   (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.3, ease: EASE } }),
};

function normalizeSlideState(state: SlideState, slides: SlideId[]): SlideState {
  let index = slides.indexOf(state.current);
  let current = state.current;

  if (index === -1) {
    index = slides.length - 1;
    current = slides[index];
  }

  return {
    current,
    index,
    total: slides.length,
    visited: state.visited.filter((id) => slides.includes(id)),
  };
}

// â”€â”€ loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <span className="text-[11px] text-zinc-600">Fetching from the voidâ€¦</span>
      </div>
    </div>
  );
}

// â”€â”€ close/x icon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

// â”€â”€ share icon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

// â”€â”€ chevron icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChevronLeft()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ChevronRight() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

// â”€â”€ main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function WrappedPage() {
  const router = useRouter();
  const { worldCup, ready, animate } = useTheme();
  const activeSlides = worldCup ? WORLD_CUP_BONUS_SLIDES : BASE_SLIDES;
  const activeTotal = activeSlides.length;
  const [profile,          setProfile]          = useState<WrappedProfile | null>(null);
  const [slideState,       setSlideState]       = useState<SlideState>({ current: "intro", index: 0, total: BASE_SLIDES.length, visited: [] });
  const [direction,        setDirection]        = useState<1 | -1>(1);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [shareOpen,        setShareOpen]        = useState(false);
  const [wcSpeech,         setWcSpeech]         = useState<string | null>(null);
  const [wcSpeechLoading,  setWcSpeechLoading]  = useState(false);
  const wcSpeechFetched = useRef(false);
  const touchStartX = useRef(0);
  const slideAreaRef = useRef<HTMLDivElement>(null);
  const normalizedSlideState = normalizeSlideState(slideState, activeSlides);

  const fetchNarrative = useCallback(async (p: WrappedProfile, wc: boolean) => {
    setNarrativeLoading(true);
    try {
      const res = await fetch(`/api/narrative?theme=${wc ? "worldcup" : "space"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) return;
      const data = (await res.json()) as WrappedProfile;
      setProfile(prev => prev ? { ...prev, narrative: data.narrative } : prev);
    } catch { /* narrative is optional */ }
    finally { setNarrativeLoading(false); }
  }, []);

  const fetchWcSpeech = useCallback(async (p: WrappedProfile) => {
    if (wcSpeechFetched.current) return;
    const award = determineAward(p);
    wcSpeechFetched.current = true;
    setWcSpeechLoading(true);
    try {
      const res = await fetch("/api/wc-prize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: p.user.login,
          awardName: award.name,
          awardSubtitle: award.subtitle,
          keyStat: award.keyStat(p),
          speechHint: award.speech_hint,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { speech?: string };
      setWcSpeech(data.speech ?? null);
    } catch { /* optional */ }
    finally { setWcSpeechLoading(false); }
  }, []);

  // Tracks the theme used for the most recent narrative fetch — lets the toggle
  // effect skip a re-fetch when worldCup simply corrects from the SSR-default
  // false to the real sessionStorage value (hydration timing, not a user toggle).
  const lastFetchedTheme = useRef<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("wrappedProfile");
    if (!stored) { router.push("/"); return; }
    try {
      const parsed = JSON.parse(stored) as WrappedProfile;
      // Read theme directly from sessionStorage to avoid React hydration timing:
      // on refresh, useSyncExternalStore fires with false (server snapshot) before
      // correcting to the real value — reading storage directly is always correct.
      const isWC = sessionStorage.getItem("gh-wrapped-theme") === "worldcup";
      lastFetchedTheme.current = isWC;
      queueMicrotask(() => {
        setProfile(parsed);
        setLoading(false);
        fetchNarrative(parsed, isWC);
        if (isWC) fetchWcSpeech(parsed);
      });
    } catch {
      queueMicrotask(() => { setError("Failed to load profile"); setLoading(false); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, fetchNarrative]);

  // Re-generate the narrative when the user actively toggles themes. Skip if the
  // theme matches what was already fetched (guards against the hydration correction
  // false→true firing an unnecessary second request on page refresh).
  const profileRef = useRef<WrappedProfile | null>(null);
  profileRef.current = profile;
  const didInitTheme = useRef(false);
  useEffect(() => {
    if (!didInitTheme.current) { didInitTheme.current = true; return; }
    if (lastFetchedTheme.current === worldCup) return;
    lastFetchedTheme.current = worldCup;
    const p = profileRef.current;
    if (p) {
      fetchNarrative(p, worldCup);
      if (worldCup) fetchWcSpeech(p);
    }
  }, [worldCup, fetchNarrative, fetchWcSpeech]);

  const goNext = useCallback(() => {
    setSlideState(prev => {
      const currentState = normalizeSlideState(prev, activeSlides);
      if (currentState.index >= activeSlides.length - 1) return currentState;
      setDirection(1);
      return {
        current: activeSlides[currentState.index + 1],
        index: currentState.index + 1,
        total: activeTotal,
        visited: [...currentState.visited, currentState.current],
      };
    });
  }, [activeSlides, activeTotal]);

  const goPrev = useCallback(() => {
    setSlideState(prev => {
      const currentState = normalizeSlideState(prev, activeSlides);
      if (currentState.index <= 0) return currentState;
      setDirection(-1);
      return {
        current: activeSlides[currentState.index - 1],
        index: currentState.index - 1,
        total: activeTotal,
        visited: currentState.visited.slice(0, -1),
      };
    });
  }, [activeSlides, activeTotal]);

  const goTo = useCallback((index: number) => {
    setSlideState(prev => {
      const currentState = normalizeSlideState(prev, activeSlides);
      if (index === currentState.index || index < 0 || index > activeSlides.length - 1) return currentState;
      setDirection(index > currentState.index ? 1 : -1);
      return {
        current: activeSlides[index],
        index,
        total: activeTotal,
        visited: [...currentState.visited, currentState.current],
      };
    });
  }, [activeSlides, activeTotal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

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

  const CurrentSlide = SLIDE_COMPONENTS[normalizedSlideState.current];

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden"
      style={{ background: "var(--space-deep)" }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const d = e.changedTouches[0].clientX - touchStartX.current;
        if (d > 50) goPrev(); else if (d < -50) goNext();
      }}
    >
      {/* world cup decorative layer â€” renders behind all content */}
      {/* ambient glow */}
      <div className={`pointer-events-none fixed inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${ready && worldCup ? "opacity-0" : "opacity-100"}`}
        style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.12) 0%,transparent 65%)" }} />
      {/* film grain */}
      <div className={`pointer-events-none fixed inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${ready && worldCup ? "opacity-0" : "opacity-[0.028]"}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      {/* â”€â”€ top bar â”€â”€ */}
      <div className="fixed inset-x-0 top-0 z-40 px-3 pt-3 pb-2 sm:px-5 sm:pt-4 sm:pb-3">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* prev button */}
          <button onClick={goPrev}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-200 hover:border-white/35 hover:bg-black/70 hover:text-white ${normalizedSlideState.index === 0 ? "invisible" : ""}`}>
            <ChevronLeft />
          </button>

          {/* planet journey bar */}
          <div className="flex-1">
            <PlanetProgress total={activeTotal} current={normalizedSlideState.index} colors={planetColors(profile)} onNavigate={goTo} />
          </div>

          {/* share button */}
          <button onClick={() => setShareOpen(true)} aria-label="Share this slide"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-violet-300/55 bg-violet-500/28 text-white shadow-[0_8px_24px_rgba(76,29,149,0.35)] backdrop-blur-md transition-all duration-200 hover:border-violet-200/80 hover:bg-violet-500/40">
            <ShareIcon />
          </button>

          {/* close button */}
          <button onClick={() => router.push("/")}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-200 hover:border-white/35 hover:bg-black/70 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        {/* Logo fixed below back arrow — pt-3(12px)+h-9(36px)+gap(6px)=54px; sm:pt-4(16px)+h-9(36px)+gap(6px)=58px */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url} alt="GrindIT" width={48} height={48}
          className="pointer-events-none absolute left-2 top-[62px] sm:left-4 sm:top-[66px] w-12 h-12 rounded-full"
          style={{ boxShadow: "0 0 0 2px oklch(0.72 0.18 295 / 0.7), 0 0 14px oklch(0.72 0.18 295 / 0.55), 0 0 28px oklch(0.72 0.18 295 / 0.25)" }} />
      </div>

      {/* â”€â”€ slide â”€â”€ */}
      <div ref={slideAreaRef} className="absolute inset-0 z-10">
        {/* capture-only logo — covered on screen by real top bar (z-40), visible in screenshot */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url} alt="GrindIT" width={48} height={48}
          className="pointer-events-none absolute left-2 top-[62px] sm:left-4 sm:top-[66px] z-20 w-12 h-12 rounded-full"
          style={{ boxShadow: "0 0 0 2px oklch(0.72 0.18 295 / 0.7), 0 0 14px oklch(0.72 0.18 295 / 0.55), 0 0 28px oklch(0.72 0.18 295 / 0.25)" }} />
        <SlideWatermark />
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={normalizedSlideState.current} custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain lg:overflow-hidden">
            <SlideErrorBoundary>
            <div className="relative h-full w-full overflow-hidden">
              <div
                className={`absolute inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
                  ready && worldCup ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
              >
                {normalizedSlideState.current === "share"
                  ? <SlideShare profile={profile} showStartOver={!(ready && worldCup)} />
                  : <CurrentSlide profile={profile} />}
              </div>
              <div
                className={`absolute inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
                  ready && worldCup ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="wc-pawcup-scene absolute inset-0">
                  <WorldCupSlide index={normalizedSlideState.index} profile={profile} wcSpeech={wcSpeech} wcSpeechLoading={wcSpeechLoading} />
                </div>
                <div className="wc-original-card-layer absolute inset-0 z-30" data-wc-slide={normalizedSlideState.current}>
                  {normalizedSlideState.current === "archetype"
                    ? <SlideArchetype profile={profile} sparse />
                    : normalizedSlideState.current === "share"
                      ? <SlideShare profile={profile} showStartOver={false} />
                      : <CurrentSlide profile={profile} />}
                </div>
              </div>
            </div>
            </SlideErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── nav arrows (arrow buttons + swipe on mobile) ─── */}
      <div className="pointer-events-none fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-between px-2">
        <button onClick={goPrev} aria-label="Previous slide"
          className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/70 backdrop-blur-sm transition active:scale-90 ${normalizedSlideState.index === 0 ? "invisible" : ""}`}
          style={{ backdropFilter: "blur(8px)" }}>
          <ChevronLeft />
        </button>
        <button onClick={goNext} aria-label="Next slide"
          className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/70 backdrop-blur-sm transition active:scale-90 ${normalizedSlideState.index >= normalizedSlideState.total - 1 ? "invisible" : ""}`}
          style={{ backdropFilter: "blur(8px)" }}>
          <ChevronRight />
        </button>
      </div>

      {/* â”€â”€ narrative loading indicator â”€â”€ */}
      {narrativeLoading && (normalizedSlideState.current === "archetype" || normalizedSlideState.current === "share") && (
        <div className="pointer-events-none fixed bottom-10 right-5 z-30 flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/40 px-3 py-1.5"
          style={{ backdropFilter: "blur(12px)" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--violet-glow)" }} />
          <span className="text-[10px] text-zinc-500">Generating storyâ€¦</span>
        </div>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        slideRef={slideAreaRef}
        username={profile.user.login}
        slideTitle={SLIDE_TITLES[normalizedSlideState.current]}
        worldCup={worldCup}
      />
    </div>
  );
}
