"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, MobilePlanet } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { SlideCard } from "@/components/wrapped/SlideCard";

const ACCENT = "#fbbf24";

function GasStationCat() {
  return (
    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 1.1, ease: "easeOut" }}
      className="relative h-full w-full">
      <motion.div className="absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <div className="relative h-full w-full max-h-[80vh]">
        <svg viewBox="0 0 400 500" className="h-full w-full">
          <defs>
            <radialGradient id="ng5" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd84d" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffd84d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pg5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a2a18" />
              <stop offset="1" stopColor="#1a1208" />
            </linearGradient>
            <linearGradient id="bg5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c98a4b" />
              <stop offset="1" stopColor="#7a4d22" />
            </linearGradient>
            <linearGradient id="hg5" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffb627" />
              <stop offset="1" stopColor="#ff7a00" />
            </linearGradient>
          </defs>
          <circle cx="280" cy="120" r="120" fill="url(#ng5)" />
          <g>
            <rect x="230" y="60" width="140" height="50" rx="8" fill="#1b1325" stroke="#ffd84d" strokeWidth="2" />
            <text x="300" y="92" textAnchor="middle" fontFamily="monospace" fontSize="20" fill="#ffd84d" style={{ filter: "drop-shadow(0 0 6px #ffd84d)" }}>FUEL</text>
            <g fill="#1c2d55" stroke="#3b6bd6" strokeWidth="1">
              <rect x="180" y="70" width="40" height="30" />
              <line x1="200" y1="70" x2="200" y2="100" />
              <line x1="180" y1="85" x2="220" y2="85" />
              <rect x="380" y="70" width="40" height="30" />
              <line x1="400" y1="70" x2="400" y2="100" />
              <line x1="380" y1="85" x2="420" y2="85" />
            </g>
            <rect x="260" y="120" width="80" height="140" rx="6" fill="url(#pg5)" stroke="#ffd84d" strokeOpacity="0.4" />
            <rect x="272" y="135" width="56" height="40" rx="3" fill="#0a0710" stroke="#ffd84d" strokeOpacity="0.6" />
            <motion.rect x="276" y="155" height="14" rx="2" fill="#ffd84d"
              initial={{ width: 6 }}
              animate={{ width: [6, 48, 6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <rect x="240" y="260" width="120" height="14" rx="3" fill="#2a1d10" />
          </g>
          <motion.path d="M 260 180 Q 180 240 140 320 Q 110 360 130 380"
            stroke="url(#hg5)" strokeWidth="8" fill="none" strokeLinecap="round"
            animate={{ filter: ["drop-shadow(0 0 2px #ffb627)", "drop-shadow(0 0 14px #ffb627)", "drop-shadow(0 0 2px #ffb627)"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
        </svg>
        {/* PNG cat rocket overlaid at SVG rocket position */}
        <div className="pointer-events-none absolute" style={{ left: "8%", top: "60%", width: "42%", aspectRatio: "1" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cat-rocket.png" alt="" className="h-full w-full select-none object-contain"
            style={{ filter: "drop-shadow(0 0 16px rgba(255,180,30,0.8))" }}
            draggable={false} />
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 2.4, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span className={className}>{rounded}</motion.span>;
}

function GasPlanet() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
      className="relative flex h-full w-full items-center justify-center">
      <div className="absolute h-[460px] w-[460px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,200,60,0.35), rgba(255,140,0,0.1) 45%, transparent 70%)", filter: "blur(20px)" }} />

      <motion.div className="relative h-[360px] w-[360px] rounded-full overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(255,180,30,0.5), inset -30px -40px 80px rgba(0,0,0,0.6), inset 30px 30px 60px rgba(255,220,120,0.3)", background: "radial-gradient(circle at 35% 30%, #ffe27a, #ff9a1f 35%, #c25a0a 70%, #4a1d05 100%)" }}
        animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 380 380" className="absolute inset-0 h-full w-full opacity-85">
          <defs>
            <radialGradient id="sw5" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff5c8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <filter id="band-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* filled colour bands for an actual gas-giant banded look */}
          <g filter="url(#band-blur)" opacity="0.55">
            <rect x="0" y="10" width="380" height="26" fill="#fff3c4" />
            <rect x="0" y="55" width="380" height="18" fill="#c9590f" />
            <rect x="0" y="95" width="380" height="34" fill="#ffce7a" />
            <rect x="0" y="150" width="380" height="22" fill="#a8430c" />
            <rect x="0" y="195" width="380" height="30" fill="#ffdf9e" />
            <rect x="0" y="250" width="380" height="20" fill="#b84e10" />
            <rect x="0" y="290" width="380" height="28" fill="#ffe9b8" />
            <rect x="0" y="335" width="380" height="20" fill="#8f3a0c" />
          </g>

          {/* flowing band contours */}
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx="190" cy={40 + i * 40} rx={170 - Math.abs(4 - i) * 12} ry={6 + (i % 3) * 2}
              fill="none" stroke="rgba(255,220,140,0.35)" strokeWidth={1.5 + (i % 2)} />
          ))}

          <ellipse cx="140" cy="120" rx="50" ry="10" fill="url(#sw5)" />
          <ellipse cx="240" cy="260" rx="60" ry="12" fill="url(#sw5)" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Heatmap({ values, hotMonth }: { values: number[]; hotMonth: string }) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const fullMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1">
      {values.map((v, i) => {
        const intensity = v / max;
        const isHot = hotMonth.length > 0 && fullMonths[i] === hotMonth;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <motion.div initial={{ height: 2, opacity: 0.3 }} animate={{ height: 4 + intensity * 22, opacity: 0.4 + intensity * 0.6 }}
              transition={{ delay: 1.2 + i * 0.04, duration: 0.6 }} className="w-full rounded-sm"
              style={{ background: isHot ? "linear-gradient(180deg,#ffd84d,#ff9a1f)" : `rgba(255,200,80,${0.15 + intensity * 0.45})`, boxShadow: isHot ? "0 0 10px rgba(255,180,30,0.6)" : "none" }} />
            <span className="text-[8px] text-white/40">{months[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

const DAY_KEYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parts = dateStr.split("-");
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return `${months[m - 1]} ${d}`;
}

export default function SlideJourney({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const heatmap = flat.commitsByMonth;
  const loc = flat.totalLinesOfCode;
  const trendLabel = flat.growth.trend === "up" ? `▲ +${flat.growth.deltaPercent}%` : flat.growth.trend === "down" ? `▼ ${flat.growth.deltaPercent}%` : "▬ steady";
  const dayMax = Math.max(...DAY_KEYS.map(d => flat.commitsByWeekday[d] ?? 0), 1);
  const peakDay = DAY_KEYS.reduce((a, b) => (flat.commitsByWeekday[a] ?? 0) >= (flat.commitsByWeekday[b] ?? 0) ? a : b);

  return (
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ background: "#080612" }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,180,30,0.10), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(255,120,0,0.12), transparent 55%)" }} />
      <Stars />
      <ChapterHeadingAnchor n={5} title="Refuel Stop" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 items-start gap-6 px-4 pb-10 pt-16 lg:items-center lg:px-8 lg:py-12 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT — gas station cat */}
        <div className="hidden h-[80vh] lg:block">
          <GasStationCat />
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[min(380px,92vw)] lg:hidden">
            <ChapterHeadingMobile n={5} title="Refuel Stop" />
            <MobilePlanet color="#ffb627" />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
            className="w-[min(380px,92vw)]">
            <SlideCard accentColor={ACCENT} chapter={5} title="Refuel Stop" className="text-white">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flat.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(flat.username)}`}
                alt={flat.username} className="h-10 w-10 rounded-full border border-white/10 bg-white/5" width={40} height={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-bold text-white">@{flat.username}</div>
                <div className="text-[10px] text-white/50">{flat.period.label}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-300" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">Coding rhythm</span>
            </div>
            <div className="mt-3">
              <style>{`.s5h span { font-size: 44px; font-weight: 900; line-height: 1; letter-spacing: -0.03em; }`}</style>
              <div className="s5h">
                <CountUp value={loc > 0 ? loc : flat.totalCommits} className="block bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent tabular-nums" />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/40">{loc > 0 ? "lines of code · all repos" : "commits"}</div>
              <div className="mt-1 text-sm font-semibold tabular-nums" style={{ color: flat.growth.trend === "down" ? "#f87171" : "#34d399" }}>
                {trendLabel} <span className="text-[10px] font-normal text-white/40">vs first half</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex items-baseline justify-between text-[11px]">
                <span className="uppercase tracking-wider text-white/45">Active hours</span>
                <span className="font-semibold text-yellow-200">Peak {flat.peakHourLabel}</span>
              </div>
              <div className="flex h-10 items-end gap-[2px]">
                {flat.hourDistribution.map((v, h) => {
                  const max = Math.max(...flat.hourDistribution, 1);
                  const isPeak = h === flat.peakHour;
                  return (
                    <motion.div key={h} initial={{ height: 0 }} animate={{ height: `${Math.max(6, (v / max) * 100)}%` }}
                      transition={{ delay: 0.8 + h * 0.015, duration: 0.5 }}
                      className="flex-1 rounded-sm"
                      style={{ background: isPeak ? "linear-gradient(180deg,#ffd84d,#ff9a1f)" : "rgba(255,200,80,0.22)", boxShadow: isPeak ? "0 0 8px rgba(255,180,30,0.6)" : "none" }} />
                  );
                })}
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex items-baseline justify-between text-[11px]">
                <span className="uppercase tracking-wider text-white/45">By day of week</span>
                <span className="text-yellow-200/70">{peakDay} is peak</span>
              </div>
              <div className="flex h-10 items-end gap-[3px]">
                {DAY_KEYS.map((day) => {
                  const v = flat.commitsByWeekday[day] ?? 0;
                  const isPeak = day === peakDay;
                  const isWeekend = day === "Sat" || day === "Sun";
                  return (
                    <div key={day} className="flex flex-1 flex-col items-center gap-0.5">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(8, (v / dayMax) * 100)}%` }}
                        transition={{ delay: 0.9 + DAY_KEYS.indexOf(day) * 0.04, duration: 0.5 }}
                        className="w-full rounded-sm"
                        style={{ background: isPeak ? "linear-gradient(180deg,#ffd84d,#ff9a1f)" : isWeekend ? "rgba(255,200,80,0.35)" : "rgba(255,200,80,0.20)", boxShadow: isPeak ? "0 0 6px rgba(255,180,30,0.5)" : "none" }} />
                      <span className="text-[7px] text-white/35">{day[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 flex items-stretch rounded-xl border border-white/5 bg-white/[0.02] py-3">
              {[
                { label: "Streak", value: `${flat.longestStreak}d` },
                { label: "Active days", value: flat.activeDayCount.toLocaleString() },
                { label: "Most active", value: flat.mostActiveDayOfWeek.slice(0, 3) },
              ].map((s, i) => (
                <div key={s.label} className="flex flex-1 flex-col items-center justify-center px-2 text-center" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : undefined }}>
                  <div className="text-base font-bold tabular-nums text-white">{s.value}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/50">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-yellow-200/70">Most productive</span>
                <span className="text-sm font-bold text-yellow-200">{flat.mostActiveMonth || "—"}</span>
              </div>
              <div className="mt-2">
                <Heatmap values={heatmap} hotMonth={flat.mostActiveMonth} />
              </div>
              {flat.mostProductiveDay.date && flat.mostProductiveDay.commits > 0 && (
                <div className="mt-2 flex items-center justify-between border-t border-yellow-400/10 pt-2">
                  <span className="text-[10px] text-yellow-200/50">Best day</span>
                  <span className="text-xs font-semibold text-yellow-200">
                    {formatShortDate(flat.mostProductiveDay.date)} · {flat.mostProductiveDay.commits} commits
                  </span>
                </div>
              )}
            </div>
            </SlideCard>
          </motion.div>

          {/* mobile: animated scene below the card (scroll to reveal) */}
          <div className="mt-6 h-[380px] w-[min(380px,92vw)] lg:hidden">
            <GasStationCat />
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative hidden lg:block">
          <PlanetStage>
            <GasPlanet />
          </PlanetStage>
        </div>
      </div>
    </main>
  );
}
