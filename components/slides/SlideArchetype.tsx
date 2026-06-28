"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat, formatGitHubAge, formatWrappedLabel } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, RocketTailNodes, SLIDE7_TAIL_NODES } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { Glyph, type GlyphName } from "@/components/wrapped/TrophyIcons";
import { SlideCard } from "@/components/wrapped/SlideCard";
import { BadgePopover, type PopoverBadge } from "@/components/wrapped/BadgePopover";

const ACCENT = "#c084fc";

function CountUpInner({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.8, ease: "easeOut" });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

function Confetti({ sparse = false }: { sparse?: boolean }) {
  const pieces = useMemo(() => {
    const count = sparse ? 8 : 60;
    return Array.from({ length: count }, (_, i) => {
      const r = (k: number) => { const v = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
      return {
        x: r(1) * 100,
        delay: sparse ? r(2) * 10 : r(2) * 6,
        dur: sparse ? r(3) * 8 + 10 : r(3) * 6 + 6,
        rot: r(4) * 360,
        color: ["#ff3ea5", "#a855f7", "#22d3ee", "#facc15", "#f472b6"][Math.floor(r(5) * 5)],
        w: sparse ? r(6) * 5 + 3 : r(6) * 6 + 4,
        h: sparse ? r(7) * 8 + 5 : r(7) * 10 + 6,
      };
    });
  }, [sparse]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span key={i} className="absolute top-[-5%]"
          style={{ left: `${p.x}%`, width: p.w, height: p.h, background: p.color, borderRadius: 2, ...(sparse ? { opacity: 0.55 } : { boxShadow: `0 0 8px ${p.color}` }) }}
          initial={{ y: -40, rotate: p.rot, opacity: sparse ? undefined : 0 }}
          animate={{ y: "110vh", rotate: p.rot + (sparse ? 540 : 720), opacity: sparse ? undefined : [0, 1, 1, 0] }}
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

const DANCE_COLORS = ["#ff3ea5", "#a855f7", "#22d3ee", "#facc15", "#f472b6", "#34d399"];

function DanceFloor({ sparse = false }: { sparse?: boolean }) {
  const cols = sparse ? 6 : 8;
  const rows = sparse ? 3 : 5;
  const tiles = useMemo(() => Array.from({ length: cols * rows }, (_, i) => ({
    i, delay: ((i * 137) % 100) / 100 * (sparse ? 3 : 2), color: DANCE_COLORS[i % DANCE_COLORS.length],
  })), [cols, rows, sparse]);
  return (
    <div className="mx-auto mt-6"
      style={{ width: sparse ? "80%" : "92%", maxWidth: sparse ? 320 : 420, transform: "perspective(600px) rotateX(55deg)", transformOrigin: "center top" }}>
      <div className="grid gap-1 rounded-md p-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, background: sparse ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.4)", boxShadow: sparse ? "0 0 40px rgba(168,85,247,0.25)" : "0 0 60px rgba(168,85,247,0.4)" }}>
        {tiles.map((t) => (
          <motion.div key={t.i} className="aspect-square rounded-sm" style={{ background: t.color }}
            animate={{ opacity: sparse ? [0.1, 0.7, 0.1] : [0.15, 1, 0.15] }}
            transition={{ duration: sparse ? 2.8 : 1.6, repeat: Infinity, delay: t.delay, ease: "easeInOut" }} />
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

export default function SlideArchetype({ profile, sparse = false }: { profile: WrappedProfile; sparse?: boolean }) {
  const flat = mapToFlat(profile);
  const ageLabel = formatGitHubAge(profile.metrics.githubAge);
  const wrappedLabel = formatWrappedLabel(profile.period.type);
  const badges = flat.traitBadges.slice(0, 6);
  const topBadgeId = badges[0]?.id;
  const [openBadge, setOpenBadge] = useState<{ badge: PopoverBadge; rect: DOMRect } | null>(null);
  const archetypeDisplay = flat.archetype
    ? flat.archetype.toUpperCase().startsWith("THE ") ? flat.archetype.toUpperCase() : `THE ${flat.archetype.toUpperCase()}`
    : "THE BUILDER";

  return (
    <>
    <main className="relative h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 20% 30%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(50% 50% at 85% 70%, rgba(34,211,238,0.15), transparent 60%), radial-gradient(40% 40% at 70% 20%, rgba(255,62,165,0.12), transparent 60%)" }} />
      <Stars />
      <Confetti sparse={sparse} />
      <ChapterHeadingAnchor n={7} title="The Reveal" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col px-4 pt-4 lg:grid lg:min-h-screen lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8 lg:py-16">
        {/* LEFT — disco ball + cats + dance floor */}
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative hidden items-center justify-center lg:flex">
          <div className="relative flex w-[88%] max-w-[360px] flex-col items-center lg:-translate-x-28">
            <DiscoBall />
            <motion.div animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative -mt-2 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/two-cats-surprised.png" alt="Cat astronauts celebrating"
                className="block w-full select-none"
                style={{ filter: "drop-shadow(0 18px 40px rgba(168,85,247,0.5)) drop-shadow(0 0 30px rgba(255,62,165,0.3))" }}
                draggable={false} />
              <RocketTailNodes scale={1.5} nodes={SLIDE7_TAIL_NODES} />
            </motion.div>
            <DanceFloor sparse={sparse} />
          </div>
        </motion.div>

        {/* CENTER — glass card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="flex flex-1 min-h-0 flex-col items-center w-full lg:flex-none lg:w-[min(380px,92vw)] lg:justify-self-center lg:absolute lg:left-1/2 lg:top-[8%] lg:mt-0 lg:-translate-x-1/2">
          <div className="lg:hidden">
            <ChapterHeadingMobile n={7} title="The Reveal" />
          </div>
          <SlideCard accentColor={ACCENT} compact>
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="text-[20px] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
                <span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>G</span>rind<span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>IT</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flat.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(flat.username)}`}
                alt={flat.username} className="h-10 w-10 rounded-full border border-white/10 bg-white/5" width={40} height={40} />
              <div className="min-w-0">
                <div className="truncate text-base font-bold">@{flat.username}</div>
                <div className="text-[10px] text-white/50">{ageLabel}, {wrappedLabel}</div>
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
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {badges.map((b, i) => {
                    const isTop = b.id === topBadgeId;
                    return (
                      <motion.button
                        key={b.id}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + i * 0.08 }}
                        onClick={(e) => setOpenBadge({ badge: b, rect: e.currentTarget.getBoundingClientRect() })}
                        aria-haspopup="dialog"
                        aria-label={`${b.label} badge — show what it means`}
                        className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-left transition-all"
                        style={{
                          background: `${b.color}10`,
                          border: `1px solid ${b.color}${isTop ? "55" : "28"}`,
                          boxShadow: isTop ? `0 0 18px ${b.color}44, inset 0 0 12px ${b.color}18` : undefined,
                          cursor: "pointer",
                        }}>
                        <span style={{ color: b.color, filter: `drop-shadow(0 0 5px ${b.color}88)` }}>
                          <Glyph name={b.icon as GlyphName} size={22} />
                        </span>
                        <div className="text-center text-[9.5px] font-semibold leading-tight"
                          style={{ color: isTop ? b.color : "rgba(255,255,255,0.72)" }}>
                          {b.label}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
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
            <div className="relative mt-3 text-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                Your vibe
              </motion.div>
              {/* climactic reveal of the archetype — lands last, with a light burst behind */}
              <div className="relative mt-1 flex items-center justify-center">
                <motion.div
                  className="pointer-events-none absolute inset-0 mx-auto h-full w-2/3 rounded-full"
                  style={{ background: "radial-gradient(ellipse at center, rgba(192,132,252,0.55), rgba(34,211,238,0.25) 45%, transparent 72%)", filter: "blur(14px)" }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.6, 2.1] }}
                  transition={{ delay: 1.35, duration: 1.1, ease: "easeOut" }} />
                <motion.div className="relative text-2xl font-black"
                  style={{ background: "linear-gradient(90deg,#facc15,#ff3ea5,#a855f7,#22d3ee)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "arc7b 5s linear infinite", letterSpacing: "0.02em" }}
                  initial={{ opacity: 0, scale: 0.7, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ delay: 1.45, type: "spring", stiffness: 200, damping: 14 }}>
                  {archetypeDisplay}
                </motion.div>
              </div>
            </div>
          </SlideCard>

          {/* mobile: animated disco scene below the card (scroll to reveal) */}
          <div className="hidden">
            <DiscoBall />
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative -mt-2 w-[min(320px,82vw)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/two-cats-surprised.png" alt="Cat astronauts celebrating" className="block w-full select-none"
                style={{ filter: "drop-shadow(0 18px 40px rgba(168,85,247,0.5))" }} draggable={false} />
              <RocketTailNodes scale={1.3} nodes={SLIDE7_TAIL_NODES} />
            </motion.div>
            <DanceFloor sparse={sparse} />
          </div>
        </motion.div>

        {/* RIGHT — party planet with pulsing rays */}
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="pointer-events-none absolute right-[-10px] top-[28%] hidden overflow-visible lg:block">
          <PlanetStage className="!h-auto !w-auto !pt-0">
          <div className="relative h-[460px] w-[460px]">
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
    <BadgePopover
      badge={openBadge?.badge ?? null}
      anchor={openBadge?.rect ?? null}
      onClose={() => setOpenBadge(null)}
    />
    </>
  );
}
