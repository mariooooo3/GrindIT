"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ORBIT_RX = 185;
const ORBIT_RY = 125;
const ORBIT_DURATION = 26000;
const TAIL_OFFSET = 50;
const MOON_ANCHOR = "42%";
const INITIAL_ROCKET_TRANSFORM = `translate(-50%,-50%) translate(${ORBIT_RX}px,0px) rotate(98deg)`;

const DOT_EMIT_MS   = 380;
const DOT_MAX       = 4;
const DOT_LIFETIME  = 1400;

type CommitDot = { id: number; x: number; y: number; born: number };
type ShootingStar = { id: number; x: number; y: number; angle: number };

function shortestAngleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function orbitPos(t: number) {
  const a   = ((t % ORBIT_DURATION) / ORBIT_DURATION) * Math.PI * 2;
  const x   = Math.cos(a) * ORBIT_RX;
  const y   = Math.sin(a) * ORBIT_RY;
  const tx  = -Math.sin(a) * ORBIT_RX;
  const ty  =  Math.cos(a) * ORBIT_RY;
  const len = Math.hypot(tx, ty) || 1;
  return { a, x, y, ux: tx / len, uy: ty / len, rotateDeg: (Math.atan2(ty, tx) * 180) / Math.PI, behind: y < 0 };
}

// ─── constellation lines ──────────────────────────────────────────────────────
const CONSTELLATIONS: Array<[number,number][]> = [
  // Ursa Mică — cupă (dreptunghi închis)
  [[4,13],[12,12],[13,20],[5,21],[4,13]],
  // Ursa Mică — mâner curbat spre Polaris (jos-dreapta)
  [[13,20],[16,30],[18,41],[17,53]],
  // Triunghi — dreapta jos
  [[82,58],[88,52],[92,60],[82,58]],
];

// ─── stable star data ──────────────────────────────────────────────────────
const STAR_DATA = (() => {
  const out: { x: number; y: number; size: number; opacity: number; glow: number; twinkle: boolean; dur: number; color: string }[] = [];
  // tiny background stars — more of them
  for (let i = 0; i < 110; i++)
    out.push({ x:(i*97+13)%100, y:(i*53+7)%100, size:0.5+(i%6)*0.08, opacity:0.15+(i%5)*0.06, glow:0, twinkle:false, dur:0, color:"255,255,255" });
  // medium twinkling stars
  for (let i = 0; i < 36; i++)
    out.push({ x:(i*137+41)%100, y:(i*79+23)%100, size:1.1+(i%4)*0.22, opacity:0.35+(i%3)*0.13, glow:3, twinkle:i%4===0, dur:2.2+(i%5)*0.6, color:"255,255,255" });
  // bright coloured accent stars
  for (let i = 0; i < 16; i++) {
    const color = i%3===0?"200,170,255":i%3===1?"160,255,200":"255,220,180";
    out.push({ x:(i*211+67)%100, y:(i*113+31)%100, size:1.8+(i%4)*0.35, opacity:0.55+(i%3)*0.12, glow:8, twinkle:true, dur:1.6+i*0.4, color });
  }
  // constellation node stars
  const nodes: [number,number][] = [
    // Ursa Mică — cupă
    [4,13],[12,12],[13,20],[5,21],
    // Ursa Mică — mâner
    [16,30],[18,41],
    // Triunghi dreapta
    [82,58],[88,52],[92,60],
  ];
  for (const [x,y] of nodes)
    out.push({ x, y, size:2.0, opacity:0.72, glow:6, twinkle:true, dur:2.8, color:"220,200,255" });
  // Polaris — capătul mânerului, cea mai strălucitoare
  out.push({ x:17, y:53, size:3.4, opacity:0.98, glow:14, twinkle:true, dur:3.2, color:"255,245,200" });
  return out;
})();

export function HeroScene() {
  const reduce    = useReducedMotion();
  const rocketRef = useRef<HTMLDivElement>(null);
  const [dots,   setDots]   = useState<CommitDot[]>([]);
  const [shoots, setShoots] = useState<ShootingStar[]>([]);

  // ── orbit rAF loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    let lastEmit = 0, raf = 0, dotId = 0, smoothRot = 0, hasRot = false;

    const tick = (now: number) => {
      const p  = orbitPos(now - start);
      const el = rocketRef.current;
      if (el) {
        const tgt  = p.rotateDeg + 90;
        const bank = -Math.cos(p.a) * 8;
        if (!hasRot) { smoothRot = tgt; hasRot = true; }
        else smoothRot += shortestAngleDelta(smoothRot, tgt) * 0.12;
        el.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px) rotate(${smoothRot + bank}deg)`;
        el.style.zIndex    = p.behind ? "25" : "35";
      }
      if (now - lastEmit > DOT_EMIT_MS) {
        lastEmit = now;
        setDots(prev => {
          const alive = prev.filter(d => now - d.born < DOT_LIFETIME);
          const next  = [...alive, { id: ++dotId, x: p.x - p.ux * TAIL_OFFSET, y: p.y - p.uy * TAIL_OFFSET, born: now }];
          return next.length > DOT_MAX ? next.slice(-DOT_MAX) : next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  // ── occasional shooting stars ────────────────────────────────────────────
  useEffect(() => {
    if (reduce) return;
    let uid = 0;
    const fire = () => {
      const id = ++uid;
      setShoots(p => [...p, {
        id,
        x: 10 + Math.random() * 70,
        y: 5  + Math.random() * 40,
        angle: 28 + Math.random() * 18,
      }]);
      setTimeout(() => setShoots(p => p.filter(s => s.id !== id)), 900);
    };
    // fire once early, then every 5-9 s
    const t0 = setTimeout(fire, 1800);
    const interval = setInterval(fire, 5000 + Math.random() * 4000);
    return () => { clearTimeout(t0); clearInterval(interval); };
  }, [reduce]);

  return (
    <>
      {/* Background layer: stars, nebula, trail — clipped, stays behind card (z-10) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Starfield />

        {/* ── nebula aurora blobs ── */}
        <div
          className="absolute left-1/2 top-[38%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(ellipse at 40% 50%, oklch(0.55 0.25 295 / 0.5), transparent 68%)",
            filter: "blur(48px)",
            animation: "nebula-drift 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute left-[58%] top-[50%] h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse at 55% 45%, oklch(0.65 0.22 145 / 0.45), transparent 65%)",
            filter: "blur(40px)",
            animation: "nebula-drift 30s ease-in-out infinite reverse",
          }}
        />

        {/* ── commit-graph branch lines ── */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.13]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <linearGradient id="bg" x1="0" x2="1">
              <stop offset="0"   stopColor="var(--violet-glow)" stopOpacity="0" />
              <stop offset="0.5" stopColor="var(--violet-glow)" stopOpacity="0.55" />
              <stop offset="1"   stopColor="var(--commit-green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="url(#bg)" strokeWidth="1" fill="none">
            <path d="M-20 200 C200 180,320 260,520 240 S880 180,1100 220 S1380 260,1500 240"/>
            <path d="M-20 720 C240 700,380 760,600 740 S960 700,1180 740 S1440 760,1500 740"/>
            <path d="M200 0 C220 200,180 360,240 540 S280 800,260 920"/>
            <path d="M1180 0 C1160 220,1200 380,1140 560 S1100 820,1120 920"/>
          </g>
          <g fill="var(--commit-green)">
            <circle cx="520" cy="240" r="2.2"/><circle cx="880" cy="200" r="2.2"/>
            <circle cx="600" cy="740" r="2.2"/><circle cx="240" cy="540" r="2.2"/>
            <circle cx="1140" cy="560" r="2.2"/>
          </g>
        </svg>

        {/* ── moon glow ── */}
        <div className="absolute left-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ top: MOON_ANCHOR, background: "radial-gradient(closest-side, oklch(0.55 0.18 295 / 0.14), transparent 70%)", filter: "blur(32px)" }} />
        <div className="absolute left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ top: MOON_ANCHOR, background: "radial-gradient(closest-side, oklch(0.72 0.18 295 / 0.08), transparent 70%)", filter: "blur(12px)" }} />

        {/* ── commit dots (rocket exhaust trail) ── */}
        <div className="absolute left-1/2 z-10" style={{ top: MOON_ANCHOR }}>
          {dots.map(dot => (
            <span key={dot.id} className="commit-dot absolute block rounded-full"
              style={{
                width: 13, height: 13,
                transform: `translate(calc(${dot.x}px - 50%), calc(${dot.y}px - 50%))`,
                willChange: "transform, opacity",
                background: "oklch(0.88 0.32 145)",
                boxShadow: "0 0 14px 4px oklch(0.78 0.28 145 / 0.75), 0 0 6px 2px oklch(0.92 0.34 145 / 0.9)" }} />
          ))}
        </div>

        {/* ── shooting stars ── */}
        {shoots.map(s => (
          <span key={s.id} className="shooting-star absolute block"
            style={{
              left: 0, top: 0,
              width: 80, height: 1.5,
              borderRadius: 2,
              transform: `translate(${s.x}vw, ${s.y}vh) rotate(${s.angle}deg)`,
              willChange: "transform, opacity",
              background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.85) 50%, rgba(255,255,255,0))",
              boxShadow: "0 0 6px rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* Foreground layer: planet + rocket at z-[51], above nav (z-50) and card (z-10), pointer-events-none keeps everything clickable */}
      <div className="pointer-events-none absolute inset-0 z-[51]">
        {/* ── moon ── */}
        <motion.div className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2" style={{ top: MOON_ANCHOR }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moon.png" alt="" width={620} height={620}
            className="h-[clamp(240px,32vw,460px)] w-[clamp(240px,32vw,460px)] select-none opacity-92"
            style={{ filter: "drop-shadow(0 0 80px rgba(160,120,255,0.32)) drop-shadow(0 0 140px rgba(120,80,220,0.18))" }}
            draggable={false}
          />
        </motion.div>

        {/* ── cat rocket ── */}
        {reduce ? (
          <div className="absolute left-1/2 z-30" style={{ top: MOON_ANCHOR, transform: `translate(-50%,-50%) translate(${ORBIT_RX}px,${ORBIT_RY*0.4}px)` }}>
            <Rocket />
          </div>
        ) : (
          <div ref={rocketRef} className="absolute left-1/2 z-30 will-change-transform" style={{ top: MOON_ANCHOR, transform: INITIAL_ROCKET_TRANSFORM }}>
            <Rocket />
          </div>
        )}
      </div>
    </>
  );
}

// branch tip circles in cat-rocket.png as % of 1024×1024
const ROCKET_NODES: [number, number][] = [
  [74.7, 18.6],
  [84.3, 16.1],
  [91.0, 22.9],
  [71.3, 27.3],
  [88.5, 31.2],
];

function RocketCommitNodes() {
  const [lit, setLit] = useState<Set<number>>(new Set());

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const idx = Math.floor(Math.random() * ROCKET_NODES.length);
      setLit(prev => new Set([...prev, idx]));
      setTimeout(() => setLit(prev => { const n = new Set(prev); n.delete(idx); return n; }), 260 + Math.random() * 340);
      t = setTimeout(flash, 500 + Math.random() * 1100);
    };
    t = setTimeout(flash, 400 + Math.random() * 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ROCKET_NODES.map(([px, py], i) => (
        <span key={i} className="pointer-events-none absolute rounded-full"
          style={{
            left: `${px}%`, top: `${py}%`,
            width: 7, height: 7,
            marginLeft: -3.5, marginTop: -3.5,
            background: lit.has(i) ? "oklch(0.88 0.32 145)" : "transparent",
            boxShadow: lit.has(i)
              ? "0 0 12px 4px oklch(0.78 0.28 145 / 0.85), 0 0 5px 1px oklch(0.92 0.36 145)"
              : "none",
            transition: "background 0.1s ease, box-shadow 0.1s ease",
          }}
        />
      ))}
    </>
  );
}

function Rocket() {
  return (
    <div className="relative grid place-items-center rounded-full" style={{ width: "clamp(120px,14vw,195px)", height: "clamp(120px,14vw,195px)" }}>
      <div className="absolute inset-[8%] rounded-full blur-2xl opacity-75"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--commit-green) 40%, transparent), transparent 60%)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cat-rocket.png" alt="Cat astronaut in cardboard rocket" width={1024} height={1024}
        className="relative h-full w-full select-none object-contain"
        style={{ filter: "drop-shadow(0 0 28px rgba(190,160,255,0.75)) drop-shadow(0 20px 46px rgba(80,255,160,0.24))" }}
        draggable={false}
      />
      <RocketCommitNodes />
    </div>
  );
}

function Starfield() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(ellipse at 50% 28%, color-mix(in oklab,var(--violet-glow) 13%,transparent),transparent 58%)," +
          "radial-gradient(ellipse at 78% 88%, color-mix(in oklab,var(--commit-green) 9%,transparent),transparent 55%)," +
          "var(--space-deep)",
      }} />
      {/* constellation lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {CONSTELLATIONS.map((pts, ci) =>
          pts.slice(1).map((p, i) => (
            <line key={`${ci}-${i}`}
              x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]}
              stroke="rgba(180,160,255,0.22)" strokeWidth="0.18"
            />
          ))
        )}
      </svg>
      {STAR_DATA.map((st, i) => (
        <span key={i}
          className={st.twinkle ? "absolute rounded-full star-twinkle" : "absolute rounded-full"}
          style={{
            left: `${st.x}%`, top: `${st.y}%`,
            width: `${st.size}px`, height: `${st.size}px`,
            opacity: st.opacity,
            background: `rgb(${st.color})`,
            boxShadow: st.glow > 0 ? `0 0 ${st.glow}px rgba(${st.color},${st.opacity})` : undefined,
            ["--tw-dur" as string]: st.twinkle ? `${st.dur}s` : undefined,
            animationDelay: st.twinkle ? `${(i*0.19)%3}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
