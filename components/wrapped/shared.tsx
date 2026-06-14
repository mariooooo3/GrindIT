"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";

// ── Stars ─────────────────────────────────────────────────────────────────
export function Stars({ count = 120 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.8 + 0.4,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
      })),
    [count],
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
    </div>
  );
}

export function Rocket() {
  const controls = useAnimation();
  const [launched, setLaunched] = useState(false);
  const trail = useMemo(() => Array.from({ length: 14 }).map((_, i) => i), []);

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
                  width: 6 + Math.random() * 6,
                  height: 6 + Math.random() * 6,
                  left: (Math.random() - 0.5) * 30,
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
}: {
  leftContent?: ReactNode;
  center: ReactNode;
  right: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div className="relative min-h-full w-full overflow-hidden text-white" style={{ background: "#080612" }}>
      <Stars />
      {overlay}
      {/* violet nebula glow behind right column */}
      <div
        className="pointer-events-none absolute -right-40 top-1/2 h-[900px] w-[900px] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 60%)" }}
      />
      {/* 3-column grid */}
      <div className="relative z-10 mx-auto grid h-[calc(100vh-150px)] max-w-[1500px] grid-cols-[0.7fr_minmax(320px,1fr)_0.7fr] gap-4 px-6 pt-20">
        {/* LEFT — Rocket + optional chapter title */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative block"
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
        <div className="flex min-h-0 items-center justify-center">{center}</div>
        {/* RIGHT — planet */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="relative block"
        >
          {right}
        </motion.div>
      </div>
    </div>
  );
}
