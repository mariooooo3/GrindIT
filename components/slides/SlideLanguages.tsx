"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, MobilePlanet, RocketTailNodes } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { SlideCard } from "@/components/wrapped/SlideCard";

const ACCENT = "#f87171";

const SHIELD_RIM = 79;
const SPAWN_R = 360;

const INCOMING = [
  { angle: 200, size: 64, dur: 4.2, delay: 0.3, label: "bug" },
  { angle: 320, size: 44, dur: 5.0, delay: 1.8, label: "TypeError" },
  { angle: 95,  size: 80, dur: 4.6, delay: 3.2, label: "null ref" },
  { angle: 30,  size: 38, dur: 3.8, delay: 5.0, label: undefined },
] as const;

function AsteroidRock({ size, label }: { size: number; label?: string }) {
  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full rounded-full"
        style={{ background: "radial-gradient(circle at 30% 30%, #6b6258, #3a322c 55%, #1a1612 100%)", boxShadow: "inset -6px -8px 14px rgba(0,0,0,0.7), inset 4px 4px 8px rgba(255,255,255,0.06)" }} />
      <span className="absolute rounded-full"
        style={{ width: size * 0.22, height: size * 0.22, top: "20%", left: "30%", background: "rgba(0,0,0,0.45)", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.08)" }} />
      <span className="absolute rounded-full"
        style={{ width: size * 0.16, height: size * 0.16, bottom: "22%", right: "24%", background: "rgba(0,0,0,0.5)" }} />
      {label && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
          style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(248,113,113,0.4)", color: "#fca5a5" }}>
          {label}
        </span>
      )}
    </div>
  );
}

function Shatter({ x, y, size }: { x: number; y: number; size: number }) {
  const bits = 8;
  return (
    <div className="absolute" style={{ left: 0, top: 0, transform: `translate(${x}px, ${y}px)` }}>
      <motion.div className="absolute rounded-full"
        style={{ width: size * 1.4, height: size * 1.4, marginLeft: -size * 0.7, marginTop: -size * 0.7, background: "radial-gradient(circle, rgba(186,230,253,0.85), rgba(56,189,248,0.25) 50%, transparent 72%)" }}
        initial={{ scale: 0.4, opacity: 0.95 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} />
      {Array.from({ length: bits }).map((_, i) => {
        const a = (i / bits) * Math.PI * 2 + 0.3;
        const frag = size * (0.14 + (i % 3) * 0.05);
        return (
          <motion.span key={i} className="absolute rounded-full"
            style={{ width: frag, height: frag, marginLeft: -frag / 2, marginTop: -frag / 2, background: "radial-gradient(circle at 35% 35%, #6b6258, #2a231d 70%)" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * size * (0.9 + (i % 2) * 0.4), y: Math.sin(a) * size * (0.9 + (i % 2) * 0.4), opacity: 0, scale: 0.3, rotate: (i % 2 ? 1 : -1) * 180 }}
            transition={{ duration: 0.55, ease: "easeOut" }} />
        );
      })}
    </div>
  );
}

function IncomingAsteroid({ angle, size, dur, delay, label }: { angle: number; size: number; dur: number; delay: number; label?: string }) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"idle" | "incoming" | "shatter">("idle");

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      if (!alive) return;
      setPhase("incoming");
      setCycle((c) => c + 1);
      timers.push(setTimeout(() => {
        if (!alive) return;
        setPhase("shatter");
        timers.push(setTimeout(() => {
          if (!alive) return;
          timers.push(setTimeout(run, 700 + Math.random() * 1600));
        }, 550));
      }, dur * 1000));
    };
    timers.push(setTimeout(run, delay * 1000));
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [dur, delay]);

  const rad = (angle * Math.PI) / 180;
  const travel = SHIELD_RIM + size / 2;
  const start = { x: Math.cos(rad) * SPAWN_R, y: Math.sin(rad) * SPAWN_R };
  const impact = { x: Math.cos(rad) * travel, y: Math.sin(rad) * travel };
  const contact = { x: Math.cos(rad) * SHIELD_RIM, y: Math.sin(rad) * SHIELD_RIM };

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" style={{ transform: "translate(-50%,-50%)" }}>
      {phase === "idle" ? null : phase === "incoming" ? (
        <motion.div key={cycle} className="absolute"
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
          initial={{ x: start.x, y: start.y, opacity: 0 }}
          animate={{ x: impact.x, y: impact.y, opacity: [0, 1, 1] }}
          transition={{ duration: dur, ease: "linear", times: [0, 0.15, 1] }}>
          <motion.div className="h-full w-full"
            animate={{ rotate: angle % 2 ? 360 : -360 }}
            transition={{ duration: dur * 0.7, repeat: Infinity, ease: "linear" }}>
            <AsteroidRock size={size} label={label} />
          </motion.div>
        </motion.div>
      ) : (
        <Shatter x={contact.x} y={contact.y} size={size} />
      )}
    </div>
  );
}

function ShieldBubble() {
  const d = SHIELD_RIM * 2;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-[6]" style={{ transform: "translate(-50%,-50%)" }}>
      <motion.div className="absolute rounded-full"
        style={{
          width: d, height: d, left: -SHIELD_RIM, top: -SHIELD_RIM,
          background: "radial-gradient(circle at 50% 38%, rgba(125,211,252,0.12), rgba(56,189,248,0.05) 58%, transparent 72%)",
          border: "1.5px solid rgba(125,211,252,0.5)",
          boxShadow: "0 0 26px rgba(56,189,248,0.5), inset 0 0 34px rgba(125,211,252,0.28)",
        }}
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute rounded-full"
        style={{
          width: d, height: d, left: -SHIELD_RIM, top: -SHIELD_RIM,
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(186,230,253,0.55) 28deg, transparent 70deg, transparent 360deg)",
          WebkitMask: `radial-gradient(circle, transparent ${SHIELD_RIM - 9}px, #000 ${SHIELD_RIM - 8}px, #000 ${SHIELD_RIM}px, transparent ${SHIELD_RIM + 1}px)`,
          mask: `radial-gradient(circle, transparent ${SHIELD_RIM - 9}px, #000 ${SHIELD_RIM - 8}px, #000 ${SHIELD_RIM}px, transparent ${SHIELD_RIM + 1}px)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}

function CatRocketScene() {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      <motion.div className="relative"
        animate={{ rotate: [0, -5, 4, -3, 5, 0], scale: [1, 1.04, 0.99, 1.03, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div className="absolute rounded-full"
          style={{ background: "radial-gradient(circle, rgba(74,222,128,0.35) 0%, rgba(74,222,128,0) 70%)", width: 180, height: 180, left: -40, top: -40 }}
          animate={{ scale: [0.8, 1.15, 0.8], opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", repeatDelay: 1.4 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cat-rocket.png" alt="" width={100} height={100}
          className="relative block select-none object-contain"
          style={{ filter: "drop-shadow(0 0 18px rgba(74,222,128,0.6))" }}
          draggable={false} />
        <RocketTailNodes scale={0.62} />
      </motion.div>
    </div>
  );
}

function LeftScene() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {INCOMING.map((a, i) => (
        <IncomingAsteroid key={i} {...a} />
      ))}
      <ShieldBubble />
      <CatRocketScene />
    </div>
  );
}

function Planet() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute rounded-full"
        style={{ width: 420, height: 420, background: "radial-gradient(circle, rgba(193,68,14,0.25) 0%, rgba(139,37,0,0.08) 40%, transparent 70%)", filter: "blur(20px)" }} />
      <motion.div className="relative rounded-full"
        style={{ width: 360, height: 360, background: "radial-gradient(circle at 32% 30%, #d6552a 0%, #C1440E 25%, #8B2500 60%, #3a0f00 95%)", boxShadow: "inset -30px -40px 80px rgba(0,0,0,0.7), inset 20px 20px 60px rgba(255,140,80,0.15), 0 0 80px rgba(193,68,14,0.35)" }}
        animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
        {[{ x: 22, y: 30, s: 14 }, { x: 55, y: 22, s: 9 }, { x: 70, y: 45, s: 18 }, { x: 40, y: 55, s: 11 }, { x: 30, y: 70, s: 16 }, { x: 65, y: 72, s: 10 }, { x: 50, y: 40, s: 7 }, { x: 78, y: 60, s: 8 }].map((c, i) => (
          <span key={i} className="absolute rounded-full" style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.s}%`, height: `${c.s}%`, background: "radial-gradient(circle at 35% 35%, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 70%, transparent)", boxShadow: "inset 1px 1px 2px rgba(255,180,140,0.15)" }} />
        ))}
        <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(0,0,0,0.55) 90%)" }} />
      </motion.div>
    </div>
  );
}

// ── Language orbits ──────────────────────────────────────────────────────────
// The original planet stays as the hero; each top language adds a slim, elegant
// orbit around it — the lit arc length encodes its share, with a satellite tip.
function LanguagePlanet({ langs }: { langs: { name: string; color: string; percentage: number }[] }) {
  const C = 280;            // svg center
  const rings = langs.slice(0, 5);
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Planet />
      <svg viewBox="0 0 560 560"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2">
        {rings.map((l, i) => {
          const r = 198 + i * 15;
          const circ = 2 * Math.PI * r;
          const arc = (circ * l.percentage) / 100;
          const ang = ((-90 + (l.percentage / 100) * 360) * Math.PI) / 180;
          const mx = C + r * Math.cos(ang);
          const my = C + r * Math.sin(ang);
          const spin = 95 + i * 20;
          return (
            <motion.g key={l.name}
              animate={{ rotate: i % 2 ? -360 : 360 }}
              transition={{ duration: spin, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: `${C}px ${C}px` }}>
              {/* faint orbital track */}
              <circle cx={C} cy={C} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2.5} />
              {/* lit share arc */}
              <motion.circle cx={C} cy={C} r={r} fill="none" stroke={l.color} strokeWidth={2.5} strokeLinecap="round"
                transform={`rotate(-90 ${C} ${C})`}
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - arc }}
                transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ filter: `drop-shadow(0 0 4px ${l.color}aa)` }} />
              {/* satellite marker at the arc tip */}
              <circle cx={mx} cy={my} r={2.8} fill={l.color} style={{ filter: `drop-shadow(0 0 5px ${l.color})` }} />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

export default function SlideLanguages({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const langs = flat.topLanguages.slice(0, 5);
  const topLang = langs[0];
  const hasLangs = langs.length > 0;
  const ct = flat.commitTypes;
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

  return (
    <main className="relative min-h-full w-full overflow-hidden" style={{ background: "#080612", color: "white" }}>
      <Stars />
      <ChapterHeadingAnchor n={3} title="Dodging Bugs" />
      <div className="relative z-10 grid min-h-screen grid-cols-1 items-start gap-6 px-4 pb-10 pt-16 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10 lg:px-12 lg:py-12">
        {/* LEFT */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative hidden h-[640px] lg:order-1 lg:block">
          <LeftScene />
        </motion.div>

        {/* CENTER */}
        <div className="order-1 flex flex-col items-center justify-center lg:order-2">
          <div className="w-[min(380px,92vw)] lg:hidden">
            <ChapterHeadingMobile n={3} title="Dodging Bugs" />
            <MobilePlanet color="#d6552a" />
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show"
            className="w-[min(380px,92vw)]">
            <SlideCard accentColor={ACCENT} className="text-white">
              <motion.div variants={item} className="flex items-center gap-3">
                <div className="rounded-full flex-shrink-0 overflow-hidden"
                  style={{ width: 40, height: 40, background: flat.avatarUrl ? `url(${flat.avatarUrl}) center/cover` : "linear-gradient(135deg, #6366f1, #a855f7)", border: `1px solid ${ACCENT}40` }}>
                  {!flat.avatarUrl && <div className="w-full h-full flex items-center justify-center text-white font-bold text-base">{flat.username.charAt(0).toUpperCase()}</div>}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold text-base truncate">@{flat.username}</div>
                  <div className="text-[10px]" style={{ color: `${ACCENT}60` }}>{flat.period.label}</div>
                </div>
              </motion.div>

              <motion.div variants={item} className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac" }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-green-400" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  Tech arsenal
                </span>
              </motion.div>

              {hasLangs ? (
                <>
                  <motion.div variants={item} className="mt-2 flex items-baseline gap-2">
                    <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", color: topLang.color, textShadow: `0 0 20px ${topLang.color}80` }}>
                      {topLang.name}
                    </span>
                    <span className="font-mono text-sm text-white/50">{topLang.percentage}%</span>
                  </motion.div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider" style={{ color: `${ACCENT}60` }}>primary language</div>

                  <motion.div variants={item} className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    {langs.map((l) => (
                      <motion.div key={l.name} initial={{ width: 0 }} animate={{ width: `${l.percentage}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        style={{ background: l.color }} title={`${l.name} ${l.percentage}%`} />
                    ))}
                  </motion.div>

                  <motion.div variants={item} className="mt-3 space-y-1.5">
                    {langs.map((l) => (
                      <div key={l.name} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
                        <span className="flex-1 truncate text-xs text-white/85">{l.name}</span>
                        <span className="font-mono text-[10px] text-white/45">{l.percentage}%</span>
                      </div>
                    ))}
                  </motion.div>
                </>
              ) : (
                <motion.div variants={item} className="mt-3 rounded-xl px-3 py-3 text-sm text-white/55"
                  style={{ border: `1px solid ${ACCENT}20`, background: `${ACCENT}06` }}>
                  Language data is sparse for this period — your code still flies under the radar.
                </motion.div>
              )}

              <motion.div variants={item} className="mt-3 grid grid-cols-3 gap-2 py-3"
                style={{ borderTop: `1px solid ${ACCENT}18`, borderBottom: `1px solid ${ACCENT}18` }}>
                {[
                  { label: "Languages", value: String(flat.languageCount) },
                  { label: "Lines", value: flat.totalLinesOfCode > 0 ? flat.totalLinesOfCode.toLocaleString() : "—" },
                  { label: "Diversity", value: `${flat.languageEntropyPct}%` },
                ].map((s, i) => (
                  <div key={s.label} className="text-center" style={{ borderLeft: i > 0 ? `1px solid ${ACCENT}18` : undefined }}>
                    <div className="truncate text-sm font-semibold text-white">{s.value}</div>
                    <div className="mt-0.5 text-[9px] uppercase tracking-wider" style={{ color: `${ACCENT}60` }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>

              {flat.topics.length > 0 && (
                <motion.div variants={item} className="mt-3">
                  <div className="mb-1.5 text-[10px] uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>Tech &amp; topics</div>
                  <div className="flex flex-wrap gap-1.5">
                    {flat.topics.slice(0, 6).map((t) => (
                      <span key={t} className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2 py-0.5 text-[10px] text-emerald-200">{t}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {ct && ct.sampleSize > 0 && (
                <motion.div variants={item} className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span style={{ color: `${ACCENT}70` }}>Commit mix</span>
                    <span className="font-mono" style={{ color: ACCENT }}>{flat.fixRatioPct}% fixes</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    {[
                      { v: ct.feat, c: "#22c55e" },
                      { v: ct.fix, c: "#ef4444" },
                      { v: ct.refactor, c: "#a78bfa" },
                      { v: ct.docs + ct.test + ct.chore + ct.other, c: "#64748b" },
                    ].map((seg, i) => (
                      <div key={i} style={{ width: `${(seg.v / ct.sampleSize) * 100}%`, background: seg.c }} />
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-white/45">
                    <span><span style={{ color: "#22c55e" }}>●</span> feat {ct.feat}</span>
                    <span><span style={{ color: "#ef4444" }}>●</span> fix {ct.fix}</span>
                    <span><span style={{ color: "#a78bfa" }}>●</span> refactor {ct.refactor}</span>
                  </div>
                </motion.div>
              )}
            </SlideCard>
          </motion.div>

          {/* mobile: animated scene below the card */}
          <div className="mt-6 h-[380px] w-[min(380px,92vw)] lg:hidden">
            <LeftScene />
          </div>
        </div>

        {/* RIGHT */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative hidden order-3 lg:block">
          <PlanetStage>
            {hasLangs ? <LanguagePlanet langs={langs} /> : <Planet />}
          </PlanetStage>
        </motion.div>
      </div>
    </main>
  );
}
