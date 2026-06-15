"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, SlideShell } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";

// ── Moon ───────────────────────────────────────────────────────────────────
function Moon() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="absolute h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 65%)",
          filter: "blur(10px)",
        }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="relative h-[360px] w-[360px] overflow-hidden rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, #d6d3d1 0%, #a8a29e 35%, #57534e 75%, #292524 100%)",
          boxShadow:
            "inset -40px -40px 80px rgba(0,0,0,0.7), inset 30px 30px 60px rgba(255,255,255,0.08), 0 0 100px rgba(139,92,246,0.4)",
        }}
      >
        {[
          { top: 20, left: 30, size: 50 },
          { top: 55, left: 20, size: 35 },
          { top: 65, left: 60, size: 45 },
          { top: 30, left: 65, size: 28 },
          { top: 45, left: 45, size: 22 },
          { top: 15, left: 70, size: 18 },
          { top: 75, left: 40, size: 30 },
          { top: 40, left: 15, size: 16 },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              background:
                "radial-gradient(circle at 35% 35%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 100%)",
              boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ── ProfileCard ─────────────────────────────────────────────────────────────
type Flat = {
  username: string;
  avatarUrl: string;
  bio?: string;
  totalCommits: number;
  languages: { name: string; percent: number; color: string }[];
  currentStreak: number;
  longestStreak: number;
  topRepos: { name: string; commits: number }[];
  prsOpened: number;
  prsMerged: number;
};

function Counter({ to, duration = 2 }: { to: number; duration?: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.floor(v).toLocaleString());
  const [val, setVal] = useState("0");
  useEffect(() => {
    const u = rounded.on("change", (v) => setVal(v));
    const ctrl = animate(mv, to, { duration, ease: "easeOut" });
    return () => {
      u();
      ctrl.stop();
    };
  }, [to, duration, mv, rounded]);
  return <span>{val}</span>;
}

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function StatBox({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/10 px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div
        className="text-xl font-bold tabular-nums"
        style={{ color: accent, textShadow: `0 0 12px ${accent}80` }}
      >
        {value}
      </div>
    </div>
  );
}

function ProfileCard({ flat }: { flat: Flat }) {
  const maxRepo = Math.max(...flat.topRepos.map((r) => r.commits), 1);
  return (
    <motion.div
      data-share-card
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
      className="relative mt-0 w-full max-w-[380px] rounded-3xl border border-white/10 p-4 text-white h-[min(580px,84vh)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:-translate-y-6"
      style={{
        background: "linear-gradient(160deg,rgba(30,20,60,0.55),rgba(10,8,25,0.65))",
        backdropFilter: "blur(24px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <motion.div variants={cardItem} className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flat.avatarUrl}
          alt={flat.username}
          className="h-10 w-10 rounded-full border-2 border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        />
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300/70">Commander</div>
          <div className="text-base font-bold">@{flat.username}</div>
        </div>
      </motion.div>
      {flat.bio && (
        <motion.p variants={cardItem} className="mt-3 text-sm leading-relaxed text-white/60">
          {flat.bio}
        </motion.p>
      )}
      <motion.div variants={cardItem} className="mt-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Total commits</div>
        <div
          className="text-4xl font-black tracking-tight"
          style={{
            background: "linear-gradient(90deg,#c4b5fd,#a78bfa,#818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 18px rgba(139,92,246,0.5))",
          }}
        >
          <Counter to={flat.totalCommits} />
        </div>
      </motion.div>
      <motion.div variants={cardItem} className="mt-2">
        <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/40">Top languages</div>
        <div className="space-y-1">
          {flat.languages.slice(0, 3).map((l, i) => (
            <div key={l.name}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-white/80">{l.name}</span>
                <span className="text-white/40">{l.percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${l.percent}%` }}
                  transition={{ duration: 1.2, delay: 1 + i * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg,${l.color},${l.color}cc)`,
                    boxShadow: `0 0 10px ${l.color}80`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={cardItem} className="mt-2 grid grid-cols-2 gap-2">
        <StatBox label="Current streak" value={`${flat.currentStreak}d`} accent="#f97316" />
        <StatBox label="Longest streak" value={`${flat.longestStreak}d`} accent="#a78bfa" />
      </motion.div>
      <motion.div variants={cardItem} className="mt-2">
        <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/40">Top repositories</div>
        <div className="space-y-1">
          {flat.topRepos.slice(0, 3).map((r, i) => (
            <div key={r.name} className="flex items-center gap-3 text-xs">
              <span className="w-28 truncate text-white/80">{r.name}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.commits / maxRepo) * 100}%` }}
                  transition={{ duration: 1, delay: 1.4 + i * 0.08 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                />
              </div>
              <span className="w-10 text-right tabular-nums text-white/50">{r.commits}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={cardItem} className="mt-2 grid grid-cols-2 gap-2">
        <StatBox label="PRs opened" value={flat.prsOpened} accent="#22d3ee" />
        <StatBox label="PRs merged" value={flat.prsMerged} accent="#4ade80" />
      </motion.div>
    </motion.div>
  );
}

// ── Slide ──────────────────────────────────────────────────────────────────
export default function SlideIntro({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const cardFlat: Flat = {
    username: flat.username,
    avatarUrl: flat.avatarUrl,
    bio: flat.bio,
    totalCommits: flat.totalCommits,
    languages: flat.topLanguages.map((l) => ({ name: l.name, percent: l.percentage, color: l.color })),
    currentStreak: flat.currentStreak,
    longestStreak: flat.longestStreak,
    topRepos: flat.topRepos,
    prsOpened: flat.pullRequests.opened,
    prsMerged: flat.pullRequests.merged,
  };

  return (
    <SlideShell
      overlay={<ChapterHeadingAnchor n={1} title="Liftoff" />}
      center={<ProfileCard flat={cardFlat} />}
      right={
        <>
          <PlanetStage className="lg:-translate-x-8">
            <Moon />
          </PlanetStage>
        </>
      }
    />
  );
}
