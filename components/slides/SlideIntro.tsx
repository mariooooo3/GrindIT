"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat, formatGitHubAge, formatWrappedLabel } from "@/components/wrapped/flatProfile";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import { PlanetStage, SlideShell, MobilePlanet, Rocket } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { SlideCard } from "@/components/wrapped/SlideCard";

const ACCENT = "#8b5cf6";

// ── Moon ───────────────────────────────────────────────────────────────────
const MOON_CRATERS = [
  { top: 20, left: 30, size: 50 },
  { top: 55, left: 20, size: 35 },
  { top: 65, left: 60, size: 45 },
  { top: 30, left: 65, size: 28 },
  { top: 45, left: 45, size: 22 },
  { top: 15, left: 70, size: 18 },
  { top: 75, left: 40, size: 30 },
  { top: 40, left: 15, size: 16 },
];

const MOON_FRECKLES = [
  { top: 12, left: 48, size: 7 }, { top: 25, left: 12, size: 5 }, { top: 58, left: 78, size: 8 },
  { top: 70, left: 55, size: 6 }, { top: 38, left: 80, size: 5 }, { top: 82, left: 22, size: 6 },
  { top: 8, left: 60, size: 4 }, { top: 50, left: 32, size: 5 }, { top: 88, left: 65, size: 5 },
  { top: 33, left: 38, size: 4 }, { top: 62, left: 15, size: 6 }, { top: 18, left: 85, size: 5 },
];

function Moon() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* distant sparkle dust around the moon */}
      {[
        { top: "8%", left: "18%", size: 3 }, { top: "82%", left: "78%", size: 2 },
        { top: "15%", left: "85%", size: 2 }, { top: "78%", left: "12%", size: 3 },
        { top: "45%", left: "5%", size: 2 }, { top: "5%", left: "55%", size: 2 },
      ].map((s, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, boxShadow: "0 0 6px rgba(255,255,255,0.8)" }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}

      <div
        className="absolute h-[560px] w-[560px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.16) 40%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <div
        className="absolute h-[440px] w-[440px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.38) 0%, transparent 65%)",
          filter: "blur(10px)",
        }}
      />

      {/* thin atmospheric rim */}
      <div className="absolute h-[364px] w-[364px] rounded-full"
        style={{ boxShadow: "0 0 0 1px rgba(196,181,253,0.25), 0 0 24px 2px rgba(167,139,250,0.35)" }} />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        className="relative h-[360px] w-[360px] overflow-hidden rounded-full"
        style={{
          background: "radial-gradient(circle at 32% 28%, #e7e5e4 0%, #c8c4bf 28%, #8d8881 55%, #4f4b46 80%, #211f1c 100%)",
          boxShadow:
            "inset -50px -50px 90px rgba(0,0,0,0.75), inset 34px 30px 60px rgba(255,255,255,0.12), 0 0 110px rgba(139,92,246,0.45)",
        }}
      >
        {/* maria — large soft dark plains for surface variety */}
        <div className="absolute rounded-full" style={{ top: "8%", left: "38%", width: "46%", height: "34%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(30,28,30,0.4) 0%, transparent 75%)", filter: "blur(6px)" }} />
        <div className="absolute rounded-full" style={{ top: "52%", left: "8%", width: "38%", height: "30%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(30,28,30,0.32) 0%, transparent 75%)", filter: "blur(6px)" }} />

        {/* fine surface freckles for texture richness */}
        {MOON_FRECKLES.map((f, i) => (
          <div key={`f-${i}`} className="absolute rounded-full"
            style={{ top: `${f.top}%`, left: `${f.left}%`, width: f.size, height: f.size,
              background: "rgba(20,18,17,0.35)" }} />
        ))}

        {/* craters with real two-tone depth (highlight rim + inner shadow) */}
        {MOON_CRATERS.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              background:
                "radial-gradient(circle at 38% 38%, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.65) 100%)",
              boxShadow:
                "inset 3px 3px 5px rgba(255,255,255,0.16), inset -3px -3px 6px rgba(0,0,0,0.55), 0 1px 1px rgba(255,255,255,0.05)",
            }}
          />
        ))}

        {/* terminator — soft day/night gradient for sphere depth */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(115deg, transparent 35%, rgba(10,8,12,0.35) 70%, rgba(5,4,8,0.6) 100%)" }} />
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
  ownedRepos: number;
  prsMerged: number;
  githubAgeYears: number;
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
    <div
      className="rounded-xl px-2.5 py-2"
      style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}28` }}
    >
      <div className="text-[9px] uppercase tracking-[0.18em]" style={{ color: `${ACCENT}70` }}>
        {label}
      </div>
      <div
        className="text-xl font-bold tabular-nums"
        style={{ color: accent, textShadow: `0 0 12px ${accent}80` }}
      >
        {value}
      </div>
    </div>
  );
}

function ProfileCard({ flat, ageLabel, wrappedLabel }: { flat: Flat; ageLabel: string; wrappedLabel: string }) {
  const maxRepo = Math.max(...flat.topRepos.map((r) => r.commits), 1);
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
      className="relative mt-0 w-full max-w-[380px] text-white"
    >
      <SlideCard accentColor={ACCENT}>
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <span className="text-[20px] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>G</span>rind<span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>IT</span>
          </span>
        </div>
        <motion.div variants={cardItem} className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flat.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${flat.username}`}
            alt={flat.username}
            className="h-10 w-10 rounded-full border-2 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            style={{ borderColor: `${ACCENT}80` }}
          />
          <div>
            <div className="text-base font-bold">@{flat.username}</div>
            <div className="text-[10px] text-white/50">{ageLabel}, {wrappedLabel}</div>
          </div>
        </motion.div>

        {flat.bio && (
          <motion.p variants={cardItem} className="mt-3 text-sm leading-relaxed text-white/60">
            {flat.bio}
          </motion.p>
        )}

        <motion.div variants={cardItem} className="mt-3">
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${ACCENT}65` }}>
            Total commits
          </div>
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
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: `${ACCENT}65` }}>
            Top languages
          </div>
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
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: `${ACCENT}65` }}>
            Top repositories
          </div>
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
          <StatBox label="Repos" value={flat.ownedRepos} accent="#22d3ee" />
          <StatBox label="PRs merged" value={flat.prsMerged} accent="#4ade80" />
        </motion.div>
      </SlideCard>
    </motion.div>
  );
}

// ── cosmic transmission line carrying the personalized intro message ─────────
function TransmissionLine({ message }: { message: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!message) { queueMicrotask(() => setDisplayedText("")); return; }
    queueMicrotask(() => setDisplayedText(""));
    let tick: ReturnType<typeof setInterval> | null = null;
    // Wait for the box fade-in to finish (delay 1.1s + duration 0.7s) then start typing
    const start = setTimeout(() => {
      let i = 0;
      tick = setInterval(() => {
        i++;
        setDisplayedText(message.slice(0, i));
        if (i >= message.length) { clearInterval(tick!); tick = null; }
      }, 28);
    }, 1900);
    return () => { clearTimeout(start); if (tick) clearInterval(tick); };
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 w-full max-w-[380px]"
    >
      <div className="relative overflow-hidden rounded-2xl px-4 py-3"
        style={{
          border: `1px solid ${ACCENT}66`,
          background: `linear-gradient(160deg, rgba(24,16,46,0.94), rgba(10,7,22,0.96))`,
          boxShadow: `0 0 0 1px ${ACCENT}33, 0 0 22px ${ACCENT}55, 0 0 54px -8px ${ACCENT}4d, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}>
        <div className="flex items-center gap-1.5">
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <span className="text-[9px] font-medium uppercase tracking-[0.28em]" style={{ color: `${ACCENT}aa` }}>
            Incoming transmission
          </span>
        </div>
        <p className="mt-1.5 min-h-[2em] font-mono text-[12.5px] leading-relaxed text-zinc-200">
          {displayedText}
          <motion.span className="ml-0.5 inline-block w-[7px]" style={{ color: ACCENT }}
            animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>▋</motion.span>
        </p>
      </div>
    </motion.div>
  );
}

// ── Slide ──────────────────────────────────────────────────────────────────
export default function SlideIntro({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const ageLabel = formatGitHubAge(profile.metrics.githubAge);
  const wrappedLabel = formatWrappedLabel(profile.period.type);

  const introVibeLine = useMemo(() => {
    const nightRatio = flat.totalCommits > 0 ? flat.nightCommits / flat.totalCommits : 0;
    return profile.narrative?.introVibeLine ?? buildFallbackNarrative({
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
    }, profile.tone).introVibeLine;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat.username, profile.tone, profile.narrative?.introVibeLine]);

  const cardFlat: Flat = {
    username: flat.username,
    avatarUrl: flat.avatarUrl,
    bio: flat.bio,
    totalCommits: flat.totalCommits,
    languages: flat.topLanguages.map((l) => ({ name: l.name, percent: l.percentage, color: l.color })),
    currentStreak: flat.currentStreak,
    longestStreak: flat.longestStreak,
    topRepos: flat.topRepos,
    ownedRepos: flat.ownedRepoCount,
    prsMerged: flat.pullRequests.merged,
    githubAgeYears: flat.githubAgeYears,
  };

  return (
    <SlideShell
      overlay={<ChapterHeadingAnchor n={1} title="Liftoff" />}
      mobileHeader={
        <>
          <ChapterHeadingMobile n={1} title="Liftoff" />
          <MobilePlanet color="#cbd5e1" />
        </>
      }
      mobileFooter={
        introVibeLine ? (
          <div className="mt-3 flex justify-center px-4">
            <TransmissionLine message={introVibeLine} />
          </div>
        ) : undefined
      }
      center={<ProfileCard flat={cardFlat} ageLabel={ageLabel} wrappedLabel={wrappedLabel} />}
      right={
        <>
          <PlanetStage className="scale-[0.82] -translate-y-12 lg:-translate-x-8">
            <Moon />
          </PlanetStage>
          {introVibeLine && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-4 lg:-translate-x-8">
              <TransmissionLine message={introVibeLine} />
            </div>
          )}
        </>
      }
    />
  );
}
