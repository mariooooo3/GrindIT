"use client";

import { useState, useEffect, useCallback, useRef, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { WorldCupSlide } from "@/components/pawcup/WorldCupTheme";
import WorldCupSlideBackground from "@/components/WorldCupSlideBackground";
import WorldCupChapterHeading from "@/components/pawcup/WorldCupChapterHeading";
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
import { LOADING_MESSAGES, NARRATIVE_MESSAGES, pickRandom } from "@/lib/loadingMessages";
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
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.96,
    filter: "blur(6px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      x:      { type: "spring" as const, stiffness: 280, damping: 36, mass: 0.9 },
      opacity: { duration: 0.28, ease: "easeOut" as const },
      scale:   { type: "spring" as const, stiffness: 340, damping: 38 },
      filter:  { duration: 0.22, ease: "easeOut" as const },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
    transition: {
      x:      { type: "spring" as const, stiffness: 320, damping: 38, mass: 0.85 },
      opacity: { duration: 0.18, ease: "easeIn" as const },
      scale:   { duration: 0.2, ease: "easeIn" as const },
      filter:  { duration: 0.15, ease: "easeIn" as const },
    },
  }),
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

// â"€â"€ loading skeleton â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function LoadingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(Math.floor(Math.random() * LOADING_MESSAGES.length));
    const id = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--space-deep)" }}>
      {/* pulsing orbit ring */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border border-violet-400/20 animate-ping" style={{ animationDuration: "1.6s", willChange: "opacity, transform" }} />
        <div className="absolute inset-0 rounded-full border border-violet-400/10 animate-ping" style={{ animationDuration: "2.6s", animationDelay: "0.8s", willChange: "opacity, transform" }} />
        <div className="absolute inset-[5px] rounded-full border border-violet-500/40" />
        <div className="absolute inset-[10px] rounded-full bg-violet-500/20 blur-md" />
        <div className="absolute inset-[14px] rounded-full bg-violet-400/30" style={{ boxShadow: "0 0 16px 4px rgba(139,92,246,0.35)" }} />
      </div>
      <div className="flex flex-col items-center gap-2 text-center px-6">
        <span className="text-[15px] font-semibold text-white/85 tracking-[-0.01em]">Loading your story</span>
        <div className="h-5 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={idx}
              className="block text-[12px] font-medium text-violet-300/70"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {LOADING_MESSAGES[idx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// â"€â"€ narrative loading indicator â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Mounts only while the optional Groq narrative is generating, so the random
// start + rotation reset each session and the interval is cleaned up on unmount.
function NarrativeLoadingIndicator() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NARRATIVE_MESSAGES.length));
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % NARRATIVE_MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      className="pointer-events-none fixed bottom-10 right-5 z-30 flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/40 px-3 py-1.5"
      style={{ backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}>
      <motion.span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--violet-glow)" }}
        animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
      <span className="text-[10px] text-zinc-500">{NARRATIVE_MESSAGES[idx]}</span>
    </motion.div>
  );
}

// â"€â"€ close/x icon â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

// â"€â"€ share icon â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

// â"€â"€ chevron icons â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function ChevronLeft()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ChevronRight() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

// â"€â"€ main â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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
  const [shareDirectMode,  setShareDirectMode]  = useState(false);
  const [mobileScreenshotMode, setMobileScreenshotMode] = useState(false);
  const [screenshotControlsVisible, setScreenshotControlsVisible] = useState(false);
  const [wcSpeech,         setWcSpeech]         = useState<string | null>(null);
  const [wcSpeechLoading,  setWcSpeechLoading]  = useState(false);
  const wcSpeechFetched = useRef(false);
  const touchStartX = useRef(0);
  const slideAreaRef = useRef<HTMLDivElement>(null);
  const screenshotControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedSlideState = normalizeSlideState(slideState, activeSlides);


  const fetchNarrative = useCallback(async (p: WrappedProfile, wc: boolean) => {
    const cacheKey = wc ? "narrative:worldcup" : "narrative:space";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const narrative = JSON.parse(cached) as WrappedProfile["narrative"];
        setProfile(prev => prev ? { ...prev, narrative } : prev);
        return; // only skip fetch if parse succeeded
      } catch { /* corrupt cache — fall through to fetch */ }
    }
    setNarrativeLoading(true);
    try {
      const res = await fetch(`/api/narrative?theme=${wc ? "worldcup" : "space"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) return;
      const data = (await res.json()) as WrappedProfile;
      if (data.narrative) {
        // Don't cache fallbacks — next refresh should retry the real LLM call.
        if (!data.narrative.isFallback) {
          sessionStorage.setItem(cacheKey, JSON.stringify(data.narrative));
        }
        setProfile(prev => prev ? { ...prev, narrative: data.narrative } : prev);
      }
    } catch { /* narrative is optional */ }
    finally { setNarrativeLoading(false); }
  }, []);

  const fetchWcSpeech = useCallback(async (p: WrappedProfile) => {
    if (wcSpeechFetched.current) return;
    wcSpeechFetched.current = true;
    const cached = sessionStorage.getItem("wcSpeech");
    if (cached) { setWcSpeech(cached); return; }
    const award = determineAward(p);
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
      const data = (await res.json()) as { speech?: string; isFallback?: boolean };
      if (data.speech) {
        if (!data.isFallback) sessionStorage.setItem("wcSpeech", data.speech);
        setWcSpeech(data.speech);
      }
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
  useEffect(() => { profileRef.current = profile; }, [profile]);

  useEffect(() => {
    const update = () => {
      const h = window.innerHeight;
      document.documentElement.style.setProperty("--app-h", `${h}px`);
      // percentage-based card heights so the card proportion is consistent on any phone
      document.documentElement.style.setProperty("--card-max-h", `${Math.floor(h * 0.62)}px`);
      document.documentElement.style.setProperty("--card-max-h-compact", `${Math.floor(h * 0.56)}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
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

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#080612";
    return () => { document.body.style.background = prev; };
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotControlsTimer.current) clearTimeout(screenshotControlsTimer.current);
    };
  }, []);

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
  const showScreenshotControls = () => {
    if (!mobileScreenshotMode) return;
    setScreenshotControlsVisible(true);
    if (screenshotControlsTimer.current) clearTimeout(screenshotControlsTimer.current);
    screenshotControlsTimer.current = setTimeout(() => {
      setScreenshotControlsVisible(false);
      screenshotControlsTimer.current = null;
    }, 2400);
  };

  const enterMobileScreenshotMode = () => {
    setMobileScreenshotMode(true);
    setScreenshotControlsVisible(false);
  };

  const exitMobileScreenshotMode = () => {
    setMobileScreenshotMode(false);
    setScreenshotControlsVisible(false);
    if (screenshotControlsTimer.current) {
      clearTimeout(screenshotControlsTimer.current);
      screenshotControlsTimer.current = null;
    }
  };

  return (
    <div className="relative h-[var(--app-h)] w-screen overflow-hidden"
      style={{ background: "#080612" }}
    >
      {/* world cup decorative layer â€" renders behind all content */}
      {/* ambient glow */}
      <div className={`pointer-events-none fixed inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${ready && worldCup ? "opacity-0" : "opacity-100"}`}
        style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.12) 0%,transparent 65%)" }} />
      {/* film grain */}
      <div className={`pointer-events-none fixed inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${ready && worldCup ? "opacity-0" : "opacity-[0.028]"}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      {/* â"€â"€ top bar â"€â"€ */}
      <div className={`fixed inset-x-0 top-0 z-40 px-3 pt-3 pb-2 transition-opacity duration-200 sm:px-5 sm:pt-4 sm:pb-3 ${mobileScreenshotMode ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* prev button — desktop only */}
          <button onClick={goPrev}
            className={`hidden lg:flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-200 hover:border-white/35 hover:bg-black/70 hover:text-white ${normalizedSlideState.index === 0 ? "invisible" : ""}`}>
            <ChevronLeft />
          </button>

          {/* planet journey bar — desktop only */}
          <div className="hidden lg:block flex-1">
            <PlanetProgress total={activeTotal} current={normalizedSlideState.index} colors={planetColors(profile)} onNavigate={goTo} />
          </div>

          {/* mobile spacer */}
          <div className="flex-1 lg:hidden" />

          {/* share button */}
          <div className="group relative flex-shrink-0">
            <motion.button onClick={() => setShareOpen(true)} aria-label="Share this slide"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-violet-300/55 bg-violet-500/28 text-white shadow-[0_8px_24px_rgba(76,29,149,0.35)] backdrop-blur-md"
              whileHover={{ scale: 1.12, backgroundColor: "rgba(109,40,217,0.48)", borderColor: "rgba(196,181,253,0.85)" }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}>
              <ShareIcon />
            </motion.button>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[10px] font-medium text-white/55 opacity-0 whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100" style={{ backdropFilter: "blur(8px)" }}>
              Share
            </span>
          </div>

          {/* close button */}
          <div className="group relative flex-shrink-0">
            <motion.button onClick={() => router.push("/")} aria-label="Back to home"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md"
              whileHover={{ scale: 1.12, backgroundColor: "rgba(0,0,0,0.72)", borderColor: "rgba(255,255,255,0.38)" }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}>
              <CloseIcon />
            </motion.button>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[10px] font-medium text-white/55 opacity-0 whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100" style={{ backdropFilter: "blur(8px)" }}>
              Close
            </span>
          </div>
        </div>
      </div>

      {/* Logo — fixed independently so it stays visible in screenshot mode (top-bar above goes opacity-0) */}
      <div className={`group fixed left-2 top-3 sm:left-4 sm:top-4 z-[41] transition-opacity duration-200 ${mobileScreenshotMode ? "pointer-events-none" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url} alt="GrindIT"
          role="button" aria-label="Back to home" tabIndex={0}
          onClick={() => router.push("/")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/"); } }}
          width={48} height={48}
          className="block w-12 h-12 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 bg-[#080612]"
          style={{ boxShadow: "0 0 0 2px oklch(0.72 0.18 295 / 0.7), 0 0 14px oklch(0.72 0.18 295 / 0.55), 0 0 28px oklch(0.72 0.18 295 / 0.25)" }} />
        <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[10px] font-medium text-white/55 opacity-0 whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100" style={{ backdropFilter: "blur(8px)" }}>
          GrindIT
        </span>
      </div>

      {/* slide */}
      {/* mobile: h-[var(--app-h)] pins the area to exactly the viewport so bg fills edge-to-edge and the progress bar stays anchored at the bottom; desktop: lg:inset-0 lg:block restores full-screen absolute stacking */}
      <div ref={slideAreaRef} className="absolute inset-x-0 top-0 h-[var(--app-h)] z-10 bg-[#080612] lg:bg-transparent lg:h-auto lg:inset-0 lg:block"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const d = e.changedTouches[0].clientX - touchStartX.current;
          if (d > 50) goPrev(); else if (d < -50) goNext();
        }}
        onClick={() => showScreenshotControls()}
      >
        {/* capture-only logo — desktop only; on mobile the real top-bar logo is used */}
        {/* No boxShadow here — the interactive logo (z-40 top bar) already provides the ring glow on screen. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url} alt="GrindIT" width={48} height={48}
          className="pointer-events-none absolute left-2 top-3 sm:left-4 sm:top-4 z-20 w-12 h-12 rounded-full hidden lg:block bg-[#080612]" />
        <SlideWatermark />
        {/* slide content — absolute inset-0 so slide bg fills the full 100dvh including the progress bar zone */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={normalizedSlideState.current} custom={direction}
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              style={{ willChange: "transform, opacity, filter" }}
              className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain lg:absolute lg:inset-0 lg:h-auto lg:overflow-hidden">
              <SlideErrorBoundary>
              {/* h-full propagates the constrained height through to slide <main>/SlideShell so they fill the screen */}
              <div className="relative h-full w-full overflow-hidden">
                {/* space theme — h-full on mobile fills the container; absolute inset-0 on desktop */}
                <div
                  data-share-layer="space"
                  className={`relative h-full w-full lg:absolute lg:inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
                    ready && worldCup ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                >
                  {normalizedSlideState.current === "share"
                    ? <SlideShare profile={profile} showStartOver={!(ready && worldCup)} />
                    : <CurrentSlide profile={profile} />}
                </div>
                {/* WC theme — absolute overlay over space theme (works on both mobile and desktop) */}
                <div
                  data-share-layer="worldcup"
                  className={`absolute inset-0 will-change-[opacity] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
                    ready && worldCup ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {/* Mobile-only: stadium background (no cats/decorations) — wc-pawcup-scene is hidden on mobile via CSS */}
                  <div data-wc-bg className="lg:hidden absolute inset-0 z-[5]">
                    <WorldCupSlideBackground />
                  </div>
                  {/* Mobile-only: WC chapter heading centered above card (wc-pawcup-scene is hidden on mobile) */}
                  <div className="wc-chapter-heading-mobile-wrap lg:hidden absolute inset-x-0 z-40 flex justify-center" style={{ top: "18px" }}>
                    <WorldCupChapterHeading index={normalizedSlideState.index} />
                  </div>
                  <div className="wc-pawcup-scene absolute inset-0">
                    <WorldCupSlide index={normalizedSlideState.index} profile={profile} wcSpeech={wcSpeech} wcSpeechLoading={wcSpeechLoading} />
                  </div>
                  <div
                    className="wc-original-card-layer absolute inset-x-0 bottom-0 top-[76px] z-30 sm:top-[88px] lg:inset-0"
                    data-wc-slide={normalizedSlideState.current}
                  >
                    {normalizedSlideState.current === "archetype"
                      ? <SlideArchetype profile={profile} sparse />
                      : normalizedSlideState.current === "intro"
                        ? <SlideIntro profile={profile} mobileFooterVariant="worldcup-inscription" />
                      : normalizedSlideState.current === "share"
                        ? <SlideShare profile={profile} showStartOver={false} mobileCaptionVariant="worldcup-newspaper" />
                        : <CurrentSlide profile={profile} />}
                  </div>
                </div>
              </div>
              </SlideErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* mobile progress bar — absolute at bottom, gradient bg blends seamlessly into slide.
            data-share-ignore: excluded from the full-slide share capture (the live
            slide root is captured directly on mobile now) so the shared image stays
            clean — matching desktop, where the progress bar lives in the fixed top bar. */}
        <div data-share-ignore className={`absolute bottom-0 left-0 right-0 z-20 px-4 pt-2.5 transition-opacity duration-200 lg:hidden ${mobileScreenshotMode ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}
          style={{
            paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))",
            background: "linear-gradient(to bottom, transparent, #080612 38%)",
          }}>
          <PlanetProgress total={activeTotal} current={normalizedSlideState.index} colors={planetColors(profile)} onNavigate={goTo} />
        </div>
      </div>

      {/* ─── nav arrows (arrow buttons + swipe on mobile) ─── */}
      <div className={`pointer-events-none fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-between px-2 transition-opacity duration-200 ${mobileScreenshotMode ? "opacity-0 lg:opacity-100" : "opacity-100"}`}>
        <div className={`group relative pointer-events-auto ${normalizedSlideState.index === 0 ? "invisible" : ""}`}>
          <motion.button onClick={goPrev} aria-label="Previous slide"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/70 backdrop-blur-sm"
            style={{ backdropFilter: "blur(8px)" }}
            whileHover={{ scale: 1.12, borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.95)" }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}>
            <ChevronLeft />
          </motion.button>
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[10px] font-medium text-white/55 opacity-0 whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100" style={{ backdropFilter: "blur(8px)" }}>
            Previous
          </span>
        </div>
        <div className={`group relative pointer-events-auto ${normalizedSlideState.index >= normalizedSlideState.total - 1 ? "invisible" : ""}`}>
          <motion.button onClick={goNext} aria-label="Next slide"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/70 backdrop-blur-sm"
            style={{ backdropFilter: "blur(8px)" }}
            whileHover={{ scale: 1.12, borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.95)" }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}>
            <ChevronRight />
          </motion.button>
          <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[10px] font-medium text-white/55 opacity-0 whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100" style={{ backdropFilter: "blur(8px)" }}>
            Next
          </span>
        </div>
      </div>

      {/* â"€â"€ narrative loading indicator â"€â"€ */}
      <AnimatePresence>
        {narrativeLoading && (normalizedSlideState.current === "archetype" || normalizedSlideState.current === "share") && (
          <NarrativeLoadingIndicator key="narrative-loader" />
        )}
      </AnimatePresence>

      <ShareModal
        open={shareOpen}
        onClose={() => { setShareOpen(false); setShareDirectMode(false); }}
        slideRef={slideAreaRef}
        username={profile.user.login}
        slideTitle={SLIDE_TITLES[normalizedSlideState.current]}
        worldCup={worldCup}
        onEnterScreenshotMode={enterMobileScreenshotMode}
        directShare={shareDirectMode}
      />
      <AnimatePresence>
        {mobileScreenshotMode && screenshotControlsVisible && (
          <motion.div
            className="fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4 lg:hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/72 px-2 py-2 shadow-[0_10px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <button
                type="button"
                onClick={exitMobileScreenshotMode}
                className="cursor-pointer rounded-full px-3 py-2 text-[12px] font-semibold text-white/82 transition-colors duration-150 hover:bg-white/[0.08]"
              >
                Done
              </button>
              {/* Share button — hidden until fully implemented */}
              {false && (
              <button
                type="button"
                onClick={() => {
                  exitMobileScreenshotMode();
                  setShareDirectMode(true);
                  setShareOpen(true);
                }}
                className="cursor-pointer rounded-full bg-violet-500 px-3 py-2 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(109,40,217,0.35)] transition-transform duration-150 active:scale-[0.98]"
              >
                Share
              </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
