"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars } from "@/components/wrapped/shared";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";


const LANG_PALETTES: Record<string, { a: string; b: string; glow: string }> = {
  TypeScript: { a: "#3178c6", b: "#cdd6e3", glow: "rgba(49,120,198,0.55)" },
  Python: { a: "#f1c40f", b: "#2ecc71", glow: "rgba(241,196,15,0.5)" },
  Rust: { a: "#ff5a1f", b: "#8b1e08", glow: "rgba(255,90,31,0.55)" },
  Go: { a: "#22d3ee", b: "#0d9488", glow: "rgba(34,211,238,0.5)" },
  JavaScript: { a: "#facc15", b: "#a855f7", glow: "rgba(250,204,21,0.45)" },
  default: { a: "#a78bfa", b: "#f5f3ff", glow: "rgba(167,139,250,0.55)" },
};

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

function Planet({ palette, archetype, username }: { palette: { a: string; b: string; glow: string }; archetype: string; username: string }) {
  const moons = archetype === "THE COLLABORATOR";
  const comets = archetype === "THE SPRINTER";
  const cities = archetype === "THE NIGHT OWL";
  const geometric = archetype === "THE BUILDER";
  const misty = archetype === "THE EXPLORER";

  return (
    <div className="relative flex flex-col items-center">
      <motion.div className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        {[...Array(14)].map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const r = 200;
          return (
            <span key={i} className="absolute h-1 w-1 rounded-full"
              style={{ background: palette.a, boxShadow: `0 0 8px ${palette.glow}`, transform: `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px)` }} />
          );
        })}
      </motion.div>
      <div className="relative" style={{ width: 360, height: 360 }}>
        <div className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 120px 40px ${palette.glow}`, background: `radial-gradient(circle at 50% 50%, ${palette.glow}, transparent 70%)` }} />
        <motion.div className="relative h-full w-full overflow-hidden rounded-full"
          style={{ background: `radial-gradient(circle at 30% 30%, ${palette.b}, ${palette.a} 55%, #000 110%)`, boxShadow: `inset -30px -30px 80px rgba(0,0,0,0.7), inset 20px 20px 60px ${palette.glow}` }}
          animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}>
          {geometric && (
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-50">
              {[...Array(12)].map((_, i) => <rect key={i} x={(i * 17) % 180} y={(i * 23) % 170} width={8 + (i % 4) * 3} height={8 + (i % 3) * 3} fill={palette.b} opacity="0.4" />)}
            </svg>
          )}
          {cities && (
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              {[...Array(30)].map((_, i) => <circle key={i} cx={(i * 13) % 190 + 5} cy={(i * 19) % 190 + 5} r="1.2" fill="#fde047" opacity="0.9" />)}
            </svg>
          )}
          {misty && <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.25), transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.2), transparent 50%)" }} />}
          {!geometric && !cities && !misty && (
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-40">
              {[...Array(8)].map((_, i) => <ellipse key={i} cx={(i * 29) % 180 + 10} cy={(i * 37) % 180 + 10} rx={8 + (i % 3) * 4} ry={5 + (i % 2) * 3} fill={palette.b} opacity="0.35" />)}
            </svg>
          )}
        </motion.div>
        {comets && (
          <motion.div className="absolute inset-0" animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <div className="absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${palette.b})` }} />
          </motion.div>
        )}
        {moons && [0, 1, 2].map((i) => (
          <motion.div key={i} className="absolute left-1/2 top-1/2"
            animate={{ rotate: 360 }} transition={{ duration: 18 + i * 8, repeat: Infinity, ease: "linear" }} style={{ width: 0, height: 0 }}>
            <span className="absolute block rounded-full bg-zinc-200"
              style={{ width: 12 - i * 2, height: 12 - i * 2, transform: `translate(${180 + i * 14}px, -6px)`, boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
          </motion.div>
        ))}
      </div>
      <motion.div className="mt-8 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Planet</p>
        <p className="mt-1 text-lg italic text-zinc-200" style={{ fontFamily: "serif" }}>{username}</p>
      </motion.div>
    </div>
  );
}

export default function SlideShare({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount guard for the portal
  useEffect(() => { setMounted(true); }, []);

  const nightRatio = flat.totalCommits > 0 ? flat.nightCommits / flat.totalCommits : 0;
  const archetype = deriveArchetype(nightRatio, flat.longestStreak, flat.pullRequests.merged, flat.totalCommits, flat.archetype);
  const palette = LANG_PALETTES[flat.topLanguages[0]?.name ?? "default"] || LANG_PALETTES.default;

  // Profile-driven fallback, re-rolled per render — used only if the AI narrative
  // never arrived (e.g. the narrative request failed entirely).
  const fallback = useMemo(
    () => buildFallbackNarrative(
      {
        username: flat.username,
        archetype: flat.archetype,
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

  const badgesEarned: string[] = [];
  if (flat.longestStreak >= 7) badgesEarned.push("🔥 Streak");
  if (flat.totalCommits >= 200) badgesEarned.push("⚡ Speed");
  if (nightRatio >= 0.3) badgesEarned.push("🌙 Night Owl");
  if (flat.pullRequests.merged >= 10) badgesEarned.push("🤝 Collab");
  if (flat.totalCommits >= 100) badgesEarned.push("🛠️ Builder");

  const share = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "planet.png", { type: "image/png" });
        const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void>; canShare?: (d: ShareData) => boolean };
        if (nav.share && nav.canShare?.({ files: [file] })) {
          await nav.share({ files: [file], title: "My Planet", text: `${archetype} — @${flat.username}` });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `planet-${flat.username}.png`; a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (e) { console.error(e); }
  };

  const startOver = () => {
    try { sessionStorage.removeItem("wrappedProfile"); } catch {}
    window.location.href = "/";
  };

  return (
    <>
    <main className="relative min-h-full overflow-hidden" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 75% 50%, ${palette.glow}, transparent 55%), radial-gradient(ellipse at 15% 80%, rgba(120,80,200,0.18), transparent 60%)` }} />
      <Stars />
      <ChapterHeadingAnchor n={8} title="Your Planet" />

<div className="relative z-10 grid min-h-screen grid-cols-1 items-center gap-8 px-8 py-16 lg:grid-cols-3 lg:gap-4">
        {/* LEFT — cat rocket bobbing */}
        <motion.div className="flex h-[420px] items-center justify-center lg:h-full lg:justify-end" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
          <motion.div animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat-rocket.png" alt="Cat astronaut" width={280} height={280}
              className="select-none object-contain drop-shadow-[0_0_30px_rgba(167,139,250,0.35)]"
              draggable={false} />
          </motion.div>
        </motion.div>

        {/* CENTER — share card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }} className="flex justify-center">
          <div ref={cardRef} className="w-full [&::-webkit-scrollbar]:hidden" style={{ maxWidth: 380, height: "min(580px, 84vh)", overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, padding: 16, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-base font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`, boxShadow: `0 0 20px ${palette.glow}` }}>
                {flat.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={flat.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : flat.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Your Planet</p>
                <p className="text-base font-bold text-zinc-100">@{flat.username}</p>
              </div>
            </div>
            <h1 className="mt-3 font-extrabold leading-tight"
              style={{ fontSize: 28, background: `linear-gradient(90deg, ${palette.b}, ${palette.a})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.02em" }}>
              {archetype}
            </h1>
            {roastLine && (
              <p className="mt-2 text-sm font-semibold leading-snug" style={{ color: palette.a }}>&ldquo;{roastLine}&rdquo;</p>
            )}
            <p className="mt-2 whitespace-pre-line text-sm italic leading-relaxed text-zinc-300">{narrativeText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badgesEarned.map((b) => (
                <span key={b} className="rounded-full border px-3 py-1 text-xs text-zinc-100"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", boxShadow: `0 0 12px ${palette.glow}` }}>
                  {b}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { n: formatNum(flat.totalCommits), l: "commits" },
                { n: formatNum(flat.linesAdded), l: "lines added" },
                { n: formatNum(flat.pullRequests.merged), l: "PRs merged" },
                { n: formatNum(flat.totalRepos), l: "repos" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border px-3 py-3"
                  style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="text-xl font-semibold text-zinc-50">{s.n}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-zinc-500">{s.l}</p>
                </div>
              ))}
            </div>
            <button onClick={share} className="mt-3 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 30px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              Share your planet
            </button>
          </div>
        </motion.div>

        {/* RIGHT — planet */}
        <motion.div className="relative" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.8 }}>
          <PlanetStage>
            <Planet palette={palette} archetype={archetype} username={flat.username} />
          </PlanetStage>
        </motion.div>
      </div>

    </main>
    {mounted && createPortal(
      <motion.div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        <button onClick={startOver} className="text-xs uppercase tracking-[0.3em] text-zinc-500 transition hover:text-zinc-200">
          Start over
        </button>
      </motion.div>,
      document.body
    )}
    </>
  );
}
