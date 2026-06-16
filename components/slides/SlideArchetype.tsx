"use client";

import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, MobilePlanet } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { Glyph, type GlyphName } from "@/components/wrapped/TrophyIcons";

function CountUpInner({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.8, ease: "easeOut" });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const r = (k: number) => { const v = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
    return {
      x: r(1) * 100, delay: r(2) * 6, dur: r(3) * 6 + 6, rot: r(4) * 360,
      color: ["#ff3ea5", "#a855f7", "#22d3ee", "#facc15", "#f472b6"][Math.floor(r(5) * 5)],
      w: r(6) * 6 + 4, h: r(7) * 10 + 6,
    };
  }), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span key={i} className="absolute top-[-5%]"
          style={{ left: `${p.x}%`, width: p.w, height: p.h, background: p.color, borderRadius: 2, boxShadow: `0 0 8px ${p.color}` }}
          initial={{ y: -40, rotate: p.rot, opacity: 0 }}
          animate={{ y: "110vh", rotate: p.rot + 720, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }} />
      ))}
    </div>
  );
}

function DiscoBall() {
  return (
    <motion.div className="relative mx-auto" style={{ width: 140, height: 140 }}
      animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <div className="absolute left-1/2 -top-16 h-16 w-px -translate-x-1/2"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))" }} />
      <motion.div className="absolute inset-0 -z-10 blur-3xl"
        animate={{ background: [
          "radial-gradient(50% 50% at 50% 50%, rgba(255,62,165,0.6), transparent 70%)",
          "radial-gradient(50% 50% at 50% 50%, rgba(34,211,238,0.6), transparent 70%)",
          "radial-gradient(50% 50% at 50% 50%, rgba(168,85,247,0.6), transparent 70%)",
          "radial-gradient(50% 50% at 50% 50%, rgba(250,204,21,0.6), transparent 70%)",
        ] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="relative h-full w-full overflow-hidden rounded-full"
        style={{ background: "radial-gradient(circle at 30% 25%, #ffffff 0%, #d8b4fe 18%, #a855f7 45%, #4c1d95 80%, #1e0a3c 100%)", boxShadow: "inset -10px -14px 30px rgba(0,0,0,0.6), inset 8px 10px 18px rgba(255,255,255,0.35), 0 0 40px rgba(168,85,247,0.6)" }}
        animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
        <div className="absolute inset-0 rounded-full"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)", backgroundSize: "14px 14px", mixBlendMode: "overlay" }} />
        {[{ x: 20, y: 30 }, { x: 60, y: 20 }, { x: 75, y: 55 }, { x: 35, y: 65 }, { x: 50, y: 45 }].map((s, i) => (
          <motion.span key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: 6, height: 6, filter: "blur(1px)" }}
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function DanceFloor() {
  const cols = 8;
  const rows = 5;
  const colors = ["#ff3ea5", "#a855f7", "#22d3ee", "#facc15", "#f472b6", "#34d399"];
  const tiles = useMemo(() => Array.from({ length: cols * rows }, (_, i) => ({
    i, delay: ((i * 137) % 100) / 100 * 2, color: colors[i % colors.length],
  })), []);
  return (
    <div className="mx-auto mt-6"
      style={{ width: "92%", maxWidth: 420, transform: "perspective(600px) rotateX(55deg)", transformOrigin: "center top" }}>
      <div className="grid gap-1 rounded-md p-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, background: "rgba(0,0,0,0.4)", boxShadow: "0 0 60px rgba(168,85,247,0.4)" }}>
        {tiles.map((t) => (
          <motion.div key={t.i} className="aspect-square rounded-sm" style={{ background: t.color }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: t.delay, ease: "easeInOut" }} />
        ))}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-2">
      <div className="text-lg font-black tabular-nums"><CountUpInner value={value} /></div>
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}

export default function SlideArchetype({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const badges = flat.traitBadges.slice(0, 6);
  const topBadgeId = badges[0]?.id;
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const selectedBadge = badges.find((b) => b.id === selectedBadgeId) ?? null;
  const archetypeDisplay = flat.archetype
    ? flat.archetype.toUpperCase().startsWith("THE ") ? flat.archetype.toUpperCase() : `THE ${flat.archetype.toUpperCase()}`
    : "THE BUILDER";

  return (
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 20% 30%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(50% 50% at 85% 70%, rgba(34,211,238,0.15), transparent 60%), radial-gradient(40% 40% at 70% 20%, rgba(255,62,165,0.12), transparent 60%)" }} />
      <Stars />
      <Confetti />
      <ChapterHeadingAnchor n={7} title="The Reveal" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 items-start gap-8 px-4 pb-10 pt-16 lg:items-center lg:px-8 lg:py-16 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT — disco ball + cats + dance floor */}
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative hidden items-center justify-center lg:flex">
          <div className="relative flex w-[88%] max-w-[360px] flex-col items-center">
            <DiscoBall />
            <motion.div animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative -mt-2 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/cats-only.png" alt="Cat astronauts celebrating"
                className="w-full select-none"
                style={{ filter: "drop-shadow(0 18px 40px rgba(168,85,247,0.5)) drop-shadow(0 0 30px rgba(255,62,165,0.3))" }}
                draggable={false} />
            </motion.div>
            <DanceFloor />
          </div>
        </motion.div>

        {/* CENTER — glass card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }} className="relative w-[min(380px,92vw)] justify-self-center lg:-translate-y-10">
          <div className="lg:hidden">
            <ChapterHeadingMobile n={7} title="The Reveal" />
            <MobilePlanet color="#a855f7" />
          </div>
          <div data-share-card className="relative [&::-webkit-scrollbar]:hidden" style={{ height: 500, overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, padding: 16, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flat.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(flat.username)}`}
                alt={flat.username} className="h-10 w-10 rounded-full border border-white/10 bg-white/5" width={40} height={40} />
              <div className="min-w-0">
                <div className="truncate text-base font-bold">@{flat.username}</div>
                <div className="text-[10px] text-white/55">{flat.period.label} · Wrapped</div>
              </div>
            </div>
            <div className="mt-3 flex">
              <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ background: "linear-gradient(90deg,#ff3ea5,#a855f7,#22d3ee,#facc15)", color: "#080612", boxShadow: "0 4px 18px rgba(168,85,247,0.45)" }}>
                Trait badges
              </span>
            </div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 18 }}
              className="mt-3 flex items-baseline gap-2">
              <div className="leading-none" style={{ fontSize: 44, fontWeight: 900, background: "linear-gradient(90deg,#ff3ea5,#a855f7,#22d3ee,#facc15,#ff3ea5)", backgroundSize: "300% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "arc7 6s linear infinite", letterSpacing: "-0.03em" }}>
                <CountUpInner value={flat.traitBadges.length} />
              </div>
              <span className="text-[13px] text-white/55">of {flat.traitBadgesTotal} badges</span>
            </motion.div>

            {/* rarity breakdown — same pattern as slide 6 */}
            {flat.traitBadges.length > 0 && (() => {
              const BADGE_RARITY_HEX: Record<string, string> = {
                legendary: "#fbbf24", epic: "#38bdf8", rare: "#a78bfa", uncommon: "#34d399", common: "#9aa4b2",
              };
              const counts = (["legendary", "epic", "rare", "uncommon", "common"] as const)
                .map((r) => ({ rarity: r, n: flat.traitBadges.filter((b) => b.rarity === r).length }))
                .filter((x) => x.n > 0);
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
                  className="mt-2 flex flex-wrap gap-1.5">
                  {counts.map((rc) => (
                    <span key={rc.rarity} className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: BADGE_RARITY_HEX[rc.rarity], border: `1px solid ${BADGE_RARITY_HEX[rc.rarity]}55`, background: `${BADGE_RARITY_HEX[rc.rarity]}14` }}>
                      {rc.n} {rc.rarity}
                    </span>
                  ))}
                </motion.div>
              );
            })()}

            {badges.length > 0 ? (
              <>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {badges.map((b, i) => {
                    const isTop = b.id === topBadgeId;
                    const isSelected = b.id === selectedBadgeId;
                    return (
                      <motion.button
                        key={b.id}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + i * 0.08 }}
                        onClick={() => setSelectedBadgeId(isSelected ? null : b.id)}
                        className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-left transition-all"
                        style={{
                          background: isSelected ? `${b.color}22` : `${b.color}10`,
                          border: `1px solid ${b.color}${isSelected ? "88" : isTop ? "55" : "28"}`,
                          boxShadow: isTop && !isSelected ? `0 0 18px ${b.color}44, inset 0 0 12px ${b.color}18` : isSelected ? `0 0 0 1px ${b.color}66, 0 0 20px ${b.color}55` : undefined,
                          cursor: "pointer",
                        }}>
                        <span style={{ color: b.color, filter: `drop-shadow(0 0 5px ${b.color}88)` }}>
                          <Glyph name={b.icon as GlyphName} size={22} />
                        </span>
                        <div className="text-center text-[9.5px] font-semibold leading-tight"
                          style={{ color: isSelected || isTop ? b.color : "rgba(255,255,255,0.72)" }}>
                          {b.label}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* tap-to-reveal explanation panel */}
                <AnimatePresence mode="wait">
                  {selectedBadge && (
                    <motion.div
                      key={selectedBadge.id}
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: `${selectedBadge.color}14`, border: `1px solid ${selectedBadge.color}38` }}>
                        <span className="shrink-0" style={{ color: selectedBadge.color, filter: `drop-shadow(0 0 6px ${selectedBadge.color}99)` }}>
                          <Glyph name={selectedBadge.icon as GlyphName} size={26} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12px] font-bold leading-tight" style={{ color: selectedBadge.color }}>
                            {selectedBadge.label}
                          </div>
                          <div className="mt-0.5 text-[10.5px] leading-snug text-white/65">
                            {selectedBadge.explanation}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/50">
                Still warming up — your vibe is taking shape.
              </div>
            )}
            <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/5 bg-white/[0.02] py-3 text-center">
              <StatItem label="commits" value={flat.totalCommits} />
              <StatItem label="PRs merged" value={flat.pullRequests.merged} />
              <StatItem label="repos" value={flat.totalRepos} />
            </div>
            <div className="mt-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Your vibe</div>
              <div className="mt-1 text-2xl font-black"
                style={{ background: "linear-gradient(90deg,#facc15,#ff3ea5,#a855f7,#22d3ee)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "arc7b 5s linear infinite", letterSpacing: "0.02em" }}>
                {archetypeDisplay}
              </div>
            </div>
          </div>

          {/* mobile: animated disco scene below the card (scroll to reveal) */}
          <div className="mt-8 flex flex-col items-center lg:hidden">
            <DiscoBall />
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative -mt-2 w-[min(320px,82vw)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/cats-only.png" alt="Cat astronauts celebrating" className="w-full select-none"
                style={{ filter: "drop-shadow(0 18px 40px rgba(168,85,247,0.5))" }} draggable={false} />
            </motion.div>
            <DanceFloor />
          </div>
        </motion.div>

        {/* RIGHT — party planet with pulsing rays */}
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="relative hidden h-full items-center justify-center overflow-hidden lg:flex">
          <PlanetStage>
          <div className="relative h-[560px] w-[560px]">
            <motion.img src="/wrapped/party-planet.png" alt="Party planet bursting with neon color"
              width={1024} height={1024}
              className="h-full w-full select-none object-contain"
              style={{
                filter: "drop-shadow(0 20px 60px rgba(255,62,165,0.55)) drop-shadow(0 0 50px rgba(34,211,238,0.35))",
                WebkitMaskImage: "radial-gradient(ellipse 62% 48% at 50% 50%, #000 0%, #000 68%, transparent 86%)",
                maskImage: "radial-gradient(ellipse 62% 48% at 50% 50%, #000 0%, #000 68%, transparent 86%)",
              }}
              draggable={false} />
          </div>
          </PlanetStage>
        </motion.div>
      </div>

      <style>{`
        @keyframes arc7 { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
        @keyframes arc7b { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
      `}</style>
    </main>
  );
}
