"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat, formatGitHubAge, formatWrappedLabel } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, RocketTailNodes } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { SlideCard } from "@/components/wrapped/SlideCard";

const ACCENT = "#34d399";

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.8, ease: "easeOut", delay: 0.4 });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

function Bullet({ delay, ufoX }: { delay: number; ufoX: MotionValue<number> }) {
  const [phase, setPhase] = useState<"fly" | "burst">("fly");
  const travelDur = 1.2;
  // Track the drifting UFO live: x follows the shared motion value (a plain
  // template string can't interpolate a MotionValue — it stringifies to junk).
  const x = useTransform(ufoX, (v) => `calc(-50% + ${v}px)`);
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
        style={{ left: "50%", top: "26%", transform: `translate(calc(-50% + ${ufoX.get()}px), 0)` }}>
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
      style={{ top: "60%", x, background: "#7cff8a", boxShadow: "0 0 14px 4px #4ade80, 0 0 30px 8px rgba(74,222,128,0.5)" }}
      initial={{ y: 0, opacity: 0, scale: 0.6 }}
      animate={{ y: "-34vh", opacity: [0, 1, 1, 1], scale: [0.6, 1, 1, 1.1] }}
      transition={{ duration: travelDur, delay, ease: "easeOut", times: [0, 0.15, 0.85, 1] }} />
  );
}

function CommitStream({ ufoX }: { ufoX: MotionValue<number> }) {
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

export default function SlideTopRepo({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const ageLabel = formatGitHubAge(profile.metrics.githubAge);
  const wrappedLabel = formatWrappedLabel(profile.period.type);
  const top = flat.topRepoCard;
  const ageStr = top && top.ageDays > 0
    ? (top.ageDays >= 365 ? `${Math.floor(top.ageDays / 365)}y` : `${Math.max(1, Math.round(top.ageDays / 30))}mo`)
    : "—";
  const starred = flat.mostStarredRepo;
  const showStarred = !!starred && starred.name !== top?.name;
  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  const ufoX = useMotionValue(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      ufoX.set(Math.sin((t * Math.PI * 2) / 6) * 90);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ufoX]);

  return (
    <div className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(74,222,128,0.25), transparent)" }} />
      <Stars />
      <ChapterHeadingAnchor n={4} title="Home Base" />
      <div className="relative z-10 grid min-h-screen grid-cols-12 gap-4 px-4 pb-10 pt-12 lg:px-12 lg:py-8">
        {/* LEFT — UFO invasion scene */}
        <div className="relative col-span-12 hidden lg:col-span-4 lg:block">
          <div className="relative h-full w-full">
            {/* UFO drifting left-right at top */}
            <motion.img src="/wrapped/slide4-ufo.png" alt="UFO"
              className="absolute left-1/2 top-[4%] w-[78%] -translate-x-1/2 select-none"
              style={{ x: ufoX, filter: "drop-shadow(0 20px 40px rgba(74,222,128,0.5))" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              draggable={false} />
            {/* Cat rocket at bottom, swaying opposite phase */}
            <motion.div
              className="absolute bottom-[2%] left-1/2 w-[58%] -translate-x-1/2"
              style={{ aspectRatio: "1" }}
              animate={{ x: [-70, 70, -70] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cat-rocket.png" alt="Cat astronaut"
                className="block h-full w-full select-none object-contain"
                style={{ filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.7))" }}
                draggable={false} />
              <RocketTailNodes scale={1.05} />
            </motion.div>
            <CommitStream ufoX={ufoX} />
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-12 flex flex-col items-center justify-center lg:col-span-4">
          <div className="w-[min(400px,92vw)] lg:hidden">
            <ChapterHeadingMobile n={4} title="Home Base" />
          </div>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }} className="w-full max-w-[380px]">
            <SlideCard accentColor={ACCENT} className="text-white">
              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <span className="text-[20px] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>G</span>rind<span style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}aa` }}>IT</span>
                </span>
              </div>
              <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flat.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${flat.username}`} alt={flat.username} className="h-10 w-10 rounded-full border border-white/15 bg-white/5 object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-base font-bold">@{flat.username}</div>
                  <div className="text-[10px] text-white/50">{ageLabel}, {wrappedLabel}</div>
                </div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7cff8a", boxShadow: "0 0 8px #7cff8a" }} />
                  Home base
                </span>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="mt-2 flex items-start justify-between gap-3">
                <div className="leading-none">
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", background: "linear-gradient(120deg,#7cff8a 0%,#22d3ee 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                    <CountUp value={flat.totalCommits} />
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45">commits fired</div>
                </div>
                {flat.pinnedRepos.length > 0 && (
                  <div className="flex flex-col items-end gap-1 pt-0.5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">Pinned</div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {flat.pinnedRepos.slice(0, 4).map(r => (
                        <span key={r} className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2 py-0.5 font-mono text-[10px] text-cyan-200 max-w-[120px] truncate">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {top ? (
                <>
                  <motion.div {...fadeUp} transition={{ delay: 0.55 }} className="mt-3">
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">Top repository</div>
                    <span className="truncate font-mono text-[20px] font-bold" style={{ background: "linear-gradient(120deg,#7cff8a,#22d3ee)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{top.name}</span>
                  </motion.div>
                  {top.description && (
                    <motion.p {...fadeUp} transition={{ delay: 0.45 }} className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/55">{top.description}</motion.p>
                  )}
                  <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { l: "Commits", v: top.commits.toLocaleString() },
                      { l: "Stars", v: top.stars.toLocaleString() },
                      { l: "Forks", v: top.forks.toLocaleString() },
                      { l: "Age", v: ageStr },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border bg-white/[0.03] px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                        <div className="text-sm font-bold tabular-nums text-white">{s.v}</div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{s.l}</div>
                      </div>
                    ))}
                  </motion.div>
                  {top.language && (
                    <motion.div {...fadeUp} transition={{ delay: 0.55 }} className="mt-2 flex items-center gap-1.5 text-[11px] text-white/60">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: flat.topLanguages.find(l => l.name === top.language)?.color ?? "#7cff8a" }} />
                      {top.language}
                    </motion.div>
                  )}
                  {top.topics.length > 0 && (
                    <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="mt-2 flex flex-wrap gap-1.5">
                      {top.topics.slice(0, 5).map(t => (<span key={t} className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2 py-0.5 text-[10px] text-emerald-200">{t}</span>))}
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/55">
                  No public repositories yet — but {flat.totalCommits.toLocaleString()} commits prove the work is happening.
                </motion.div>
              )}

              {showStarred && starred ? (
                <motion.div {...fadeUp} transition={{ delay: 0.65 }} className="mt-3 flex items-center justify-between rounded-xl border bg-white/[0.03] px-3 py-2.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-white/45">Most starred</div>
                    <div className="truncate font-mono text-sm text-white/85">{starred.name}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-300">★ {starred.stars.toLocaleString()}</div>
                </motion.div>
              ) : flat.graveyardRepo ? (
                <motion.div {...fadeUp} transition={{ delay: 0.65 }} className="mt-3 flex items-center justify-between rounded-xl border bg-white/[0.03] px-3 py-2.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-white/45">Abandoned in {flat.graveyardRepo.year}</div>
                    <div className="truncate font-mono text-sm text-white/60 line-through">{flat.graveyardRepo.name}</div>
                  </div>
                  <div className="text-xs text-white/30">RIP</div>
                </motion.div>
              ) : null}

              <motion.div {...fadeUp} transition={{ delay: 0.75 }} className="mt-3 grid grid-cols-3 divide-x text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {[
                  { l: "Repos", v: (flat.ownedRepoCount || flat.totalRepos).toLocaleString() },
                  { l: "Languages", v: String(flat.languageCount) },
                  { l: "Pinned", v: String(flat.pinnedRepos.length) },
                ].map((s) => (
                  <div key={s.l} className="px-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-sm font-bold">{s.v}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{s.l}</div>
                  </div>
                ))}
              </motion.div>


            </SlideCard>
          </motion.div>

          {/* mobile: animated UFO scene below the card (scroll to reveal) */}
          <div className="hidden">
            <motion.img src="/wrapped/slide4-ufo.png" alt="UFO"
              className="absolute left-1/2 top-[4%] w-[70%] -translate-x-1/2 select-none"
              style={{ x: ufoX, filter: "drop-shadow(0 20px 40px rgba(74,222,128,0.5))" }}
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              draggable={false} />
            <motion.div
              className="absolute bottom-[2%] left-1/2 w-[52%] -translate-x-1/2"
              style={{ aspectRatio: "1" }}
              animate={{ x: [-50, 50, -50] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cat-rocket.png" alt="Cat astronaut"
                className="block h-full w-full select-none object-contain"
                style={{ filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.7))" }} draggable={false} />
              <RocketTailNodes scale={0.95} />
            </motion.div>
            <CommitStream ufoX={ufoX} />
          </div>
        </div>

        {/* RIGHT — full round planet */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative col-span-12 hidden overflow-hidden lg:col-span-4 lg:block">
          <PlanetStage>
          <div className="relative flex h-[520px] w-[520px] items-center justify-center">
            <motion.div
              className="relative h-[86%] w-[86%] overflow-hidden rounded-full"
              animate={{ y: [0, -10, 0], rotate: 360 }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 240, repeat: Infinity, ease: "linear" } }}
              style={{
                filter: "drop-shadow(0 0 36px rgba(74,222,128,0.5)) drop-shadow(0 0 72px rgba(74,222,128,0.18))",
                WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0 55%, transparent 61%)",
                maskImage: "radial-gradient(circle at 50% 50%, black 0 55%, transparent 61%)",
              }}
            >
              <Image
                src="/wrapped/slide4-planet.png"
                alt="Alien green planet"
                fill
                sizes="520px"
                className="block h-full w-full select-none object-cover"
                draggable={false}
                unoptimized
              />
            </motion.div>
          </div>
          </PlanetStage>
        </motion.div>
      </div>
    </div>
  );
}
