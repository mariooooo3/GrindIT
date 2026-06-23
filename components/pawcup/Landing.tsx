"use client";

import Image from "next/image";
import { useMemo, useState, useRef, useCallback } from "react";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import logo from "@/components/pawcup/assets/logo3.asset.json";
import catMascot from "@/components/pawcup/assets/cat-mascot.asset.json";

function FootballPixelTitle({ isLoggedIn }: { isLoggedIn: boolean }) {
  const line1 = "ALL TIME";
  const line2 = "WRAPPER";

  return (
    <div className="relative select-none text-left">
      <div className="absolute -left-3 -top-4 h-5 w-2 rounded-sm bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" />
      <div
        className="relative rounded-[9px] border border-emerald-200/14 bg-[#07120c]/68 px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.34),inset_0_0_0_1px_rgba(255,255,255,0.025),inset_0_1px_0_rgba(255,255,255,0.05)]"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-[8px] font-black uppercase tracking-[0.28em] text-emerald-200/55">Sub board</span>
          <span
            className="rounded bg-emerald-300/8 px-2 py-0.5 text-[8px] font-black tabular-nums text-emerald-100/70"
            style={{ animation: "wc-score-blink 1.6s ease-in-out infinite" }}
          >
            90+4
          </span>
        </div>

        {/* Scrolling scanlines — translateY instead of background-position (GPU) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.1]">
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: "calc(100% + 6px)",
              background: "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(52,211,153,0.28) 5px, rgba(52,211,153,0.28) 6px)",
              animation: "wc-scanlines 6s linear infinite",
              willChange: "transform",
            }}
          />
        </div>

        <div className="relative overflow-hidden">
          {/* Shimmer sweep — translateX instead of left (GPU) */}
          <div
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{
              left: 0,
              background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.09) 50%, transparent)",
              animation: "wc-shimmer 3.8s ease-in-out infinite",
              willChange: "transform",
            }}
          />

          <div
            className="font-black uppercase leading-[0.84] tracking-[-0.06em] text-white"
            style={{
              fontSize: "clamp(34px, 4.1vw, 62px)",
              animation: "wc-glow-pulse 2.6s ease-in-out infinite",
            }}
          >
            {/* Line 1 — letter flip-in */}
            <div style={{ perspective: "400px" }}>
              {line1.split("").map((ch, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    animation: `wc-letter-flip 0.42s ${i * 0.065}s both`,
                    willChange: "transform, opacity",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
            {/* Line 2 — letter flip-in, offset after line1 */}
            <div style={{ perspective: "400px" }}>
              {line2.split("").map((ch, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    animation: `wc-letter-flip 0.42s ${line1.length * 0.065 + i * 0.065 + 0.12}s both`,
                    willChange: "transform, opacity",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${
                isLoggedIn
                  ? "border-emerald-300/45 bg-emerald-300/12 text-emerald-200"
                  : "border-amber-300/35 bg-amber-300/10 text-amber-200"
              }`}
              style={{ animation: "wc-badge-pulse 2.4s ease-in-out infinite" }}
            >
              {isLoggedIn ? "UNLOCKED" : "SUB IN 90+4"}
            </span>
            <span className="h-px w-14 bg-gradient-to-r from-emerald-200/40 to-transparent" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wc-letter-flip {
          0%   { opacity: 0; transform: rotateX(90deg) scaleY(0.5); }
          60%  { opacity: 1; transform: rotateX(-8deg) scaleY(1.04); }
          100% { opacity: 1; transform: rotateX(0deg) scaleY(1); }
        }
        @keyframes wc-glow-pulse {
          0%, 100% { text-shadow: 0 0 8px rgba(52,211,153,0.26), 0 0 18px rgba(250,204,21,0.18), 0 8px 22px rgba(0,0,0,0.5); }
          50%       { text-shadow: 0 0 18px rgba(52,211,153,0.60), 0 0 36px rgba(250,204,21,0.40), 0 0 52px rgba(52,211,153,0.22), 0 8px 22px rgba(0,0,0,0.5); }
        }
        @keyframes wc-score-blink {
          0%, 42%, 100% { opacity: 1; }
          48%, 96%      { opacity: 0.18; }
        }
        @keyframes wc-badge-pulse {
          0%, 100% { opacity: 1;    box-shadow: 0 0 0 0 rgba(52,211,153,0.0); }
          50%      { opacity: 0.82; box-shadow: 0 0 0 5px rgba(52,211,153,0.18); }
        }
        @keyframes wc-scanlines {
          from { transform: translateY(0); }
          to   { transform: translateY(-6px); }
        }
        @keyframes wc-shimmer {
          0%        { transform: translateX(-100%); }
          55%, 100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  );
}

function Fireworks() {
  const bursts = useMemo(() => [
    { x: 28, y: 28, color: "#facc15", delay: 0,   dur: 3.2 },
    { x: 70, y: 20, color: "#34d399", delay: 1.2, dur: 2.8 },
    { x: 52, y: 62, color: "#f472b6", delay: 2.1, dur: 3.5 },
    { x: 18, y: 48, color: "#38bdf8", delay: 0.7, dur: 3.0 },
  ], []);
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <div className="pointer-events-none absolute inset-0">
      {bursts.map((b, bi) => (
        <div key={bi} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          <div style={{
            position: "absolute", width: 4, height: 4, borderRadius: "50%",
            background: b.color, transform: "translate(-50%,-50%)",
            boxShadow: `0 0 6px ${b.color}`,
            animation: `fw-center ${b.dur}s ${b.delay}s ease-out infinite`,
          }} />
          {angles.map((angle, ai) => (
            <div key={ai} style={{
              position: "absolute", top: 0, left: 0,
              transform: `translate(-50%,-50%) rotate(${angle}deg)`,
            }}>
              <div style={{
                width: 2, height: 2, borderRadius: "50%",
                background: b.color, boxShadow: `0 0 3px ${b.color}`,
                animation: `fw-ray ${b.dur}s ${b.delay + 0.05}s ease-out infinite`,
              }} />
            </div>
          ))}
        </div>
      ))}
      <style>{`
        @keyframes fw-center {
          0%,100%{opacity:0;transform:translate(-50%,-50%) scale(0)}
          6%{opacity:1;transform:translate(-50%,-50%) scale(3)}
          18%{opacity:0.6;transform:translate(-50%,-50%) scale(1.2)}
          32%{opacity:0;transform:translate(-50%,-50%) scale(0.4)}
        }
        @keyframes fw-ray {
          0%,5%,100%{opacity:0;transform:translateY(0)}
          12%{opacity:1;transform:translateY(-3px)}
          55%{opacity:0.5;transform:translateY(-13px)}
          78%{opacity:0;transform:translateY(-18px)}
        }
      `}</style>
    </div>
  );
}

function BallTelevision() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<"playing" | "fading" | "replay" | "fading-in">("playing");
  const prevTimeRef = useRef(0);
  const replayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeInStartRef = useRef(0);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    const o = overlayRef.current;
    if (!v || !v.duration || !o) return;

    const t = v.currentTime;
    const d = v.duration;
    const prev = prevTimeRef.current;
    prevTimeRef.current = t;
    const phase = phaseRef.current;

    // Detect loop: jumped from near end back to beginning
    if (prev > d - 0.8 && t < 0.5 && phase === "fading") {
      phaseRef.current = "replay";
      o.style.opacity = "1";
      const txt = textRef.current;
      if (txt) txt.style.opacity = "1"; // CSS transition handles fade-in
      if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = setTimeout(() => {
        phaseRef.current = "fading-in";
        fadeInStartRef.current = Date.now();
        const t2 = textRef.current;
        if (t2) t2.style.opacity = "0"; // CSS transition handles fade-out
      }, 1500);
      return;
    }

    if (phase === "replay") {
      o.style.opacity = "1";
      return;
    }

    if (phase === "fading-in") {
      const elapsed = (Date.now() - fadeInStartRef.current) / 1000;
      const p = Math.min(elapsed / 1.4, 1);
      const eased = 1 - (1 - p) * (1 - p);
      o.style.opacity = String(1 - eased);
      if (elapsed >= 1.4) phaseRef.current = "playing";
      return;
    }

    // "playing" — fade to black near end
    const fadeZone = 0.7;
    if (d - t < fadeZone) {
      phaseRef.current = "fading";
      o.style.opacity = String((1 - (d - t) / fadeZone) * 0.95);
    } else {
      phaseRef.current = "playing";
      o.style.opacity = "0";
    }
  }, []);

  return (
    <div className="relative h-[300px] w-[230px]">
      <div
        className="absolute -inset-x-8 top-0 h-[230px] rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(250,204,21,0.28), rgba(168,85,247,0.2) 48%, transparent 72%)" }}
      />
      <div
        className="relative h-[230px] w-[230px] overflow-hidden rounded-full border border-white/25 bg-white shadow-[0_28px_70px_rgba(0,0,0,0.62),inset_-18px_-24px_42px_rgba(0,0,0,0.28),inset_12px_12px_24px_rgba(255,255,255,0.85)]"
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 230 230" aria-hidden>
          <defs>
            <clipPath id="landingBallClip">
              <circle cx="115" cy="115" r="115" />
            </clipPath>
            <radialGradient id="landingBallShade" cx="36%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="58%" stopColor="#eef2f7" />
              <stop offset="100%" stopColor="#b9c0cb" />
            </radialGradient>
          </defs>
          <circle cx="115" cy="115" r="115" fill="url(#landingBallShade)" />
          <g clipPath="url(#landingBallClip)" fill="none" strokeLinecap="round">
            <path d="M112 120 C 132 75 68 64 78 18 C 84 -12 42 -24 -12 -6" stroke="#c8163d" strokeWidth="28" />
            <path d="M112 120 C 132 75 68 64 78 18 C 84 -12 42 -24 -12 -6" stroke="#1f9d4d" strokeWidth="28" transform="rotate(120 115 115)" />
            <path d="M112 120 C 132 75 68 64 78 18 C 84 -12 42 -24 -12 -6" stroke="#1d7fe0" strokeWidth="28" transform="rotate(240 115 115)" />
          </g>
          <g clipPath="url(#landingBallClip)" fill="none" stroke="#222631" strokeLinecap="round" opacity="0.42">
            <path d="M16 88 Q 115 48 214 88" strokeWidth="2.2" />
            <path d="M16 142 Q 115 182 214 142" strokeWidth="2.2" />
            <path d="M82 8 Q 46 115 82 222" strokeWidth="2" />
            <path d="M148 8 Q 184 115 148 222" strokeWidth="2" />
          </g>
          <ellipse cx="78" cy="66" rx="38" ry="24" fill="#ffffff" opacity="0.42" transform="rotate(-26 78 66)" />
        </svg>
        <div className="absolute left-1/2 top-1/2 h-[112px] w-[144px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border-[5px] border-zinc-950 bg-black shadow-[0_0_0_2px_rgba(255,255,255,0.22),inset_0_0_18px_rgba(0,0,0,0.9)]">
          <video
            ref={videoRef}
            src="/1.mp4"
            autoPlay loop muted playsInline
            onTimeUpdate={handleTimeUpdate}
            className="h-full w-full object-cover opacity-85"
          />
          <Fireworks />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.07) 4px, rgba(255,255,255,0.07) 5px)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.22),transparent_42%)]" />
          <div ref={overlayRef} className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
          <div
            ref={textRef}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1"
            style={{ opacity: 0, transition: "opacity 0.7s ease-in-out" }}
          >
            <div className="flex items-center gap-1">
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", animation: "replay-blink 0.8s ease-in-out infinite" }} />
              <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.18em", fontFamily: "Arial Black, sans-serif" }}>REC</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.06em", fontFamily: "Arial Black, sans-serif", lineHeight: 1.0, textAlign: "center", textShadow: "0 0 14px rgba(255,255,255,0.6)" }}>
              INSTANT<br />REPLAY
            </div>
            <div style={{ width: "55%", height: 1.5, background: "#facc15" }} />
            <div style={{ fontSize: 6, color: "#facc15", letterSpacing: "0.22em", fontFamily: "monospace" }}>WORLD CUP 2026</div>
          </div>
          <style>{`@keyframes replay-blink { 0%,100%{opacity:1} 50%{opacity:0.15} }`}</style>
        </div>
      </div>
      <div className="absolute left-[72px] top-[215px] h-16 w-4 rotate-[9deg] rounded-full bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
      <div className="absolute right-[72px] top-[215px] h-16 w-4 rotate-[-9deg] rounded-full bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
    </div>
  );
}

function Index({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [confetti] = useState(() =>
    Array.from({ length: 70 }).map((_, i) => {
      const duration = 4 + Math.random() * 6;
      return {
        left: Math.random() * 100,
        duration,
        negDelay: -(Math.random() * duration),
        size: 6 + Math.random() * 8,
        color: ["#a855f7", "#facc15", "#22d3ee", "#f472b6", "#ffffff", "#34d399"][i % 6],
        shape: i % 3,
      };
    })
  );

  const [stars] = useState(() => Array.from({ length: 30 }).map(() => ({ x: Math.random() * 100, y: Math.random() * 40, d: Math.random() * 3 })));

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${stadium.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* purple vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-transparent to-purple-950/60 pointer-events-none" />

      {/* twinkling stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: 2, height: 2, animationDelay: `${s.d}s`, willChange: "opacity" }}
        />
      ))}

      {/* Top header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center px-8 py-6">
        <Image src={logo.url} alt="GitHub Wrapped" width={48} height={48} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur p-1 ring-2 ring-purple-400/60" unoptimized />
      </header>

      <div className="pointer-events-none absolute left-[6vw] top-[58%] z-20 hidden -translate-y-1/2 xl:block">
        <FootballPixelTitle isLoggedIn={isLoggedIn} />
      </div>

      <div className="pointer-events-none absolute right-[12vw] top-[66%] z-20 hidden -translate-y-1/2 xl:block">
        <BallTelevision />
      </div>

      {/* Mascot - Black Cat */}
      <div className="absolute left-1/2 bottom-[6%] -translate-x-1/2 z-10">
        <Image
          src={catMascot.url}
          alt="Purple Paws mascot"
          width={1024}
          height={1024}
          className="h-[70vh] w-auto drop-shadow-[0_30px_40px_rgba(168,85,247,0.5)]"
          unoptimized
        />
      </div>

      {/* Spotlight */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[600px] h-[400px] z-[5] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(168,85,247,0.45), transparent 70%)",
        }}
      />

      {/* Confetti */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden" style={{ contain: "layout style paint" }}>
        {confetti.map((c, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${c.left}%`,
              top: "-20px",
              width: c.size,
              height: c.size * 0.4,
              background: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.negDelay}s`,
              borderRadius: c.shape === 0 ? "2px" : c.shape === 1 ? "50%" : "0",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes confetti-fall {
          0%   { transform: rotate(0deg); opacity: 1; }
          100% { transform: translateY(115vh) rotate(720deg); opacity: 0.7; }
        }
        .animate-confetti { animation: confetti-fall linear infinite; }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default Index;
