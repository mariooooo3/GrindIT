"use client";

import { motion } from "framer-motion";
import { useRef, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { mapToFlat, formatGitHubAge, formatWrappedLabel } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, RocketTailNodes } from "@/components/wrapped/shared";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { Glyph, type GlyphName } from "@/components/wrapped/TrophyIcons";
import { SlideCard } from "@/components/wrapped/SlideCard";
import SpaceBackground from "@/components/SpaceBackground";
import { BadgePopover, type PopoverBadge } from "@/components/wrapped/BadgePopover";
import type { ArchetypeId, WrappedProfile } from "@/types/wrapped";


const LANG_PALETTES: Record<string, { a: string; b: string; glow: string }> = {
  TypeScript:  { a: "#3b82f6", b: "#818cf8", glow: "rgba(59,130,246,0.62)" },
  Python:      { a: "#eab308", b: "#4ade80", glow: "rgba(234,179,8,0.58)" },
  Rust:        { a: "#f97316", b: "#ef4444", glow: "rgba(249,115,22,0.62)" },
  Go:          { a: "#06b6d4", b: "#2dd4bf", glow: "rgba(6,182,212,0.58)" },
  JavaScript:  { a: "#f59e0b", b: "#a855f7", glow: "rgba(245,158,11,0.55)" },
  Ruby:        { a: "#e11d48", b: "#fb7185", glow: "rgba(225,29,72,0.6)" },
  Java:        { a: "#f97316", b: "#fbbf24", glow: "rgba(249,115,22,0.58)" },
  "C++":       { a: "#8b5cf6", b: "#06b6d4", glow: "rgba(139,92,246,0.6)" },
  C:           { a: "#64748b", b: "#94a3b8", glow: "rgba(100,116,139,0.55)" },
  Swift:       { a: "#ff6b35", b: "#ff9f43", glow: "rgba(255,107,53,0.6)" },
  Kotlin:      { a: "#a855f7", b: "#f472b6", glow: "rgba(168,85,247,0.6)" },
  PHP:         { a: "#6366f1", b: "#a5b4fc", glow: "rgba(99,102,241,0.58)" },
  default:     { a: "#8b5cf6", b: "#c084fc", glow: "rgba(139,92,246,0.62)" },
};

// Per-archetype accent colors — blended with language palette based on primaryWeight
const ARCHETYPE_COLORS: Record<ArchetypeId, { a: string; b: string }> = {
  foundry:              { a: "#991b1b", b: "#fbbf24" },  // dark crimson + gold
  afterglow:            { a: "#6d28d9", b: "#f0abfc" },  // deep violet + lilac pink
  trail_mapper:         { a: "#14b8a6", b: "#bef264" },  // vivid teal + lime (unique combo)
  cartographer:         { a: "#1e40af", b: "#22d3ee" },  // navy blue + bright cyan
  silent_current:       { a: "#0284c7", b: "#7dd3fc" },  // sky blue + light blue
  signal_booster:       { a: "#b45309", b: "#fef9c3" },  // dark amber + cream yellow
  anvil:                { a: "#1e293b", b: "#94a3b8" },  // charcoal steel + silver (only gray)
  chaos_pilot:          { a: "#9333ea", b: "#f472b6" },  // electric purple + hot pink
  flashpoint:           { a: "#ea580c", b: "#fde047" },  // vivid orange + bright yellow
  constellation_weaver: { a: "#0f766e", b: "#fbbf24" },  // dark teal + warm gold
  caretaker:            { a: "#15803d", b: "#86efac" },  // forest green + mint
  deep_diver:           { a: "#3730a3", b: "#a5b4fc" },  // deep indigo + lavender
  archive_keeper:       { a: "#78350f", b: "#fcd34d" },  // deep warm brown + amber gold
  lone_orbit:           { a: "#0c4a6e", b: "#bae6fd" },  // deep ocean navy + pale sky
};

const ARCHETYPE_PLANET_TYPES: Record<ArchetypeId, string> = {
  foundry:              "Forge World",
  afterglow:            "Nebula Core",
  trail_mapper:         "Rogue Planet",
  cartographer:         "Ocean World",
  silent_current:       "Ice Giant",
  signal_booster:       "Relay Hub",
  anvil:                "Iron World",
  chaos_pilot:          "Storm World",
  flashpoint:           "Protostar",
  constellation_weaver: "Binary System",
  caretaker:            "Garden World",
  deep_diver:           "Void Sphere",
  archive_keeper:       "Ancient World",
  lone_orbit:           "Wanderer",
};

function blendHex(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function blendPalette(lang: PlanetPalette, archetypeId: ArchetypeId, weight: number): PlanetPalette {
  const arch = ARCHETYPE_COLORS[archetypeId];
  if (!arch) return lang;
  // Higher weights = archetype color dominates strongly
  const t = weight >= 55 ? 0.90 : weight >= 38 ? 0.74 : 0.52;
  const a = blendHex(lang.a, arch.a, t);
  const b = blendHex(lang.b, arch.b, t);
  return { a, b, glow: hexToRgba(a, 0.62) };
}

function deriveArchetype(nightRatio: number, longestStreak: number, prsMerged: number, totalCommits: number, archetype: string): string {
  if (archetype) return archetype.toUpperCase().startsWith("THE ") ? archetype.toUpperCase() : `THE ${archetype.toUpperCase()}`;
  if (nightRatio >= 0.5) return "THE NIGHT OWL";
  if (longestStreak > 14) return "THE SPRINTER";
  if (prsMerged > 30) return "THE COLLABORATOR";
  if (totalCommits > 300) return "THE BUILDER";
  return "THE EXPLORER";
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toString();
}

type PlanetPalette = { a: string; b: string; glow: string };

type PlanetSpec = {
  palette: PlanetPalette;
  username: string;
  primary: ArchetypeId;
  secondary: ArchetypeId | null;
  primaryWeight: number;
  planetType: string;
  topLanguage: string;
  topLanguageShare: number;
  languageCount: number;
  totalRepos: number;
  totalStars: number;
  followers: number;
  mergedPrs: number;
  totalCommits: number;
  nightRatio: number;
  focusScore: number;
  explorerScore: number;
  consistencyScore: number;
  growthTrend: "up" | "down" | "flat";
  weekendWarrior: boolean;
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}

function buildPlanetSpec(profile: WrappedProfile, flat: ReturnType<typeof mapToFlat>, palette: PlanetPalette, nightRatio: number): PlanetSpec {
  const primary = profile.archetypeBlend.primary.id;
  const primaryWeight = profile.archetypeBlend.primary.weight;
  return {
    palette,
    username: flat.username,
    primary,
    secondary: profile.archetypeBlend.secondary?.id ?? null,
    primaryWeight,
    planetType: ARCHETYPE_PLANET_TYPES[primary] ?? "Planet",
    topLanguage: flat.topLanguages[0]?.name ?? "default",
    topLanguageShare: flat.topLanguages[0]?.percentage ?? 0,
    languageCount: flat.languageCount,
    totalRepos: flat.totalRepos,
    totalStars: flat.totalStars,
    followers: flat.followers,
    mergedPrs: flat.pullRequests.merged,
    totalCommits: flat.totalCommits,
    nightRatio,
    focusScore: flat.scores.focus,
    explorerScore: flat.scores.explorer,
    consistencyScore: flat.scores.consistency,
    growthTrend: flat.growth.trend,
    weekendWarrior: flat.weekendWarrior,
  };
}

function renderCompanion(primary: ArchetypeId, a: string, b: string): React.ReactNode {
  switch (primary) {
    case "foundry":
      return (
        <motion.svg width="40" height="40" viewBox="0 0 40 40" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.2, repeat: Infinity }}>
          {[0,1,2,3,4,5].map(i => { const ang = (i/6)*Math.PI*2; return <line key={i} x1="20" y1="20" x2={20+Math.cos(ang)*14} y2={20+Math.sin(ang)*14} stroke={a} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />; })}
          <circle cx="20" cy="20" r="2.5" fill={b} />
        </motion.svg>
      );
    case "afterglow":
      return (
        <motion.svg width="48" height="36" viewBox="0 0 48 36" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 4, repeat: Infinity }}>
          <path d="M4 18 Q12 6 24 12 Q36 18 44 8" stroke={b} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
          <path d="M2 24 Q14 16 24 22 Q34 28 46 20" stroke={a} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M6 30 Q16 24 24 28 Q32 32 44 26" stroke={b} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.38" />
        </motion.svg>
      );
    case "trail_mapper":
      return (
        <motion.svg width="42" height="42" viewBox="0 0 42 42" animate={{ x: [0, 5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
          <line x1="8" y1="34" x2="36" y2="8" stroke={a} strokeWidth="0.9" strokeDasharray="3,3" opacity="0.45" />
          {([{cx:8,cy:34,r:4},{cx:20,cy:21,r:3},{cx:34,cy:9,r:2}] as {cx:number;cy:number;r:number}[]).map((d,i) =>
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={i===0?b:a} opacity={1-i*0.22} />)}
        </motion.svg>
      );
    case "cartographer":
      return (
        <motion.svg width="40" height="40" viewBox="0 0 40 40" animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
          <line x1="20" y1="5" x2="20" y2="35" stroke={b} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="5" y1="20" x2="35" y2="20" stroke={b} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          {([{cx:20,cy:5},{cx:20,cy:35},{cx:5,cy:20},{cx:35,cy:20}] as {cx:number;cy:number}[]).map((d,i) =>
            <circle key={i} cx={d.cx} cy={d.cy} r="2.2" fill={a} />)}
          <circle cx="20" cy="20" r="3" fill={b} />
        </motion.svg>
      );
    case "silent_current":
      return (
        <motion.svg width="40" height="40" viewBox="0 0 40 40" animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
          {[0,1,2,3,4,5].map(i => { const ang = (i/6)*Math.PI*2; return <line key={i} x1="20" y1="20" x2={20+Math.cos(ang)*14} y2={20+Math.sin(ang)*14} stroke={b} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />; })}
          {[0,1,2,3,4,5].map(i => { const ang = (i/6)*Math.PI*2; return <circle key={`d${i}`} cx={20+Math.cos(ang)*14} cy={20+Math.sin(ang)*14} r="1.6" fill={a} opacity="0.8" />; })}
        </motion.svg>
      );
    case "signal_booster":
      return (
        <motion.svg width="44" height="40" viewBox="0 0 44 40" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.7, repeat: Infinity }}>
          <path d="M8 34 A18 18 0 0 1 36 34" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M13 26 A12 12 0 0 1 31 26" stroke={b} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M18 18 A6 6 0 0 1 26 18" stroke={a} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <circle cx="22" cy="36" r="2.5" fill={b} />
        </motion.svg>
      );
    case "anvil":
      return (
        <motion.svg width="40" height="40" viewBox="0 0 40 40" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <polygon points="20,5 35,33 5,33" stroke={a} strokeWidth="1.5" fill="none" strokeLinejoin="round" opacity="0.8" />
          <line x1="13" y1="22" x2="27" y2="22" stroke={b} strokeWidth="1.2" opacity="0.6" />
        </motion.svg>
      );
    case "chaos_pilot":
      return (
        <motion.svg width="36" height="44" viewBox="0 0 36 44" animate={{ rotate: [0, 14, -14, 0] }} transition={{ duration: 1.9, repeat: Infinity }}>
          <polyline points="20,3 12,19 22,19 14,41" stroke={a} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="20,3 12,19 22,19 14,41" stroke={b} strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </motion.svg>
      );
    case "flashpoint":
      return (
        <motion.svg width="44" height="44" viewBox="0 0 44 44" animate={{ scale: [1, 1.18, 1], opacity: [0.65, 1, 0.65] }} transition={{ duration: 2.2, repeat: Infinity }}>
          {[0,1,2,3,4,5,6,7].map(i => { const ang = (i/8)*Math.PI*2 - Math.PI/2; const len = i%2===0?14:8; return <line key={i} x1="22" y1="22" x2={22+Math.cos(ang)*len} y2={22+Math.sin(ang)*len} stroke={i%2===0?b:a} strokeWidth={i%2===0?1.6:1} strokeLinecap="round" opacity={i%2===0?0.9:0.6} />; })}
          <circle cx="22" cy="22" r="3" fill={b} />
        </motion.svg>
      );
    case "constellation_weaver":
      return (
        <motion.svg width="44" height="44" viewBox="0 0 44 44" animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 3.5, repeat: Infinity }}>
          <line x1="10" y1="34" x2="22" y2="10" stroke={b} strokeWidth="0.9" opacity="0.5" />
          <line x1="22" y1="10" x2="34" y2="30" stroke={b} strokeWidth="0.9" opacity="0.5" />
          <line x1="34" y1="30" x2="10" y2="34" stroke={b} strokeWidth="0.9" opacity="0.5" />
          <circle cx="22" cy="10" r="2.8" fill={b} />
          <circle cx="34" cy="30" r="2.2" fill={a} />
          <circle cx="10" cy="34" r="2.2" fill={a} />
          <circle cx="22" cy="10" r="5" fill="none" stroke={b} strokeWidth="0.5" opacity="0.35" />
        </motion.svg>
      );
    case "caretaker":
      return (
        <motion.svg width="38" height="44" viewBox="0 0 38 44" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M19 40 C19 40 5 30 5 17 A14 14 0 0 1 19 3 A14 14 0 0 1 33 17 C33 30 19 40 19 40Z"
            stroke={a} strokeWidth="1.2" fill="none" opacity="0.7" />
          <line x1="19" y1="3" x2="19" y2="40" stroke={b} strokeWidth="0.9" opacity="0.5" />
          <line x1="5" y1="17" x2="33" y2="17" stroke={b} strokeWidth="0.7" opacity="0.35" />
        </motion.svg>
      );
    case "deep_diver":
      return (
        <motion.svg width="44" height="44" viewBox="0 0 44 44" animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.93, 1, 0.93] }} transition={{ duration: 5, repeat: Infinity }}>
          <circle cx="22" cy="22" r="17" stroke={b} strokeWidth="0.8" fill="none" opacity="0.38" />
          <circle cx="22" cy="22" r="11" stroke={a} strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="22" cy="22" r="5" fill={b} opacity="0.25" />
          <circle cx="22" cy="22" r="1.8" fill={b} opacity="0.9" />
        </motion.svg>
      );
    case "archive_keeper":
      return (
        <motion.svg width="44" height="44" viewBox="0 0 44 44" animate={{ rotate: [0, 7, -7, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M28 8 A16 16 0 1 0 28 36 A11 11 0 1 1 28 8Z" fill={b} opacity="0.72" />
          <circle cx="17" cy="14" r="1.8" fill={a} opacity="0.6" />
          <circle cx="13" cy="24" r="1.1" fill={a} opacity="0.4" />
        </motion.svg>
      );
    case "lone_orbit":
      return (
        <motion.svg width="36" height="36" viewBox="0 0 36 36" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 3.2, repeat: Infinity }}>
          {[0,1,2,3].map(i => { const ang = (i/4)*Math.PI*2-Math.PI/4; return <line key={i} x1="18" y1="18" x2={18+Math.cos(ang)*12} y2={18+Math.sin(ang)*12} stroke={b} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />; })}
          {[0,1,2,3].map(i => { const ang = (i/4)*Math.PI*2; return <line key={`s${i}`} x1="18" y1="18" x2={18+Math.cos(ang)*7} y2={18+Math.sin(ang)*7} stroke={a} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />; })}
          <circle cx="18" cy="18" r="2.8" fill={b} />
        </motion.svg>
      );
    default: return null;
  }
}

function Planet({ spec, caption }: { spec: PlanetSpec; caption?: string }) {
  const { palette, username, primary, secondary, planetType } = spec;
  const rng = makeRng(hashString(`${username}-${primary}-${secondary ?? "none"}-${spec.topLanguage}`));
  // Short stable ID for SVG gradient/filter IDs (avoids collisions if multiple planets render)
  const uid = `p${(hashString(username) >>> 0).toString(36).slice(0, 6)}`;

  // ── personality flags ──────────────────────────────────────────────────────
  const isNocturnal  = spec.nightRatio >= 0.35 || primary === "afterglow";
  const isCollab     = primary === "constellation_weaver" || spec.mergedPrs >= 20;
  const isHighOutput = spec.totalCommits >= 600 || primary === "foundry" || primary === "anvil";
  const isFocused    = primary === "cartographer" || primary === "deep_diver" || spec.focusScore >= 65;
  const isGrowth     = primary === "flashpoint" || spec.growthTrend === "up";
  const isExplorer   = primary === "trail_mapper" || primary === "chaos_pilot" || spec.explorerScore >= 50;
  const isVeteran    = primary === "archive_keeper" || spec.totalRepos >= 25 || spec.totalCommits >= 2500;

  // ── archetype visual identity ──────────────────────────────────────────────
  const archLabel: Record<string, string> = {
    constellation_weaver: "Network Architect", foundry: "Core Builder",
    afterglow: "Night Architect", anvil: "Power Forger",
    cartographer: "Deep Mapper", deep_diver: "Domain Expert",
    flashpoint: "Growth Engine", trail_mapper: "Explorer", chaos_pilot: "Chaos Pilot",
    archive_keeper: "Veteran Guardian", lone_orbit: "Solo Satellite",
    silent_current: "Silent Force", signal_booster: "Signal Amplifier",
    caretaker: "Ecosystem Guard",
  };
  const archColor = isNocturnal ? "#818cf8"
    : isCollab     ? "#fbbf24"
    : isHighOutput ? "#f87171"
    : isFocused    ? "#22d3ee"
    : isGrowth     ? "#4ade80"
    : isExplorer   ? "#c084fc"
    : isVeteran    ? "#fb923c"
    : primary === "signal_booster" ? "#f59e0b"
    : primary === "silent_current" ? "#7dd3fc"
    : primary === "caretaker"      ? "#86efac"
    : primary === "lone_orbit"     ? "#bae6fd"
    : palette.a;
  const auraDuration = isNocturnal ? 4.0 : isHighOutput ? 2.6 : isGrowth ? 3.2 : 5.5;

  // ── orbital config ─────────────────────────────────────────────────────────
  const ringed     = primary !== "lone_orbit" && (spec.totalRepos >= 15 || isCollab || isFocused);
  const orbitCount = Math.min(13, 4 + Math.floor(spec.totalCommits / 350) + Math.floor(spec.mergedPrs / 8));
  const satCount   = Math.min(3, 1 + Math.floor((spec.followers + spec.totalStars) / 120));
  const hasComet   = isGrowth || primary === "lone_orbit";

  // ── surface: terrain blobs (seeded, soft land-mass shapes) ────────────────
  const blobCount = 3 + Math.min(3, Math.floor(spec.languageCount / 2));
  const blobs = Array.from({ length: blobCount }).map((_, i) => {
    const a = (i / blobCount) * Math.PI * 2 + rng() * 0.9;
    const d = 8 + rng() * 55;
    return { cx: 100 + Math.cos(a) * d, cy: 100 + Math.sin(a) * d, rx: 14 + rng() * 32, ry: 9 + rng() * 22, rot: rng() * 180, op: 0.15 + rng() * 0.22 };
  });

  // ── surface: city / network nodes (seeded) ────────────────────────────────
  const cityNodes = (isCollab || isVeteran) ? Array.from({ length: 16 }).map((_, i) => ({
    cx: 100 + (rng() - 0.5) * 150, cy: 100 + (rng() - 0.5) * 150,
    r: 0.8 + rng() * 1.0, hub: i < 3,
  })) : [];

  // ── atmosphere bands: colors from top language ─────────────────────────────
  const langBands: Record<string, [string, string]> = {
    TypeScript:  [`${palette.a}50`, `${palette.b}3c`],
    JavaScript:  ["#facc1550", "#a855f73c"],
    Python:      ["#f1c40f50", "#2ecc713c"],
    Rust:        ["#ff5a1f50", "#8b1e083c"],
    Go:          ["#22d3ee50", "#0d94883c"],
  };
  const [bc1, bc2] = langBands[spec.topLanguage] ?? [`${palette.b}50`, `${palette.a}3c`];
  const bandCount  = Math.min(4, 2 + (isExplorer ? 2 : 0) + (isHighOutput ? 1 : 0));

  // ── archetype surface feature ──────────────────────────────────────────────
  const showAurora       = isNocturnal;
  const showStorm        = primary === "chaos_pilot" || (isGrowth && isExplorer);
  const showCap          = isFocused || primary === "anvil";
  const showCities       = isCollab || isVeteran;
  const showMist         = primary === "silent_current" || (!isHighOutput && !isFocused && !isCollab && !isNocturnal);
  const showPulse        = primary === "signal_booster";
  const showVoid         = primary === "lone_orbit";
  const showStrata       = primary === "archive_keeper";
  const showSettlements  = primary === "caretaker";

  return (
    <div className="relative flex flex-col items-center">

      {/* ── archetype companion — with soft glow backdrop ── */}
      <div className="pointer-events-none absolute z-30" style={{ top: 18, right: 8 }}>
        <div className="relative inline-block">
          <div className="pointer-events-none absolute inset-0 -m-3 rounded-full"
            style={{ background: `radial-gradient(circle, ${archColor}40 0%, transparent 70%)`, filter: "blur(8px)" }} />
          {renderCompanion(primary, palette.a, palette.b)}
        </div>
      </div>

      {/* ── archetype aura — large radial halo behind planet ── */}
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 480, height: 480,
          top: 150 - 240, left: "50%", marginLeft: -240,
          zIndex: 4,
          background: `radial-gradient(circle, ${archColor}22 0%, ${archColor}0c 42%, transparent 68%)`,
        }}
        animate={{
          scale: isHighOutput ? [1, 1.09, 1] : [1, 1.04, 1],
          opacity: isNocturnal ? [0.7, 1.0, 0.7] : [0.55, 0.9, 0.55],
        }}
        transition={{ duration: auraDuration, repeat: Infinity, ease: "easeInOut" }} />

      {/* ── orbital ring traces — faint dashed arcs showing orbit paths ── */}
      <div className="pointer-events-none absolute" style={{ width: 360, height: 360, top: 150 - 180, left: "50%", marginLeft: -180, zIndex: 10 }}>
        <svg viewBox="0 0 360 360" className="h-full w-full" style={{ overflow: "visible" }}>
          {[165, 171, 177].map((r, i) => (
            <circle key={i} cx="180" cy="180" r={r}
              fill="none"
              stroke={i % 2 === 0 ? palette.a : palette.b}
              strokeWidth={0.8 - i * 0.2}
              strokeDasharray={i === 0 ? "3 10" : `2 ${14 + i * 5}`}
              opacity={0.24 - i * 0.06} />
          ))}
        </svg>
      </div>

      {/* ── atmospheric pulse ring — breathing corona just outside planet ── */}
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 316, height: 316,
          top: 150 - 158, left: "50%", marginLeft: -158,
          zIndex: 12,
          border: `1px solid ${archColor}`,
          boxShadow: `0 0 20px ${archColor}55, 0 0 44px ${archColor}22`,
        }}
        animate={{ scale: [1, 1.038, 1], opacity: [0.52, 0.14, 0.52] }}
        transition={{ duration: auraDuration * 0.78, repeat: Infinity, ease: "easeInOut" }} />

      {/* ── orbit trail (rotating dot ring) ── */}
      <motion.div
        style={{ position: "absolute", width: 360, height: 360, top: 150 - 180, left: "50%", marginLeft: -180, zIndex: 20 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: orbitCount }).map((_, i) => {
          const angle = (i / orbitCount) * Math.PI * 2;
          const r = 165 + (i % 3) * 6;
          const size = i % 5 === 0 ? 5 : 3;
          return (
            <span key={i} className="absolute rounded-full"
              style={{
                width: size, height: size,
                top: 180 - size / 2 + Math.sin(angle) * r,
                left: 180 - size / 2 + Math.cos(angle) * r,
                background: i % 3 === 0 ? palette.b : palette.a,
                boxShadow: `0 0 7px ${palette.glow}`,
              }} />
          );
        })}
      </motion.div>

      {/* ── planet — spring entry animation ── */}
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ position: "relative", zIndex: 15 }}>
        <div className="relative overflow-hidden rounded-full" style={{ width: 300, height: 300 }}>

          {/* sphere: slowly rotates so surface features drift */}
          <motion.div className="relative h-full w-full overflow-hidden rounded-full"
            style={{
              background: `radial-gradient(circle at 32% 28%, ${palette.b}ee, ${palette.a} 52%, rgba(0,0,0,0.98) 108%)`,
              boxShadow: `0 0 64px ${palette.glow}, inset -42px -32px 80px rgba(0,0,0,0.78), inset 24px 22px 60px ${palette.glow}42`,
            }}
            animate={{ rotate: 360 }} transition={{ duration: 110, repeat: Infinity, ease: "linear" }}>

            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              <defs>
                <filter id={`${uid}-soft`}><feGaussianBlur stdDeviation="5.5" /></filter>
                <filter id={`${uid}-med`}><feGaussianBlur stdDeviation="2.5" /></filter>
                <radialGradient id={`${uid}-tg`} cx="36%" cy="28%" r="72%">
                  <stop offset="0%" stopColor={palette.b} stopOpacity="0.58" />
                  <stop offset="100%" stopColor={palette.a} stopOpacity="0.05" />
                </radialGradient>
                <radialGradient id={`${uid}-rim`} cx="50%" cy="50%" r="50%">
                  <stop offset="66%" stopColor="transparent" stopOpacity="0" />
                  <stop offset="87%" stopColor={palette.a} stopOpacity="0.62" />
                  <stop offset="100%" stopColor={palette.b} stopOpacity="0.28" />
                </radialGradient>
                <radialGradient id={`${uid}-term`} cx="76%" cy="74%" r="54%">
                  <stop offset="18%" stopColor="transparent" stopOpacity="0" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.76" />
                </radialGradient>
              </defs>

              {blobs.map((b, i) => (
                <ellipse key={`b${i}`}
                  cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}
                  fill={`url(#${uid}-tg)`} opacity={b.op}
                  transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}
                  filter={`url(#${uid}-soft)`} />
              ))}

              {Array.from({ length: bandCount }).map((_, i) => (
                <rect key={`bd${i}`}
                  x="-18" y={24 + i * Math.floor(148 / bandCount)} width="236" height={6 + (i % 2) * 3} rx="3"
                  fill={i % 2 === 0 ? bc1 : bc2}
                  opacity={0.38 + (i % 2) * 0.07}
                  transform={`rotate(${i % 2 === 0 ? -7 : 6} 100 100)`} />
              ))}

              {showAurora && (
                <ellipse cx="100" cy="58" rx="85" ry="28"
                  fill="none" stroke={palette.b} strokeWidth="22" opacity="0.2"
                  filter={`url(#${uid}-soft)`} />
              )}

              {showStorm && (
                <g>
                  <ellipse cx="122" cy="84" rx="26" ry="14" fill="none" stroke={palette.b} strokeWidth="2.8" opacity="0.48" />
                  <ellipse cx="122" cy="84" rx="15" ry="7.5" fill="none" stroke={palette.a} strokeWidth="2" opacity="0.36" />
                  <circle cx="122" cy="84" r="4.5" fill={palette.b} opacity="0.28" />
                </g>
              )}

              {showCap && (
                <ellipse cx="100" cy="9" rx="56" ry="22"
                  fill={palette.b} opacity="0.28"
                  filter={`url(#${uid}-soft)`} />
              )}

              {showMist && (
                <>
                  <ellipse cx="70" cy="110" rx="40" ry="22" fill="white" opacity="0.09" filter={`url(#${uid}-soft)`} />
                  <ellipse cx="138" cy="75" rx="30" ry="18" fill="white" opacity="0.07" filter={`url(#${uid}-soft)`} />
                </>
              )}

              {showPulse && (
                <>
                  <circle cx="100" cy="100" r="58" fill="none" stroke={palette.b} strokeWidth="1.4" opacity="0.22" />
                  <circle cx="100" cy="100" r="74" fill="none" stroke={palette.b} strokeWidth="0.9" opacity="0.14" />
                  <circle cx="100" cy="100" r="90" fill="none" stroke={palette.a} strokeWidth="0.5" opacity="0.09" />
                </>
              )}

              {showVoid && (
                <rect x="-18" y="82" width="236" height="36" rx="5"
                  fill="black" opacity="0.38" filter={`url(#${uid}-soft)`} />
              )}

              {showStrata && [0, 1, 2, 3].map((i) => (
                <ellipse key={`st${i}`} cx="100" cy={44 + i * 34} rx="90" ry="5"
                  fill="none" stroke={palette.b} strokeWidth="0.9"
                  opacity={0.10 + i * 0.04} filter={`url(#${uid}-med)`} />
              ))}

              {showSettlements && Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return (
                  <g key={`set${i}`}>
                    <circle cx={100 + Math.cos(a) * 48} cy={100 + Math.sin(a) * 48}
                      r="2.6" fill={palette.b} opacity="0.18" filter={`url(#${uid}-med)`} />
                    <circle cx={100 + Math.cos(a) * 48} cy={100 + Math.sin(a) * 48}
                      r="1.2" fill={palette.b} opacity="0.65" />
                  </g>
                );
              })}

              {showCities && cityNodes.map((d, i) => (
                <g key={`c${i}`}>
                  <circle cx={d.cx} cy={d.cy} r={d.r * 2.4} fill={palette.b} opacity="0.1" filter={`url(#${uid}-med)`} />
                  <circle cx={d.cx} cy={d.cy} r={d.r} fill={d.hub ? palette.b : "#fde04799"} opacity={d.hub ? 0.92 : 0.58} />
                  {d.hub && i > 0 && (
                    <line x1={d.cx} y1={d.cy} x2={cityNodes[0].cx} y2={cityNodes[0].cy}
                      stroke={palette.b} strokeWidth="0.4" opacity="0.2" />
                  )}
                </g>
              ))}

              <circle cx="100" cy="100" r="99" fill={`url(#${uid}-rim)`} />
              <circle cx="100" cy="100" r="99" fill={`url(#${uid}-term)`} />
            </svg>

          </motion.div>

          {/* rings — inclined ellipses */}
          {ringed && [0, 1].map((i) => (
            <div key={i} className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border"
              style={{
                width: 390 + i * 24, height: 52 + i * 14,
                marginLeft: -(390 + i * 24) / 2, marginTop: -(52 + i * 14) / 2,
                transform: "rotate(-17deg)",
                borderColor: i === 0 ? `${palette.b}60` : `${palette.a}42`,
                boxShadow: `0 0 18px ${palette.glow}`,
              }} />
          ))}

          {/* comet streak */}
          {hasComet && (
            <motion.div className="absolute inset-0"
              animate={{ rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
              <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full"
                style={{ width: 88, height: 3, background: `linear-gradient(90deg, transparent, ${palette.b}cc)` }} />
            </motion.div>
          )}

          {/* satellites */}
          {Array.from({ length: satCount }).map((_, i) => (
            <motion.div key={i}
              className="absolute left-1/2 top-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 13 + i * 10, repeat: Infinity, ease: "linear" }}
              style={{ width: 0, height: 0 }}>
              <span className="absolute block rounded-full"
                style={{
                  width: Math.max(5, 11 - i * 2),
                  height: Math.max(5, 11 - i * 2),
                  background: i % 2 === 0 ? palette.b : palette.a,
                  transform: `translate(${163 + i * 19}px, -${Math.max(5, 11 - i * 2) / 2}px)`,
                  boxShadow: `0 0 12px ${palette.glow}`,
                }} />
            </motion.div>
          ))}

        </div>
      </motion.div>

      {/* ── caption — double-bezel card with archetype badge ── */}
      <motion.div className="mx-auto mt-4 w-[min(320px,85%)]"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        {/* outer shell */}
        <div className="rounded-[1.5rem] p-[2px]" style={{
          background: `${archColor}80`,
          boxShadow: `0 0 28px ${archColor}70, 0 0 56px ${archColor}38, 0 10px 44px rgba(0,0,0,0.55)`,
        }}>
          {/* inner core */}
          <div className="rounded-[calc(1.5rem-2px)] px-4 py-3 text-center" style={{
            background: `linear-gradient(160deg, rgba(5,3,18,0.97), rgba(10,6,26,0.95))`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 28px ${archColor}0d`,
          }}>
            {/* archetype badge */}
            <span className="inline-flex items-center rounded-full px-2 py-[2px] text-[8px] uppercase tracking-[0.3em]"
              style={{ background: `${archColor}1c`, color: archColor, border: `1px solid ${archColor}44` }}>
              {archLabel[primary] ?? "Developer"}
            </span>

            <p className="mt-1.5 text-[9px] uppercase tracking-[0.28em]" style={{ color: palette.a }}>{planetType}</p>
            <p className="mt-0.5 text-base italic" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "serif" }}>@{username}</p>

            {caption && (
              <>
                <div className="mx-auto my-2 h-px w-8"
                  style={{ background: `linear-gradient(90deg, transparent, ${archColor}75, transparent)` }} />
                <p className="text-[11px] leading-snug" style={{ color: "rgba(212,212,228,0.80)" }}>{caption}</p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SlideShare({
  profile,
  showStartOver = true,
}: {
  profile: WrappedProfile;
  showStartOver?: boolean;
}) {
  const flat = mapToFlat(profile);
  const ageLabel = formatGitHubAge(profile.metrics.githubAge);
  const wrappedLabel = formatWrappedLabel(profile.period.type);
  const cardRef = useRef<HTMLDivElement>(null);
  const [openBadge, setOpenBadge] = useState<{ badge: PopoverBadge; rect: DOMRect } | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const nightRatio = flat.totalCommits > 0 ? flat.nightCommits / flat.totalCommits : 0;
  const archetype = deriveArchetype(nightRatio, flat.longestStreak, flat.pullRequests.merged, flat.totalCommits, flat.archetype);
  const langPalette = LANG_PALETTES[flat.topLanguages[0]?.name ?? "default"] || LANG_PALETTES.default;
  const palette = useMemo(
    () => blendPalette(langPalette, profile.archetypeBlend.primary.id, profile.archetypeBlend.primary.weight),
    [langPalette, profile.archetypeBlend.primary.id, profile.archetypeBlend.primary.weight],
  );
  const planetSpec = useMemo(
    () => buildPlanetSpec(profile, flat, palette, nightRatio),
    [profile, flat, palette, nightRatio],
  );

  // Profile-driven fallback, re-rolled per render — used only if the AI narrative
  // never arrived (e.g. the narrative request failed entirely).
  const fallback = useMemo(
    () => buildFallbackNarrative(
      {
        username: flat.username,
        archetype: flat.archetype,
        archetypeId: profile.archetypeBlend.primary.id,
        primaryWeight: profile.archetypeBlend.primary.weight,
        totalCommits: flat.totalCommits,
        longestStreak: flat.longestStreak,
        currentStreak: flat.currentStreak,
        peakHour: flat.peakHour,
        topLanguage: flat.topLanguages[0]?.name ?? "code",
        topRepo: flat.topRepos[0]?.name ?? "your repo",
        nightRatio,
        prsMerged: flat.pullRequests.merged,
        totalRepos: flat.totalRepos,
        periodLabel: flat.period.label,
      },
      profile.tone,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flat.username, profile.tone],
  );

  const roastLine = profile.narrative?.roastLine ?? fallback.roastLine;
  const narrativeText = profile.narrative?.archetypeDescription ?? fallback.archetypeDescription;
  const shareCaption = profile.narrative?.shareCaption ?? fallback.shareCaption;

  const badgesEarned = flat.traitBadges.slice(0, 6);

  const RARITY_RANK: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  const grade = badgesEarned[0]?.rarity ?? "rare";
  const stars = RARITY_RANK[grade] ?? 3;

  const startOver = () => {
    try { sessionStorage.removeItem("wrappedProfile"); } catch {}
    window.location.href = "/";
  };

  return (
    <>
    <main className="relative h-full overflow-hidden" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute inset-0 z-0 lg:hidden"><SpaceBackground accent={palette.a} /></div>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 15% 80%, rgba(120,80,200,0.18), transparent 60%)" }} />
      <Stars />
      <ChapterHeadingAnchor n={8} title="Your Planet" />

<div className="relative z-10 flex h-full flex-col px-4 pt-4 pb-14 lg:pb-0 lg:grid lg:min-h-screen lg:grid-cols-3 lg:items-center lg:gap-4 lg:px-8 lg:py-16">
        {/* LEFT — cat rocket bobbing */}
        <motion.div className="hidden h-[420px] items-center justify-center lg:flex lg:h-full lg:justify-end" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
          <motion.div className="relative" animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat-rocket.png" alt="Cat astronaut" width={280} height={280}
              className="block select-none object-contain drop-shadow-[0_0_30px_rgba(167,139,250,0.35)]"
              draggable={false} />
            <RocketTailNodes scale={1.6} />
          </motion.div>
        </motion.div>

        {/* CENTER — share card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="flex flex-1 min-h-0 flex-col items-center w-full lg:justify-center"
        >
          <div className="w-[min(380px,92vw)] lg:hidden">
            <ChapterHeadingMobile n={8} title="Your Planet" />
          </div>
          <SlideCard ref={cardRef} accentColor={palette.a} compact>
            <div className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 pointer-events-none">
              <span className="text-[15px] lg:text-[20px] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
                <span style={{ color: palette.a, textShadow: `0 0 14px ${palette.a}aa` }}>G</span>rind<span style={{ color: palette.a, textShadow: `0 0 14px ${palette.a}aa` }}>IT</span>
              </span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="relative flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 overflow-hidden rounded-full text-sm font-bold text-white flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`, boxShadow: `0 0 16px ${palette.glow}` }}>
                {flat.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={flat.avatarUrl} alt={flat.username} className="absolute inset-0 h-full w-full object-cover" />
                ) : flat.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm lg:text-base font-bold text-zinc-100">@{flat.username}</p>
                <p className="text-[9px] lg:text-[10px] text-white/50">{ageLabel}, {wrappedLabel}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-start gap-10">
              <h1 className="font-extrabold leading-tight text-[18px] lg:text-[28px]"
                style={{ background: `linear-gradient(90deg, ${palette.b}, ${palette.a})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.02em" }}>
                {archetype}
              </h1>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap"
                    style={{ color: palette.a, border: `1px solid ${palette.a}55`, background: `${palette.a}14`, boxShadow: `0 0 10px ${palette.glow}` }}>
                    {grade} grade
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-[13px] leading-none"
                      style={{ color: i < stars ? palette.a : "rgba(255,255,255,0.18)", textShadow: i < stars ? `0 0 6px ${palette.glow}` : undefined }}>★</span>
                  ))}
                </div>
              </div>
            </div>
            {roastLine && (
              <p className="mt-2 text-xs lg:text-sm font-semibold leading-snug" style={{ color: palette.a }}>&ldquo;{roastLine}&rdquo;</p>
            )}
            <p className="mt-2 whitespace-pre-line text-xs lg:text-sm italic leading-relaxed text-zinc-300">{narrativeText}</p>
            <div className="mt-2 flex flex-wrap gap-1 lg:gap-2">
              {badgesEarned.map((b) => (
                <button key={b.id} type="button"
                  onClick={(e) => setOpenBadge({ badge: b, rect: e.currentTarget.getBoundingClientRect() })}
                  aria-haspopup="dialog"
                  aria-label={`${b.label} badge — show what it means`}
                  className="inline-flex cursor-pointer items-center gap-0.5 lg:gap-1.5 rounded-full border px-2 py-0.5 lg:px-3.5 lg:py-1.5 text-[10px] lg:text-sm text-zinc-100 whitespace-nowrap transition-transform duration-150 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  style={{ borderColor: `${b.color}55`, background: `${b.color}14`, boxShadow: `0 0 12px ${b.color}44` }}>
                  <span style={{ color: b.color }}><Glyph name={b.icon as GlyphName} size={14} /></span>
                  {b.label}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {[
                { n: formatNum(flat.totalCommits), l: "commits" },
                { n: formatNum(flat.totalLinesOfCode), l: "lines" },
                { n: formatNum(flat.pullRequests.merged), l: "PRs" },
                { n: formatNum(flat.totalRepos), l: "repos" },
              ].map((s) => (
                <div key={s.l} className="rounded-md border px-1 py-1 text-center"
                  style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-xs lg:text-sm font-semibold text-zinc-50">{s.n}</p>
                  <p className="text-[8px] uppercase tracking-widest text-zinc-400">{s.l}</p>
                </div>
              ))}
            </div>
          </SlideCard>

          {/* mobile: planet caption below the card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="flex-none mt-2 w-[min(300px,84vw)] lg:hidden"
          >
            <div className="rounded-2xl p-[2px]" style={{
              background: `${palette.a}80`,
              boxShadow: `0 0 28px ${palette.a}70, 0 0 56px ${palette.a}38, 0 10px 44px rgba(0,0,0,0.55)`,
            }}>
              <div className="rounded-[calc(0.75rem-2px)] px-3 py-2 text-center" style={{
                background: `linear-gradient(160deg, rgba(5,3,18,0.97), rgba(10,6,26,0.95))`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07)`,
              }}>
                <p className="text-[8px] uppercase tracking-[0.28em]" style={{ color: palette.a }}>
                  {ARCHETYPE_PLANET_TYPES[profile.archetypeBlend.primary.id] ?? "Planet"}
                </p>
                <p className="mt-0.5 text-sm italic" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "serif" }}>@{flat.username}</p>
                {shareCaption && (
                  <>
                    <div className="mx-auto my-1.5 h-px w-6"
                      style={{ background: `linear-gradient(90deg, transparent, ${palette.a}75, transparent)` }} />
                    <p className="text-[10px] leading-snug" style={{ color: "rgba(212,212,228,0.80)" }}>{shareCaption}</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — planet */}
        <motion.div className="relative hidden lg:block" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.8 }}>
          <PlanetStage className="!pt-10">
            <Planet spec={planetSpec} caption={shareCaption} />
          </PlanetStage>
        </motion.div>
      </div>

    </main>
    <BadgePopover
      badge={openBadge?.badge ?? null}
      anchor={openBadge?.rect ?? null}
      onClose={() => setOpenBadge(null)}
    />
    {mounted && showStartOver && createPortal(
      <motion.div className="hidden lg:flex fixed bottom-6 left-1/2 z-[60] -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        <button onClick={startOver} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-5 py-2 text-sm font-medium text-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Start over
        </button>
      </motion.div>,
      document.body
    )}
    </>
  );
}
