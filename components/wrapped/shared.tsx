"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

// ── Stars ─────────────────────────────────────────────────────────────────
export function Stars({ count = 120 }: { count?: number }) {
  const [stars] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            boxShadow: "0 0 4px rgba(255,255,255,0.6)",
          }}
        />
      ))}
      <style>{`@keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }`}</style>
    </div>
  );
}

// ── Rocket tail twinkle ──────────────────────────────────────────────────────
// Branch-tip circles in the cat's tail in cat-rocket.png, as % of the 1024×1024
// image. Mirrors the landing-page effect: nodes flash green at random intervals.
// Render as a sibling overlay inside a `relative` box whose aspect ratio matches
// the image (so object-contain / natural sizing puts the tips where we expect).
// Pass a custom `nodes` array for a different cat image (e.g. the dual-cat slides).
const ROCKET_TAIL_NODES: [number, number][] = [
  [74.4, 18.4],
  [86.2, 16.0],
  [91.7, 23.2],
  [71.4, 28.0],
  [89.5, 30.6],
];

// Tail-tip circles for the single cat in 3.png (1024×1055) — slide 6.
export const SLIDE6_TAIL_NODES: [number, number][] = [
  [34.0, 14.9],
  [43.9, 19.2],
  [28.8, 20.3],
  [29.3, 28.9],
  [45.7, 28.4],
  [24.9, 33.4],
];

// Tail-tip circles for BOTH cats in two-cats-surprised.png (1376×768) — slide 7.
// Left cat's tail fans out to the left, right cat's to the right.
export const SLIDE7_TAIL_NODES: [number, number][] = [
  // left cat
  [6.0, 15.0], [12.7, 16.5], [3.5, 23.5], [16.5, 29.0], [3.8, 32.5], [2.5, 40.0],
  // right cat
  [86.2, 16.5], [80.8, 18.9], [88.9, 23.3], [79.1, 28.0], [88.4, 29.5], [89.9, 37.2],
];

export function RocketTailNodes({ scale = 1, nodes = ROCKET_TAIL_NODES }: { scale?: number; nodes?: [number, number][] }) {
  const [lit, setLit] = useState<Set<number>>(new Set());

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const idx = Math.floor(Math.random() * nodes.length);
      setLit((prev) => new Set([...prev, idx]));
      setTimeout(
        () => setLit((prev) => { const n = new Set(prev); n.delete(idx); return n; }),
        260 + Math.random() * 340,
      );
      t = setTimeout(flash, 500 + Math.random() * 1100);
    };
    t = setTimeout(flash, 400 + Math.random() * 800);
    return () => clearTimeout(t);
  }, [nodes]);

  const d = 7 * scale;
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {nodes.map(([px, py], i) => (
        <span key={i} className="absolute rounded-full"
          style={{
            left: `${px}%`, top: `${py}%`,
            width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2,
            background: lit.has(i) ? "oklch(0.88 0.32 145)" : "transparent",
            boxShadow: lit.has(i)
              ? `0 0 ${12 * scale}px ${4 * scale}px oklch(0.78 0.28 145 / 0.85), 0 0 ${5 * scale}px ${1 * scale}px oklch(0.92 0.36 145)`
              : "none",
            transition: "background 0.1s ease, box-shadow 0.1s ease",
          }}
        />
      ))}
    </div>
  );
}

// ── Rocket ─────────────────────────────────────────────────────────────────
function CatRocketImg() {
  return (
    <div className="relative grid place-items-center" style={{ width: 160, height: 160 }}>
      <div className="absolute inset-[8%] rounded-full blur-2xl opacity-70"
        style={{ background: "radial-gradient(circle, rgba(74,222,128,0.4), transparent 60%)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cat-rocket.png" alt="Cat astronaut in cardboard rocket" width={160} height={160}
        className="relative h-full w-full select-none object-contain"
        style={{ filter: "drop-shadow(0 0 28px rgba(190,160,255,0.75)) drop-shadow(0 20px 46px rgba(80,255,160,0.24))" }}
        draggable={false}
      />
      <RocketTailNodes scale={1} />
    </div>
  );
}

export function Rocket() {
  const controls = useAnimation();
  const [launched, setLaunched] = useState(false);
  const trail = Array.from({ length: 14 }).map((_, i) => i);
  const [trailDots] = useState(() =>
    Array.from({ length: 14 }).map(() => ({
      w: 6 + Math.random() * 6,
      h: 6 + Math.random() * 6,
      x: (Math.random() - 0.5) * 30,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        setLaunched(false);
        await controls.start({ y: 0, x: 0, rotate: 0, opacity: 1, transition: { duration: 0 } });
        await controls.start({
          x: [0, -3, 3, -3, 3, -2, 2, 0],
          rotate: [0, -1, 1, -1, 1, 0],
          transition: { duration: 2, ease: "easeInOut" },
        });
        if (cancelled) return;
        setLaunched(true);
        await controls.start({
          y: -700,
          opacity: [1, 1, 0],
          transition: { duration: 3.5, ease: [0.4, 0, 0.2, 1], times: [0, 0.8, 1] },
        });
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 1200));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [controls]);

  return (
    <div className="relative h-full w-full">
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        width="320"
        height="280"
        viewBox="0 0 320 280"
        fill="none"
      >
        <defs>
          <linearGradient id="sharedBranch1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M160 280 L160 80" stroke="url(#sharedBranch1)" strokeWidth="3" strokeLinecap="round" />
        <path d="M160 220 C 120 200, 80 200, 60 170 L 60 130" stroke="url(#sharedBranch1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M160 200 C 200 180, 240 180, 260 150 L 260 110" stroke="url(#sharedBranch1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M160 160 C 130 140, 110 130, 100 100" stroke="url(#sharedBranch1)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {(
          [
            [160, 260], [160, 220], [160, 180], [160, 140], [160, 100],
            [60, 170], [60, 130], [260, 150], [260, 110], [100, 100], [200, 180], [120, 200],
          ] as [number, number][]
        ).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#4ade80" style={{ filter: "drop-shadow(0 0 6px #22c55e)" }} />
        ))}
      </svg>
      <motion.div animate={controls} className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 220 }}>
        <CatRocketImg />
        {launched && (
          <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2">
            {trail.map((i) => (
              <motion.span
                key={i}
                className="absolute block rounded-full bg-green-400"
                style={{
                  width: trailDots[i].w,
                  height: trailDots[i].h,
                  left: trailDots[i].x,
                  boxShadow: "0 0 12px #22c55e,0 0 24px #16a34a",
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: 200, opacity: [0, 1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── GlassCard ──────────────────────────────────────────────────────────────
export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-full max-w-[440px] rounded-3xl border border-white/10 p-7 text-white ${className ?? ""}`}
      style={{
        background: "linear-gradient(160deg,rgba(30,20,60,0.55),rgba(10,8,25,0.65))",
        backdropFilter: "blur(24px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

// Compact themed planet shown above the card on mobile (lg:hidden). Keeps the
// cosmic flavour without the heavy desktop scenes that overflow small screens.
export function MobilePlanet({ color = "#a78bfa", size = 104 }: { color?: string; size?: number }) {
  return (
    <div className="relative mx-auto mb-4 lg:hidden" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full opacity-60 blur-2xl"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
      <motion.div className="relative h-full w-full overflow-hidden rounded-full"
        style={{
          background: `radial-gradient(circle at 34% 28%, color-mix(in oklab, ${color} 65%, white), ${color} 46%, color-mix(in oklab, ${color} 55%, black) 100%)`,
          boxShadow: `inset -7px -9px 22px rgba(0,0,0,0.55), inset 6px 6px 16px rgba(255,255,255,0.18), 0 0 28px ${color}66`,
        }}
        animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}>
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 72% 76%, rgba(0,0,0,0.45), transparent 52%)" }} />
        <div className="absolute left-[22%] top-[30%] h-[14%] w-[28%] rounded-full" style={{ background: "rgba(0,0,0,0.18)" }} />
        <div className="absolute left-[55%] top-[58%] h-[12%] w-[22%] rounded-full" style={{ background: "rgba(0,0,0,0.16)" }} />
      </motion.div>
    </div>
  );
}

export function PlanetStage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-[420px] w-full items-center justify-center pt-24 lg:h-[640px] ${className ?? ""}`}>
      {children}
    </div>
  );
}

// ── SlideShell ─────────────────────────────────────────────────────────────
export function SlideShell({
  leftContent,
  center,
  right,
  overlay,
  mobileHeader,
  mobileFooter,
}: {
  leftContent?: ReactNode;
  center: ReactNode;
  right: ReactNode;
  overlay?: ReactNode;
  mobileHeader?: ReactNode;
  mobileFooter?: ReactNode;
}) {
  return (
    <div className="relative min-h-full w-full overflow-hidden text-white" style={{ background: "var(--slide-bg, #080612)" }}>
      <div className="slide-stars-bg"><Stars /></div>
      {overlay}
      {/* violet nebula glow behind right column */}
      <div
        className="slide-nebula-glow pointer-events-none absolute -right-40 top-1/2 h-[900px] w-[900px] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 60%)" }}
      />
      {/* responsive grid — single column on mobile, 3 columns on desktop */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-90px)] max-w-[1500px] grid-cols-1 items-start gap-4 px-4 pb-10 pt-16 lg:min-h-screen lg:grid-cols-[0.7fr_minmax(320px,1fr)_0.7fr] lg:items-stretch lg:px-6 lg:py-12">
        {/* LEFT — Rocket + optional chapter title (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative hidden lg:block slide-left-col"
        >
          <div className="absolute inset-0">
            <Rocket />
          </div>
          {leftContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute left-2 top-10"
            >
              {leftContent}
            </motion.div>
          )}
        </motion.div>
        {/* CENTER */}
        <div className="flex min-h-0 flex-col items-center justify-center">
          {mobileHeader && <div className="lg:hidden">{mobileHeader}</div>}
          {center}
          {mobileFooter && <div className="lg:hidden">{mobileFooter}</div>}
        </div>
        {/* RIGHT — planet (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="relative hidden lg:block slide-right-col"
        >
          {right}
        </motion.div>
      </div>
    </div>
  );
}
