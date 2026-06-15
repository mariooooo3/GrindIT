"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";
import { Glyph, type GlyphName } from "@/components/wrapped/TrophyIcons";

const RARITY_HEX: Record<string, string> = {
  legendary: "#fbbf24", rare: "#a78bfa", uncommon: "#34d399", common: "#9aa4b2",
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
  const unlocked = flat.achievementsUnlocked;
  const locked = flat.achievementsLocked;
  const hasUnlocked = unlocked.length > 0;
  const topTrophies = unlocked.slice(0, 5);
  const rarityCounts = (["legendary", "rare", "uncommon", "common"] as const)
    .map((r) => ({ rarity: r, n: unlocked.filter((t) => t.rarity === r).length }))
    .filter((x) => x.n > 0);
  const collectorLevel = [1, 3, 6, 10, 16].filter((t) => unlocked.length >= t).length;
  const avatarUrl = (seed: string) => `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

  return (
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[600px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[700px] rounded-full bg-purple-700/15 blur-[160px]" />
      <Stars />
      <ChapterHeadingAnchor n={6} title="Trophy Haul" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 items-center gap-8 px-8 py-8 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT — cats & rockets crew */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative flex h-full items-center justify-center">
          <motion.div animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <motion.div animate={{ rotate: [-1, 1, -1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wrapped/cats-rockets.png" alt="Cat astronauts reunited in cardboard rocket and crew rocket"
                width={440} height={440}
                className="h-auto w-[440px] max-w-full select-none drop-shadow-[0_30px_60px_rgba(168,85,247,0.25)]"
                draggable={false} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* CENTER — glass card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative w-[400px] max-w-full justify-self-center lg:-translate-y-6">
          <div data-share-card className="relative [&::-webkit-scrollbar]:hidden" style={{ height: 564, overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, padding: 16, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.5)" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flat.avatarUrl || avatarUrl(flat.username)} alt={`@${flat.username}`} className="size-10 rounded-full border border-white/10 bg-white/5" width={40} height={40} />
              <div className="min-w-0">
                <div className="truncate text-base font-bold">@{flat.username}</div>
                <div className="text-[10px] text-white/50">{flat.period.label} · Cat Crew</div>
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
                    <motion.div key={t.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.08 }}
                      className="flex items-center gap-3 rounded-xl border px-3 py-2"
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
                    </motion.div>
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
          </div>
        </motion.div>

        {/* RIGHT — yarn planet */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative flex h-full items-center justify-center overflow-hidden">
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
  );
}
