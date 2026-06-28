"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Portrait-optimised orbit — fits within 375px screen width with comfortable margins
const ORBIT_RX = 115;
const ORBIT_RY = 88;
const ORBIT_DURATION = 22000;
const TAIL_OFFSET = 36;
const MOON_ANCHOR = "40%";
const INITIAL_ROCKET_TRANSFORM = `translate(-50%,-50%) translate(${ORBIT_RX}px,0px) rotate(98deg)`;

const DOT_EMIT_MS = 420;
const DOT_MAX = 3;
const DOT_LIFETIME = 1300;

type CommitDot = { id: number; x: number; y: number; born: number };
type ShootingStar = { id: number; x: number; y: number; angle: number };

// Same node positions as the desktop rocket (% of 1024×1024 image)
const ROCKET_NODES: [number, number][] = [
  [74.7, 18.6],
  [84.3, 16.1],
  [91.0, 22.9],
  [71.3, 27.3],
  [88.5, 31.2],
];

function shortestAngleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function orbitPos(t: number) {
  const a = ((t % ORBIT_DURATION) / ORBIT_DURATION) * Math.PI * 2;
  const x = Math.cos(a) * ORBIT_RX;
  const y = Math.sin(a) * ORBIT_RY;
  const tx = -Math.sin(a) * ORBIT_RX;
  const ty = Math.cos(a) * ORBIT_RY;
  const len = Math.hypot(tx, ty) || 1;
  return {
    a,
    x,
    y,
    ux: tx / len,
    uy: ty / len,
    rotateDeg: (Math.atan2(ty, tx) * 180) / Math.PI,
    behind: y < 0,
  };
}

function RocketCommitNodes() {
  const [lit, setLit] = useState<Set<number>>(new Set());

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const idx = Math.floor(Math.random() * ROCKET_NODES.length);
      setLit(prev => new Set([...prev, idx]));
      setTimeout(
        () => setLit(prev => { const n = new Set(prev); n.delete(idx); return n; }),
        260 + Math.random() * 340,
      );
      t = setTimeout(flash, 500 + Math.random() * 1100);
    };
    t = setTimeout(flash, 400 + Math.random() * 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ROCKET_NODES.map(([px, py], i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${px}%`,
            top: `${py}%`,
            width: 6,
            height: 6,
            marginLeft: -3,
            marginTop: -3,
            background: lit.has(i) ? "oklch(0.88 0.32 145)" : "transparent",
            boxShadow: lit.has(i)
              ? "0 0 10px 3px oklch(0.78 0.28 145 / 0.85), 0 0 4px 1px oklch(0.92 0.36 145)"
              : "none",
            transition: "background 0.1s ease, box-shadow 0.1s ease",
          }}
        />
      ))}
    </>
  );
}

function MobileRocket() {
  return (
    <div className="relative grid place-items-center" style={{ width: 88, height: 88 }}>
      {/* No glow/filter around the rocket — a drop-shadow filter renders a visible
          rectangular box on iOS, and radial glows read as fog + a green dot, both
          of which the design should not have. Clean image only. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cat-rocket.png"
        alt="Cat astronaut in cardboard rocket"
        width={1024}
        height={1024}
        className="relative h-full w-full select-none object-contain"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 z-10">
        <RocketCommitNodes />
      </div>
    </div>
  );
}

export function MobileHeroScene() {
  const reduce = useReducedMotion();
  const rocketRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<CommitDot[]>([]);
  const [shoots, setShoots] = useState<ShootingStar[]>([]);

  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    let lastEmit = 0, raf = 0, dotId = 0, smoothRot = 0, hasRot = false;

    const tick = (now: number) => {
      const p = orbitPos(now - start);
      const el = rocketRef.current;
      if (el) {
        const tgt = p.rotateDeg + 90;
        const bank = -Math.cos(p.a) * 8;
        if (!hasRot) { smoothRot = tgt; hasRot = true; }
        else smoothRot += shortestAngleDelta(smoothRot, tgt) * 0.12;
        el.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px) rotate(${smoothRot + bank}deg)`;
        el.style.zIndex = p.behind ? "25" : "35";
      }
      if (now - lastEmit > DOT_EMIT_MS) {
        lastEmit = now;
        setDots(prev => {
          const alive = prev.filter(d => now - d.born < DOT_LIFETIME);
          const next = [...alive, { id: ++dotId, x: p.x - p.ux * TAIL_OFFSET, y: p.y - p.uy * TAIL_OFFSET, born: now }];
          return next.length > DOT_MAX ? next.slice(-DOT_MAX) : next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    let uid = 0;
    const fire = () => {
      const id = ++uid;
      setShoots(p => [...p, { id, x: 10 + Math.random() * 70, y: 5 + Math.random() * 30, angle: 28 + Math.random() * 18 }]);
      setTimeout(() => setShoots(p => p.filter(s => s.id !== id)), 900);
    };
    const t0 = setTimeout(fire, 1800);
    const interval = setInterval(fire, 6000 + Math.random() * 4000);
    return () => { clearTimeout(t0); clearInterval(interval); };
  }, [reduce]);

  return (
    <div className="pointer-events-none absolute inset-0" style={{ transform: "translateZ(0)" }}>
      {/* planet soft glow — radial-gradients only, no filter to avoid GPU layer flash */}
      <div
        className="absolute left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          top: MOON_ANCHOR,
          background: "radial-gradient(closest-side, oklch(0.55 0.18 295 / 0.22), transparent 100%)",
        }}
      />
      <div
        className="absolute left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          top: MOON_ANCHOR,
          background: "radial-gradient(closest-side, oklch(0.72 0.18 295 / 0.14), transparent 100%)",
        }}
      />

      {/* planet — CSS animation (no Framer Motion) avoids iOS compositing-layer flash */}
      <div
        className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ top: MOON_ANCHOR }}
      >
        <div style={{ animation: reduce ? "none" : "planet-spin 240s linear infinite" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moon.png"
            alt=""
            width={620}
            height={620}
            className="block h-[200px] w-[200px] select-none object-contain"
            style={{ opacity: 0.92 }}
            draggable={false}
          />
        </div>
      </div>

      {/* commit exhaust dots */}
      <div className="absolute left-1/2 z-10" style={{ top: MOON_ANCHOR }}>
        {dots.map(dot => (
          <span
            key={dot.id}
            className="commit-dot absolute block rounded-full"
            style={{
              width: 10,
              height: 10,
              transform: `translate(calc(${dot.x}px - 50%), calc(${dot.y}px - 50%))`,
              willChange: "transform, opacity",
              background: "oklch(0.88 0.32 145)",
              boxShadow: "0 0 12px 4px oklch(0.78 0.28 145 / 0.75), 0 0 5px 2px oklch(0.92 0.34 145 / 0.9)",
            }}
          />
        ))}
      </div>

      {/* shooting stars */}
      {shoots.map(s => (
        <span
          key={s.id}
          className="shooting-star absolute block"
          style={{
            left: 0,
            top: 0,
            width: 60,
            height: 1.5,
            borderRadius: 2,
            transform: `translate(${s.x}vw, ${s.y}vh) rotate(${s.angle}deg)`,
            willChange: "transform, opacity",
            background:
              "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.85) 50%, rgba(255,255,255,0))",
            boxShadow: "0 0 6px rgba(255,255,255,0.4)",
          }}
        />
      ))}

      {/* cat rocket */}
      {reduce ? (
        <div
          className="absolute left-1/2 z-30"
          style={{
            top: MOON_ANCHOR,
            transform: `translate(-50%,-50%) translate(${ORBIT_RX}px,${ORBIT_RY * 0.4}px)`,
          }}
        >
          <MobileRocket />
        </div>
      ) : (
        <div
          ref={rocketRef}
          className="absolute left-1/2 z-30"
          style={{ top: MOON_ANCHOR, transform: INITIAL_ROCKET_TRANSFORM }}
        >
          <MobileRocket />
        </div>
      )}
    </div>
  );
}
