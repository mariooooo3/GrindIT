"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";

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
  const pieces = useMemo(() => Array.from({ length: 60 }, () => ({
    x: Math.random() * 100, delay: Math.random() * 6, dur: Math.random() * 6 + 6, rot: Math.random() * 360,
    color: ["#ff3ea5", "#a855f7", "#22d3ee", "#facc15", "#f472b6"][Math.floor(Math.random() * 5)],
    w: Math.random() * 6 + 4, h: Math.random() * 10 + 6,
  })), []);
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

const BADGES = [
  { id: "streak", icon: "🔥", name: "Streak" },
  { id: "speed", icon: "⚡", name: "Speed" },
  { id: "night", icon: "🌙", name: "Night Owl" },
  { id: "collab", icon: "🤝", name: "Collab" },
  { id: "builder", icon: "🛠️", name: "Builder" },
  { id: "cleaner", icon: "🧹", name: "Cleaner" },
];

function deriveBadges(totalCommits: number, longestStreak: number, nightCommits: number, prsMerged: number, fixCommits: number): string[] {
  const earned: string[] = [];
  if (longestStreak >= 7) earned.push("streak");
  if (totalCommits >= 200) earned.push("speed");
  if (nightCommits > totalCommits * 0.3) earned.push("night");
  if (prsMerged >= 10) earned.push("collab");
  if (totalCommits >= 100) earned.push("builder");
  if (fixCommits > 0 || totalCommits > 50) earned.push("cleaner");
  return earned;
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
  const earnedIds = deriveBadges(flat.totalCommits, flat.longestStreak, flat.nightCommits, flat.pullRequests.merged, flat.fixCommits);
  const rarest = earnedIds.includes("night") ? "night" : earnedIds.includes("streak") ? "streak" : earnedIds[0] ?? "builder";
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

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 items-center gap-8 px-8 py-16 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT — disco ball + cats + dance floor */}
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative flex items-center justify-center">
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
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }} className="relative w-[380px] justify-self-center lg:-translate-y-10">
          <div className="relative [&::-webkit-scrollbar]:hidden" style={{ height: 500, overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, padding: 16, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.5)" }}>
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
                Achievements unlocked
              </span>
            </div>
            <div className="mt-3">
              <div className="leading-none" style={{ fontSize: 44, fontWeight: 900, background: "linear-gradient(90deg,#ff3ea5,#a855f7,#22d3ee,#facc15,#ff3ea5)", backgroundSize: "300% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "arc7 6s linear infinite", letterSpacing: "-0.03em" }}>
                <CountUpInner value={earnedIds.length} />
              </div>
              <div className="text-xs text-white/55">badges earned</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BADGES.map((b, i) => {
                const isEarned = earnedIds.includes(b.id);
                const isRare = b.id === rarest;
                return (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.08 }}
                    className="flex flex-col items-center gap-1 rounded-xl p-2"
                    style={{ background: isEarned ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)", border: isRare ? "1px solid rgba(250,204,21,0.7)" : "1px solid rgba(255,255,255,0.06)", boxShadow: isRare ? "0 0 0 1px rgba(250,204,21,0.35), 0 0 24px rgba(250,204,21,0.55), inset 0 0 18px rgba(250,204,21,0.18)" : undefined, opacity: isEarned ? 1 : 0.35 }}>
                    <div className="text-2xl">{b.icon}</div>
                    <div className="text-[10px] font-medium" style={{ color: isRare ? "#facc15" : "rgba(255,255,255,0.7)" }}>{b.name}</div>
                  </motion.div>
                );
              })}
            </div>
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
        </motion.div>

        {/* RIGHT — party planet with pulsing rays */}
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="relative flex h-full items-center justify-center overflow-hidden">
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
