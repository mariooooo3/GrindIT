"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor } from "@/components/ui/ChapterHeading";

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.8, ease: "easeOut", delay: 0.4 });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

function Bullet({ delay, ufoX }: { delay: number; ufoX: number }) {
  const [phase, setPhase] = useState<"fly" | "burst">("fly");
  const travelDur = 1.2;
  useEffect(() => {
    let burstT: ReturnType<typeof setTimeout>;
    const flyT = setTimeout(() => {
      setPhase("burst");
      burstT = setTimeout(() => setPhase("fly"), 380);
    }, (delay + travelDur) * 1000);
    return () => { clearTimeout(flyT); clearTimeout(burstT); };
  }, [delay]);

  if (phase === "burst") {
    return (
      <div className="pointer-events-none absolute"
        style={{ left: "50%", top: "26%", transform: `translate(calc(-50% + ${ufoX}px), 0)` }}>
        <motion.span className="absolute block rounded-full"
          initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20,
            background: "radial-gradient(circle, #d6ffe0 0%, #7cff8a 40%, rgba(74,222,128,0.5) 70%, transparent 100%)",
            boxShadow: "0 0 40px 12px rgba(124,255,138,0.8)" }} />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <motion.span key={i} className="absolute block rounded-full"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(a) * 38, y: Math.sin(a) * 38, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ width: 8, height: 8, marginLeft: -4, marginTop: -4, background: "#7cff8a", boxShadow: "0 0 10px #7cff8a" }} />
          );
        })}
      </div>
    );
  }

  return (
    <motion.span className="pointer-events-none absolute left-1/2 block h-3 w-3 rounded-full"
      style={{ top: "60%", background: "#7cff8a", boxShadow: "0 0 14px 4px #4ade80, 0 0 30px 8px rgba(74,222,128,0.5)" }}
      initial={{ x: "-50%", y: 0, opacity: 0, scale: 0.6 }}
      animate={{ x: `calc(-50% + ${ufoX}px)`, y: "-34vh", opacity: [0, 1, 1, 1], scale: [0.6, 1, 1, 1.1] }}
      transition={{ duration: travelDur, delay, ease: "easeOut", times: [0, 0.15, 0.85, 1] }} />
  );
}

function CommitStream({ ufoX }: { ufoX: number }) {
  const bullets = useMemo(() => Array.from({ length: 3 }, (_, i) => ({ id: i, delay: i * 1.1 })), []);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCycle((c) => c + 1), 3 * 1100 + 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0">
      {bullets.map((b) => (
        <Bullet key={`${cycle}-${b.id}`} delay={b.delay} ufoX={ufoX} />
      ))}
    </div>
  );
}

function WeekdayBars({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className="flex items-end justify-between gap-1.5 h-16">
      {entries.map(([day, v], i) => {
        const h = (v / max) * 100;
        const isTop = v === max;
        return (
          <div key={day} className="flex flex-1 flex-col items-center gap-1">
            <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }}
              transition={{ duration: 0.8, delay: 0.6 + i * 0.06, ease: "easeOut" }}
              className="w-full rounded-sm"
              style={{ background: isTop ? "linear-gradient(180deg,#7cff8a,#22d3ee)" : "rgba(255,255,255,0.18)", boxShadow: isTop ? "0 0 12px rgba(124,255,138,0.55)" : "none", minHeight: 4 }} />
            <span className="text-[9px] uppercase tracking-wider text-white/45">{day.slice(0, 1)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SlideTopRepo({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const bars = flat.commitsByWeekday;
  const mostActiveDay = Object.entries(bars).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Monday";
  const peakHourFmt = `${flat.peakHour}:00`;
  const topLangs = flat.topLanguages.map((l) => l.name);
  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  const [ufoX, setUfoX] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setUfoX(Math.sin((t * Math.PI * 2) / 6) * 90);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(74,222,128,0.25), transparent)" }} />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)" }} />
      <Stars />
      <ChapterHeadingAnchor n={4} title="Home Base" />
      <div className="relative z-10 grid min-h-screen grid-cols-12 gap-4 px-6 py-8 md:px-12">
        {/* LEFT — UFO invasion scene */}
        <div className="relative col-span-12 md:col-span-4 hidden md:block">
          <div className="relative h-full w-full">
            {/* UFO drifting left-right at top */}
            <motion.img src="/wrapped/slide4-ufo.png" alt="UFO"
              className="absolute left-1/2 top-[4%] w-[78%] -translate-x-1/2 select-none"
              style={{ x: ufoX, filter: "drop-shadow(0 20px 40px rgba(74,222,128,0.5))" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              draggable={false} />
            {/* Cat rocket at bottom, swaying opposite phase */}
            <motion.img src="/cat-rocket.png" alt="Cat astronaut"
              className="absolute bottom-[2%] left-1/2 w-[58%] -translate-x-1/2 select-none object-contain"
              animate={{ x: [-70, 70, -70] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.7))" }}
              draggable={false} />
            <CommitStream ufoX={ufoX} />
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-12 md:col-span-4 flex items-center justify-center">
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }} className="w-full" style={{ maxWidth: 380 }}>
            <div className="relative w-full p-4 text-white [&::-webkit-scrollbar]:hidden"
              style={{ height: 500, overflowY: "auto", scrollbarWidth: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(1.6)", borderRadius: 24, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 80px -20px rgba(0,0,0,0.6)" }}>
              <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flat.avatarUrl} alt={flat.username} className="h-10 w-10 rounded-full border border-white/15 bg-white/5 object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-base font-bold">@{flat.username}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">{flat.period.label}</div>
                </div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7cff8a", boxShadow: "0 0 8px #7cff8a" }} />
                  Commits fired
                </span>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="mt-2 leading-none">
                <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", background: "linear-gradient(120deg,#7cff8a 0%,#22d3ee 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  <CountUp value={flat.totalCommits} />
                </div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="mt-3">
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Most active day</div>
                  <div className="text-xs font-semibold text-white">{mostActiveDay}</div>
                </div>
                <WeekdayBars data={bars} />
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.6 }}
                className="mt-3 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Longest streak</div>
                <div className="text-sm font-bold text-white"><span style={{ color: "#7cff8a" }}>{flat.longestStreak}</span> days</div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.7 }} className="mt-3 grid grid-cols-3 divide-x text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {[
                  { l: "Commits", v: flat.totalCommits.toLocaleString() },
                  { l: "Peak hour", v: peakHourFmt },
                  { l: "Languages", v: String(topLangs.length) },
                ].map((s, i) => (
                  <div key={i} className="px-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-sm font-bold">{s.v}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{s.l}</div>
                  </div>
                ))}
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.85 }} className="mt-3 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                  style={{ background: "linear-gradient(120deg, rgba(124,255,138,0.18), rgba(34,211,238,0.18))", border: "1px solid rgba(124,255,138,0.35)", color: "#d6ffe0", boxShadow: "0 0 24px rgba(124,255,138,0.25)" }}>
                  <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Top lang</span>
                  {topLangs[0] ?? "—"}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — full round planet */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative col-span-12 md:col-span-4 hidden md:block overflow-hidden">
          <PlanetStage>
          <div className="relative flex h-[520px] w-[520px] items-center justify-center">
            <div className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(74,222,128,0.45) 0%, rgba(74,222,128,0.12) 35%, transparent 65%)", filter: "blur(30px)" }} />
            <motion.img src="/wrapped/slide4-planet.png" alt="Alien green planet"
              className="relative h-full w-full select-none object-contain"
              animate={{ y: [0, -10, 0], rotate: 360 }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 240, repeat: Infinity, ease: "linear" } }}
              style={{ filter: "drop-shadow(0 0 50px rgba(74,222,128,0.6))" }}
              draggable={false} />
          </div>
          </PlanetStage>
        </motion.div>
      </div>
    </div>
  );
}
