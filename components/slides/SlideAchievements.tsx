"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat, formatGitHubAge, formatWrappedLabel } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, RocketTailNodes, SLIDE6_TAIL_NODES } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { Glyph, type GlyphName } from "@/components/wrapped/TrophyIcons";
import { SlideCard } from "@/components/wrapped/SlideCard";
import { BadgePopover, type PopoverBadge } from "@/components/wrapped/BadgePopover";

const ACCENT = "#e879f9";

const RARITY_HEX: Record<string, string> = {
  legendary: "#fbbf24", epic: "#38bdf8", rare: "#a78bfa", uncommon: "#34d399", common: "#9aa4b2",
};

function CountUp({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span className={className}>{rounded}</motion.span>;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20"
      fill={filled ? "#fcd34d" : "rgba(255,255,255,0.05)"}
      stroke={filled ? "#fcd34d" : "rgba(255,255,255,0.15)"} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div key={i} initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.6 + i * 0.08, type: "spring", stiffness: 220, damping: 14 }}>
          <StarIcon filled={i <= count} />
        </motion.div>
      ))}
    </div>
  );
}

export default function SlideAchievements({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const ageLabel = formatGitHubAge(profile.metrics.githubAge);
  const wrappedLabel = formatWrappedLabel(profile.period.type);
  const unlocked = flat.achievementsUnlocked;
  const [openBadge, setOpenBadge] = useState<{ badge: PopoverBadge; rect: DOMRect } | null>(null);
  const locked = flat.achievementsLocked;
  const hasUnlocked = unlocked.length > 0;
  const topTrophies = unlocked.slice(0, 5);
  const rarityCounts = (["legendary", "epic", "rare", "uncommon", "common"] as const)
    .map((r) => ({ rarity: r, n: unlocked.filter((t) => t.rarity === r).length }))
    .filter((x) => x.n > 0);
  const collectorLevel = [1, 3, 6, 10, 16].filter((t) => unlocked.length >= t).length;
  const avatarUrl = (seed: string) => `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

  return (
    <>
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[600px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[700px] rounded-full bg-purple-700/15 blur-[160px]" />
      <Stars />
      <ChapterHeadingAnchor n={6} title="Trophy Haul" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 items-start gap-8 px-4 pb-10 pt-12 lg:items-center lg:px-8 lg:py-8 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT — cats & rockets crew */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative hidden h-full items-center justify-center lg:flex">
          <motion.div animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <motion.div className="relative" animate={{ rotate: [-1, 1, -1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/3.png" alt="Cat astronauts reunited in cardboard rocket and crew rocket"
                width={440} height={440}
                className="block h-auto w-[440px] max-w-full select-none drop-shadow-[0_30px_60px_rgba(168,85,247,0.25)]"
                draggable={false} />
              <RocketTailNodes scale={2.0} nodes={SLIDE6_TAIL_NODES} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* CENTER — glass card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative w-full max-w-[380px] justify-self-center">
          <div className="lg:hidden">
            <ChapterHeadingMobile n={6} title="Trophy Haul" />
          </div>
          <SlideCard accentColor={ACCENT}>
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="text-[20px] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
                <span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>G</span>rind<span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>IT</span>
              </span>
            </div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flat.avatarUrl || avatarUrl(flat.username)} alt={`@${flat.username}`} className="size-10 rounded-full border border-white/10 bg-white/5" width={40} height={40} />
              <div className="min-w-0">
                <div className="truncate text-base font-bold">@{flat.username}</div>
                <div className="text-[10px] text-white/50">{ageLabel}, {wrappedLabel}</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80">
              <span className="size-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.9)]" />
              Trophy haul
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 18 }} className="mt-3 flex items-baseline gap-2">
              <CountUp value={unlocked.length} className="bg-gradient-to-br from-purple-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent" />
              <span className="text-[13px] text-white/55">of {flat.achievementsTotal} trophies</span>
            </motion.div>

            {rarityCounts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="mt-2 flex flex-wrap gap-1.5">
                {rarityCounts.map((rc) => (
                  <span key={rc.rarity} className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{ color: RARITY_HEX[rc.rarity], border: `1px solid ${RARITY_HEX[rc.rarity]}55`, background: `${RARITY_HEX[rc.rarity]}14` }}>
                    {rc.n} {rc.rarity}
                  </span>
                ))}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="mt-3">
              {hasUnlocked ? (
                <div className="flex flex-col gap-2">
                  {topTrophies.map((t, i) => (
                    <motion.button key={t.label} type="button" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.06 }}
                      onClick={(e) => setOpenBadge({ badge: { id: t.label, label: t.label, icon: t.icon, color: t.color, explanation: t.reason }, rect: e.currentTarget.getBoundingClientRect() })}
                      aria-haspopup="dialog"
                      aria-label={`${t.label} trophy — show details`}
                      className="flex items-center gap-3 rounded-xl border px-3 py-1.5 text-left transition-transform duration-150 hover:scale-[1.02] cursor-pointer"
                      style={{ borderColor: `${t.color}40`, background: `${t.color}10` }}>
                      <span style={{ color: t.color, filter: `drop-shadow(0 0 6px ${t.color}88)` }}>
                        <Glyph name={t.icon as GlyphName} size={26} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-white">{t.label}</span>
                          <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider" style={{ color: t.color, border: `1px solid ${t.color}55` }}>{t.rarity}</span>
                        </div>
                        <div className="truncate text-[11px] text-white/55">{t.reason}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-1.5 text-[10px] uppercase tracking-wider text-white/40">Closest to unlock</div>
                  <div className="flex flex-col gap-2">
                    {locked.slice(0, 4).map((t) => (
                      <div key={t.label} className="flex items-center gap-3 rounded-xl border bg-white/[0.03] px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                        <span className="text-white/35"><Glyph name={t.icon as GlyphName} size={24} /></span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white/80">{t.label}</div>
                          <div className="truncate text-[11px] text-white/45">{t.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/60">Collector level</span>
              <StarRating count={collectorLevel} />
            </motion.div>
          </SlideCard>

          {/* mobile: animated scene below the card (scroll to reveal) */}
          <div className="hidden">
            <motion.div className="relative w-[min(300px,80vw)]"
              animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/3.png" alt="Cat astronauts crew"
                width={300} height={300} className="block w-full select-none drop-shadow-[0_20px_50px_rgba(168,85,247,0.25)]"
                draggable={false} />
              <RocketTailNodes scale={1.4} nodes={SLIDE6_TAIL_NODES} />
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT — yarn planet */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative hidden h-full items-center justify-center overflow-hidden lg:flex">
          <PlanetStage className="lg:translate-x-8">
          <div className="relative h-[560px] w-[560px]">
            <motion.img src="/wrapped/yarn-planet.png" alt="Yarn ball planet"
              animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="h-full w-full select-none object-contain drop-shadow-[0_20px_60px_rgba(236,72,153,0.08)]" />
          </div>
          </PlanetStage>
        </motion.div>
      </div>

      <style>{`main .bg-gradient-to-br.text-transparent { font-size: 44px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; }`}</style>
    </main>
    <BadgePopover
      badge={openBadge?.badge ?? null}
      anchor={openBadge?.rect ?? null}
      onClose={() => setOpenBadge(null)}
    />
    </>
  );
}
