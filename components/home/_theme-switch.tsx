"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

function TrophyMark({ className = "h-7 w-7 sm:h-8 sm:w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <linearGradient id="wcGold" x1="18" y1="6" x2="46" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff4ad" />
          <stop offset="0.32" stopColor="#f3c64a" />
          <stop offset="0.66" stopColor="#cf9a1e" />
          <stop offset="1" stopColor="#946312" />
        </linearGradient>
        <radialGradient id="wcGlobe" cx="42%" cy="35%" r="68%">
          <stop offset="0" stopColor="#3fae5a" />
          <stop offset="100%" stopColor="#0f5e2a" />
        </radialGradient>
        <linearGradient id="wcBase" x1="0" y1="52" x2="0" y2="61" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f9b52" />
          <stop offset="1" stopColor="#176233" />
        </linearGradient>
        <linearGradient id="wcSheen" x1="22" y1="16" x2="30" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fffbe6" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
        </linearGradient>
        <clipPath id="wcGlobeClip"><circle cx="32" cy="13" r="7.2" /></clipPath>
      </defs>

      <path d="M21 52 H43 L45 58 Q45 60.5 42.5 60.5 H21.5 Q19 60.5 19 58 Z" fill="url(#wcBase)" />
      <rect x="20" y="52" width="24" height="1.5" rx="0.7" fill="url(#wcGold)" />
      <rect x="20.5" y="58.6" width="23" height="1.1" rx="0.55" fill="#0e4f25" opacity="0.7" />

      <path d="M32 20 C 27 20 23 22 24 26 C 25 30 27 32 27 35 C 27 40 23 46 22 52 L 42 52 C 41 46 37 40 37 35 C 37 32 39 30 40 26 C 41 22 37 20 32 20 Z"
            fill="url(#wcGold)" />
      <path d="M32 20 C 27 20 23 22 24 26 C 25 30 27 32 27 35 C 27 40 23 46 22 52 L 27 52 C 26.5 46 27 40 29 35 C 27 31 27 26 29 22 C 29.8 21 30.8 20.3 32 20 Z"
            fill="url(#wcSheen)" />
      <g fill="none" stroke="#946312" strokeWidth="0.9" strokeLinecap="round" opacity="0.5">
        <path d="M31 22 C 27 27 28 33 31 36 C 28 40 26 45 27 50" />
        <path d="M34 22 C 38 27 37 33 33.5 36 C 37 40 39 45 38 50" />
      </g>

      <circle cx="32" cy="13" r="7.2" fill="url(#wcGlobe)" />
      <g clipPath="url(#wcGlobeClip)" fill="url(#wcGold)">
        <path d="M26.5 7.5 C 30 6.5 33 8 34 11 C 31.5 12 29.5 11 27.5 12 C 25.5 11 25.5 8.5 26.5 7.5 Z" />
        <path d="M33 12.5 C 36.5 12.5 38.5 15 37 18.5 C 35 18.5 33 17 32.5 14.5 C 32.3 13.3 32.3 12.5 33 12.5 Z" />
        <path d="M25 15 C 27.5 15 28.5 17 27.5 18.5 C 25.5 18.5 24.5 17 24.5 16 Z" />
      </g>
      <circle cx="32" cy="13" r="7.2" fill="none" stroke="#946312" strokeWidth="0.7" opacity="0.4" />
      <ellipse cx="29.5" cy="10.3" rx="1.6" ry="1" fill="#eafff0" opacity="0.5" transform="rotate(-25 29.5 10.3)" />
    </svg>
  );
}

function SoccerBallMark({ className = "h-7 w-7 sm:h-8 sm:w-8" }: { className?: string }) {
  const wave = "M31 33 C 35 25 24 21 25 13 C 25.5 8.5 21 6.5 15 8";
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <radialGradient id="ballSphere" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#eef1f5" />
          <stop offset="100%" stopColor="#bcc2cc" />
        </radialGradient>
        <radialGradient id="ballGloss" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="ballClip"><circle cx="32" cy="32" r="28" /></clipPath>
      </defs>

      <circle cx="32" cy="32" r="28" fill="url(#ballSphere)" />

      <g clipPath="url(#ballClip)" fill="none" strokeLinecap="round">
        <path d={wave} stroke="#c8163d" strokeWidth="9" />
        <path d={wave} stroke="#1f9d4d" strokeWidth="9" transform="rotate(120 32 32)" />
        <path d={wave} stroke="#1d7fe0" strokeWidth="9" transform="rotate(240 32 32)" />
      </g>

      <g clipPath="url(#ballClip)" fill="none" stroke="#2a2e38" strokeLinecap="round" opacity="0.7">
        <path d="M5 25 Q 32 15 59 25" strokeWidth="1.8" />
        <path d="M5 39 Q 32 49 59 39" strokeWidth="1.8" />
        <path d="M23 4 Q 13 32 23 60" strokeWidth="1.6" />
        <path d="M41 4 Q 51 32 41 60" strokeWidth="1.6" />
      </g>

      <g clipPath="url(#ballClip)">
        <circle cx="32" cy="32" r="6.8" fill="#1d7fe0" />
        <circle cx="32" cy="32" r="6.8" fill="none" stroke="#ffffff" strokeWidth="1.6" />
        <circle cx="32" cy="32" r="2.7" fill="#ffffff" opacity="0.9" />
      </g>

      <ellipse cx="23" cy="20" rx="12" ry="8" fill="url(#ballGloss)" transform="rotate(-28 23 20)" clipPath="url(#ballClip)" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#000000" strokeOpacity="0.16" strokeWidth="1.2" />
    </svg>
  );
}

export function ThemeSwitch() {
  const { worldCup, toggleWorldCup } = useTheme();
  const [boosted, setBoosted] = useState(false);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
    };
  }, []);

  const handleToggle = () => {
    setBoosted(true);
    if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
    boostTimerRef.current = setTimeout(() => setBoosted(false), 950);
    toggleWorldCup();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={worldCup ? "Switch to normal theme" : "Switch to World Cup theme"}
      title={worldCup ? "World Cup theme active — click to switch back" : "Monthly theme · World Cup — click to activate"}
      className={`group relative flex items-center gap-1 rounded-full border py-0.5 pl-1.5 pr-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.97] sm:gap-1.5 sm:py-1 sm:pl-2 sm:pr-3 ${
        worldCup
          ? "border-amber-400/50 bg-amber-950/50 hover:border-amber-300/70 hover:bg-amber-950/70"
          : "border-white/[0.12] bg-black/40 hover:border-emerald-300/40 hover:bg-zinc-900/70"
      }`}
      style={{ backdropFilter: "blur(12px)" }}
    >
      <span className="grid place-items-center">
        <TrophyMark />
      </span>
      <motion.span
        className="grid place-items-center"
        animate={{ rotate: 360, scale: boosted ? [1, 1.12, 1] : 1 }}
        transition={{
          rotate: { duration: boosted ? 1.7 : 7, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <SoccerBallMark />
      </motion.span>
      <span className="flex flex-col items-start leading-none">
        <span className={`text-[7px] font-bold uppercase tracking-[0.14em] transition-colors sm:text-[8px] sm:tracking-[0.16em] ${worldCup ? "text-amber-400/80 group-hover:text-amber-300" : "text-zinc-500 group-hover:text-emerald-300/70"}`}>Theme</span>
        <span className={`text-[9px] font-semibold tracking-[-0.01em] transition-colors sm:text-[11px] ${worldCup ? "text-amber-200" : "text-white/90"}`}>
          World Cup
        </span>
      </span>
      <span className={`pointer-events-none absolute inset-0 rounded-full transition-colors duration-500 ${worldCup ? "bg-amber-300/[0.08]" : "bg-emerald-300/0 group-hover:bg-emerald-300/[0.06]"}`} />
    </button>
  );
}
