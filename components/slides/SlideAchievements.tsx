"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";

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
  const prsMerged = flat.pullRequests.merged;
  const prsReviewed = flat.pullRequests.reviewed;
  const reposContributed = flat.totalRepos;
  const collaborators = flat.collaborators.slice(0, 3);
  const score = Math.max(1, Math.min(5, Math.round(prsMerged > 0 ? prsMerged / Math.max(prsReviewed, 1) * 2.5 : 1)));
  const avatarUrl = (seed: string) => `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

  return (
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[600px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[700px] rounded-full bg-purple-700/15 blur-[160px]" />
      <Stars />
      <ChapterHeadingAnchor n={6} title="Trophy Haul" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 items-center gap-8 px-8 py-16 lg:grid-cols-[1fr_auto_1fr]">
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
          className="relative w-[380px] justify-self-center">
          <div data-share-card className="relative [&::-webkit-scrollbar]:hidden" style={{ height: 500, overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, padding: 16, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.5)" }}>
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
              Collaborations
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 18 }} className="mt-3">
              <CountUp value={prsMerged} className="block bg-gradient-to-br from-purple-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent" />
              <div className="mt-1 text-[13px] text-white/60">pull requests merged</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-3 flex items-baseline gap-2 text-sm">
              <CountUp value={prsReviewed} className="font-semibold text-white" />
              <span className="text-white/55">PRs reviewed for the crew</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }} className="mt-3">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-white/40">Top crewmates</div>
              <div className="flex flex-col gap-2">
                {collaborators.length > 0 ? collaborators.map((u, i) => (
                  <motion.div key={u.username} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.avatarUrl ?? avatarUrl(u.username)} alt={u.username} width={24} height={24} className="size-6 rounded-full border border-white/10" />
                    <span className="text-xs text-white/85">@{u.username}</span>
                  </motion.div>
                )) : (
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-2 text-xs text-white/40">Solo mission this year</div>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.45 }}
              className="mt-3 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/5 bg-white/[0.03]">
              {[
                { label: "repos", value: reposContributed },
                { label: "PRs merged", value: prsMerged },
                { label: "reviewed", value: prsReviewed },
              ].map((s) => (
                <div key={s.label} className="px-2 py-3 text-center">
                  <div className="text-lg font-bold text-white"><CountUp value={s.value} /></div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{s.label}</div>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55 }}
              className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/60">Team player score</span>
              <StarRating count={score} />
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
