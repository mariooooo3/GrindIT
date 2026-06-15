"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";

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
      <div className="absolute h-[440px] w-[440px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,200,60,0.35), rgba(255,140,0,0.1) 45%, transparent 70%)", filter: "blur(20px)" }} />
      <motion.div className="relative h-[360px] w-[360px] rounded-full overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(255,180,30,0.5), inset -30px -40px 80px rgba(0,0,0,0.6), inset 30px 30px 60px rgba(255,220,120,0.3)", background: "radial-gradient(circle at 35% 30%, #ffe27a, #ff9a1f 35%, #c25a0a 70%, #4a1d05 100%)" }}
        animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 380 380" className="absolute inset-0 h-full w-full opacity-80">
          <defs>
            <radialGradient id="sw5" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff5c8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx="190" cy={40 + i * 40} rx={170 - Math.abs(4 - i) * 12} ry={6 + (i % 3) * 2}
              fill="none" stroke="rgba(255,220,140,0.35)" strokeWidth={1.5 + (i % 2)} />
          ))}
          <g fill="#1a0d04" opacity="0.75">
            <rect x="120" y="150" width="6" height="30" /><rect x="116" y="146" width="14" height="6" />
            <rect x="240" y="180" width="6" height="36" /><rect x="236" y="176" width="14" height="6" />
            <rect x="180" y="220" width="6" height="26" /><rect x="176" y="216" width="14" height="6" />
          </g>
          <ellipse cx="140" cy="120" rx="50" ry="10" fill="url(#sw5)" />
          <ellipse cx="240" cy="260" rx="60" ry="12" fill="url(#sw5)" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Heatmap({ values, hotMonth }: { values: number[]; hotMonth: string }) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1">
      {values.map((v, i) => {
        const intensity = v / max;
        const isHot = months[i] === hotMonth[0] && hotMonth.length > 0;
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

export default function SlideJourney({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const heatmap = flat.commitsByMonth;
  const linesAdded = flat.linesAdded;
  const linesDeleted = flat.linesDeleted;
  const addedPct = linesAdded + linesDeleted > 0 ? Math.max(8, Math.min(100, (linesAdded / (linesAdded + linesDeleted)) * 100)) : 50;
  const net = linesAdded - linesDeleted;

  return (
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ background: "#080612" }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,180,30,0.10), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(255,120,0,0.12), transparent 55%)" }} />
      <Stars />
      <ChapterHeadingAnchor n={5} title="Refuel Stop" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 items-center gap-6 px-8 py-12 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT — gas station cat */}
        <div className="hidden h-[80vh] lg:block">
          <GasStationCat />
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center">
          <motion.div data-share-card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
            className="relative [&::-webkit-scrollbar]:hidden"
            style={{ width: 380, height: 500, overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, padding: 16, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
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
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">Energy consumed</span>
            </div>
            <div className="mt-3">
              <style>{`.s5h span { font-size: 44px; font-weight: 900; line-height: 1; letter-spacing: -0.03em; }`}</style>
              <div className="s5h">
                <CountUp value={linesAdded} className="block bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent tabular-nums" />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/40">Lines added</div>
              <div className="mt-1 text-sm font-semibold text-red-400 tabular-nums">
                − {linesDeleted.toLocaleString()} <span className="text-[10px] font-normal text-white/40">lines deleted</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-white/40">
                <span>Net +{net.toLocaleString()}</span>
                <span>{Math.round(addedPct)}% added</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-red-500/30">
                <motion.div initial={{ width: 0 }} animate={{ width: `${addedPct}%` }} transition={{ delay: 1, duration: 1.6, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#34d399,#10b981)", boxShadow: "0 0 12px rgba(16,185,129,0.6)" }} />
              </div>
            </div>
            <div className="mt-3 flex items-stretch rounded-xl border border-white/5 bg-white/[0.02] py-3">
              {[
                { label: "Files", value: flat.filesChanged.toLocaleString() },
                { label: "Commits", value: flat.totalCommits.toLocaleString() },
                { label: "Peak hr", value: `${flat.peakHour}:00` },
              ].map((s, i) => (
                <div key={s.label} className="flex flex-1 flex-col items-center justify-center px-2 text-center" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : undefined }}>
                  <div className="text-base font-bold text-white tabular-nums">{s.value}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/50">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-yellow-200/70">Most productive</span>
                <span className="text-sm font-bold text-yellow-200">{flat.mostActiveMonth}</span>
              </div>
              <div className="mt-2">
                <Heatmap values={heatmap} hotMonth={flat.mostActiveMonth} />
              </div>
            </div>
          </motion.div>
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
