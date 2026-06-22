"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import champion from "@/components/pawcup/assets/champion-cat.png.asset.json";
import stadiumCelebration from "@/components/pawcup/assets/stadium-celebration.jpg.asset.json";
import catGrey from "@/components/pawcup/assets/cat-grey.png.asset.json";
import catWhite from "@/components/pawcup/assets/cat-white.png.asset.json";
import catBrown from "@/components/pawcup/assets/cat-brown.png.asset.json";
import catSilver from "@/components/pawcup/assets/cat-silver.png.asset.json";

function TrophyGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
      <path d="M9 19h6M12 14v5" />
    </svg>
  );
}

// Deterministic RNG so SSR and client output match (no hydration mismatch)
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const r1 = seeded(770077);
const STARS = Array.from({ length: 40 }).map(() => ({
  x: r1() * 100, y: r1() * 100, d: r1() * 3, s: 1 + r1() * 2,
}));
const r2 = seeded(330033);
const CONFETTI = Array.from({ length: 28 }).map(() => ({
  x: r2() * 100,
  d: r2() * 6,
  dur: 5 + r2() * 5,
  c: ["#facc15", "#a855f7", "#ec4899", "#22d3ee", "#ffffff"][Math.floor(r2() * 5)],
  rot: r2() * 360,
}));
const SCREEN_FW = [
  { x: 12, y: 18, d: 0,    c: "#facc15", size: 72,  n: 16 },
  { x: 82, y: 12, d: 0.95, c: "#a855f7", size: 58,  n: 14 },
  { x: 48, y: 8,  d: 1.8,  c: "#ec4899", size: 86,  n: 16 },
  { x: 22, y: 55, d: 2.7,  c: "#22d3ee", size: 64,  n: 14 },
  { x: 74, y: 50, d: 0.5,  c: "#facc15", size: 78,  n: 16 },
  { x: 92, y: 30, d: 1.4,  c: "#a855f7", size: 52,  n: 12 },
  { x: 8,  y: 38, d: 2.1,  c: "#ec4899", size: 68,  n: 14 },
  { x: 60, y: 22, d: 0.7,  c: "#22d3ee", size: 60,  n: 14 },
  { x: 36, y: 32, d: 1.6,  c: "#facc15", size: 74,  n: 16 },
  { x: 88, y: 68, d: 1.1,  c: "#a855f7", size: 54,  n: 12 },
  { x: 44, y: 72, d: 3.0,  c: "#ec4899", size: 66,  n: 14 },
  { x: 5,  y: 65, d: 1.3,  c: "#22d3ee", size: 58,  n: 12 },
  { x: 67, y: 78, d: 2.3,  c: "#facc15", size: 70,  n: 14 },
  { x: 30, y: 15, d: 0.3,  c: "#a855f7", size: 62,  n: 14 },
];

function Slide7({ profile }: { profile?: WrappedProfile }) {
  const { username, caption } = useMemo(() => {
    if (!profile) return { username: null as string | null, caption: null as string | null };
    const flat = mapToFlat(profile);
    const nightRatio = flat.totalCommits > 0 ? flat.nightCommits / flat.totalCommits : 0;
    const cap = profile.narrative?.shareCaption ?? buildFallbackNarrative({
      username: flat.username,
      archetype: flat.archetype,
      archetypeId: profile.archetypeBlend.primary.id,
      primaryWeight: profile.archetypeBlend.primary.weight,
      totalCommits: flat.totalCommits,
      longestStreak: flat.longestStreak,
      currentStreak: flat.currentStreak,
      peakHour: flat.peakHour,
      topLanguage: flat.topLanguages[0]?.name ?? "code",
      topRepo: flat.topRepos[0]?.name ?? "your repo",
      nightRatio,
      prsMerged: flat.pullRequests.merged,
      totalRepos: flat.totalRepos,
      periodLabel: flat.period.label,
    }, profile.tone).shareCaption;
    return { username: flat.username, caption: cap };
  }, [profile]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0b0418]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(11,4,24,0.85), rgba(11,4,24,0.95)), url(${stadium.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-3xl" />

      {STARS.map((st, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
      ))}
      {CONFETTI.map((c, i) => (
        <div key={`c-${i}`} className="absolute top-[-20px] w-2 h-3 animate-confetti-fall"
          style={{ left: `${c.x}%`, background: c.c, animationDelay: `${c.d}s`, animationDuration: `${c.dur}s`, transform: `rotate(${c.rot}deg)` }} />
      ))}

      {/* screen-wide fireworks */}
      {SCREEN_FW.map((f, i) => {
        const sparkLen = f.size * 0.52;
        const angles = Array.from({ length: f.n }, (_, j) => (360 / f.n) * j);
        return (
          <div key={`sfw-${i}`} className="absolute pointer-events-none z-[5]"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}>
            {/* outer ring */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-fw-ring"
              style={{ width: f.size * 1.35, height: f.size * 1.35, border: `1px solid ${f.c}`, animationDelay: `${f.d + 0.08}s`, opacity: 0.35 }} />
            {/* main ring */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-fw-ring"
              style={{ width: f.size, height: f.size, border: `2px solid ${f.c}`, boxShadow: `0 0 8px ${f.c}88`, animationDelay: `${f.d}s` }} />
            {/* inner ring */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-fw-ring"
              style={{ width: f.size * 0.48, height: f.size * 0.48, border: `1.5px solid ${f.c}`, animationDelay: `${f.d + 0.2}s`, opacity: 0.75 }} />
            {/* center burst — white core fading to color */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-fw-burst"
              style={{ width: 16, height: 16, background: "#fff", boxShadow: `0 0 16px 6px #fff, 0 0 36px 14px ${f.c}`, animationDelay: `${f.d}s` }} />
            {/* directional sparks — each rotated via CSS var so animation works */}
            {angles.map((angle, j) => {
              const isThick = j % 2 === 0;
              return (
                <div key={j} className="absolute animate-fw-spark"
                  style={{
                    "--angle": `${angle}deg`,
                    left: "50%",
                    top: "50%",
                    marginLeft: isThick ? -1.5 : -1,
                    marginTop: -sparkLen,
                    width: isThick ? 3 : 1.5,
                    height: sparkLen,
                    background: isThick
                      ? `linear-gradient(to top, ${f.c}, #fff 65%, transparent)`
                      : `linear-gradient(to top, ${f.c}99, transparent)`,
                    transformOrigin: "50% 100%",
                    borderRadius: 2,
                    animationDelay: `${f.d}s`,
                    boxShadow: isThick ? `0 0 4px ${f.c}` : "none",
                  } as React.CSSProperties} />
              );
            })}
          </div>
        );
      })}

      {/* ====== LEFT: champion cat on podium with teammates ====== */}
      <div className="absolute left-0 top-0 bottom-0 w-[34%] z-10">
        <div className="relative w-full h-full">
          {/* spotlights */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[140%] h-[80%] origin-top">
            <div className="absolute inset-0 bg-[conic-gradient(from_205deg_at_50%_0%,transparent_0deg,rgba(250,204,21,0.25)_25deg,transparent_55deg,rgba(168,85,247,0.25)_80deg,transparent_110deg)] animate-spot-sway" />
          </div>

          {/* aura glow behind champion */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[12%] w-[70%] h-[70%]">
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-3xl animate-glow-pulse" />
          </div>

          {/* all 5 cats on the podium — same height, evenly spaced */}
          <Teammate className="absolute z-10"
            style={{ left: "-4%", bottom: "22%", width: "28%" }}
            src={catGrey.url} delay="0.4s" />
          <Teammate className="absolute z-10"
            style={{ left: "16%", bottom: "22%", width: "28%" }}
            src={catWhite.url} delay="0.2s" />
          {/* center champion */}
          <div className="absolute z-20"
               style={{ left: "34%", bottom: "22%", width: "33%" }}>
            <Image
              src={champion.url}
              alt="Champion cat lifting the World Cup trophy"
              width={1024}
              height={1024}
              className="w-full h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.7)]"
              loading="lazy"
              unoptimized
            />
          </div>
          <Teammate className="absolute z-10"
            style={{ left: "56%", bottom: "22%", width: "28%" }}
            src={catBrown.url} delay="0.2s" />
          <Teammate className="absolute z-10"
            style={{ right: "-4%", bottom: "22%", width: "28%" }}
            src={catSilver.url} delay="0.4s" />

          {/* single-level uniform podium */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[19%] w-[96%] z-0">
            <div className="relative h-14 rounded-md bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-200/80 shadow-[0_0_40px_rgba(250,204,21,0.55)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-200/80" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-900/60" />
              <div className="absolute inset-x-3 top-2 bottom-2 flex justify-between opacity-60">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="w-[2px] bg-amber-900/70" />
                ))}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-4 py-1 rounded bg-purple-950 text-amber-300 text-[11px] font-black tracking-[0.4em] border border-amber-300/60 shadow">
                CHAMPIONS · 2026
              </div>
            </div>
            <div className="mx-auto mt-1 w-[92%] h-3 rounded-[50%] bg-black/60 blur-md" />
          </div>

          {/* caption */}
        </div>
      </div>

      {/* ====== RIGHT: next-day sports newspaper front page ====== */}
      <div className="absolute right-0 top-0 bottom-0 w-[32%] z-10 flex items-center justify-center">
        <div className="relative w-[60%] animate-paper-sway">
          {/* second sheet peeking out behind, for depth */}
          <div className="absolute inset-0 translate-x-[6px] translate-y-[10px] rotate-[3deg] rounded-[2px] bg-[#e5ddc8] shadow-xl" />
          <div className="absolute inset-0 translate-x-[3px] translate-y-[5px] rotate-[1.2deg] rounded-[2px] bg-[#ece3cd] shadow-lg" />

          {/* front page */}
          <div className="relative rounded-[2px] shadow-[0_34px_70px_rgba(0,0,0,0.65)] overflow-hidden"
               style={{ background: "#f3ecdc" }}>
            {/* paper grain */}
            <div className="absolute inset-0 opacity-[0.07] mix-blend-multiply pointer-events-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "120px" }} />
            {/* aged vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 55%, rgba(120,98,60,0.18) 100%)" }} />

            {/* "stop press" stamp */}
            <div className="absolute top-[18%] right-2 z-20 rotate-[18deg] rounded-sm border-2 border-red-700/80 px-1.5 py-[1px] text-red-700/90 text-[6px] font-black tracking-[0.2em]">
              EXTRA!
            </div>

            <div className="relative p-2.5">
              {/* masthead */}
              <div className="flex items-center justify-between text-zinc-600 text-[5px] font-bold tracking-[0.18em] pb-1">
                <span>VOL. XII · NO. 2026</span>
                <span>PRICE: 1 SARDINE</span>
              </div>
              <div className="border-y-2 border-zinc-900 py-1">
                <h1 className="text-center font-black tracking-tight text-zinc-900 text-[19px] font-serif">
                  THE&nbsp;PAW&nbsp;POST
                </h1>
              </div>
              <div className="text-center text-[5.5px] tracking-[0.32em] text-zinc-600 font-semibold py-1 border-b-2 border-zinc-900">
                WORLD CUP FINAL EDITION · JUNE 2026
              </div>

              {/* headline */}
              <h2 className="text-center font-black leading-[0.82] tracking-tight text-zinc-900 font-serif mt-2"
                  style={{ fontSize: "clamp(22px,7vw,34px)" }}>
                CHAMPIONS!
              </h2>
              <p className="text-center text-[16px] font-semibold italic leading-snug text-zinc-800 mt-1.5 mb-2 px-1">
                {caption ?? "Purple Paws FC stun the world, lift the trophy after a thrilling 2–1 final"}
              </p>

              {/* photo */}
              <div className="relative w-full aspect-[4/3] overflow-hidden border-2 border-zinc-900">
                <Image
                  src={stadiumCelebration.url}
                  alt="Packed stadium celebrating with fireworks and confetti"
                  width={1024}
                  height={1280}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "contrast(1.04) brightness(1.04) saturate(1.05)" }}
                  loading="lazy"
                  unoptimized
                />
                {/* faint halftone print dots — texture without muddying the image */}
                <div className="absolute inset-0 mix-blend-multiply opacity-[0.12]"
                  style={{ backgroundImage: "radial-gradient(circle, rgba(20,15,10,0.55) 0.5px, transparent 0.5px)", backgroundSize: "3.5px 3.5px" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(243,236,220,0) 84%, rgba(243,236,220,0.85) 100%)" }} />
              </div>
              <p className="text-[5px] italic text-zinc-600 mt-1 mb-2 leading-snug">
                Fans flood the pitch as the final whistle confirms history. — Staff photo
              </p>

              {/* two-column body copy (typographic filler, sells the print layout) */}
              <div className="grid grid-cols-2 gap-2 border-t border-zinc-400 pt-1.5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-zinc-900 mb-1">{username ? `By @${username}` : "By Our Pitch-side Correspondent"}</p>
                  <FakeTextLines seed={11} lines={7} />
                </div>
                <div>
                  <div className="border border-zinc-900 p-1.5 mb-1.5">
                    <div className="text-center text-[5px] font-bold tracking-[0.25em] text-zinc-600">FINAL SCORE</div>
                    <div className="text-center text-[13px] font-black text-zinc-900 leading-tight">GTH 2–1 WRP</div>
                  </div>
                  <FakeTextLines seed={37} lines={5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== CENTER CARD ====== */}
      <div data-wc-center-card className="absolute inset-0 z-20 flex items-center justify-center px-4 pointer-events-none">
        <div className="w-[440px] max-w-[90vw] rounded-3xl bg-[#161029]/85 backdrop-blur-xl border border-purple-400/20 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.5)] p-7 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 grid place-items-center text-purple-950 shadow-[0_0_30px_rgba(250,204,21,0.6)]">
              <TrophyGlyph />
            </div>
            <div>
              <div className="text-amber-300/80 text-[10px] tracking-[0.35em] font-semibold">WORLD CUP 2026</div>
              <div className="text-white text-2xl font-bold">Champions!</div>
            </div>
          </div>

          <p className="mt-5 text-white/80 text-sm leading-relaxed">
            <span className="text-amber-400 font-bold">Purple Paws FC</span> lift the cup! A dream season ends with cats on top of the world — gold around their necks and the trophy held to the sky.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">FINAL</div>
              <div className="text-white text-xl font-black mt-1">2-1</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">TITLES</div>
              <div className="text-amber-400 text-xl font-black mt-1">01</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">UNBEATEN</div>
              <div className="text-purple-300 text-xl font-black mt-1">7-0</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-500/30 to-fuchsia-600/30 border border-amber-400/40 p-3">
            <div className="text-amber-200/80 text-[9px] tracking-[0.3em]">GOLDEN PAW</div>
            <div className="text-white text-lg font-bold mt-1">@whiskermessi · 8 goals</div>
            <div className="text-purple-300/60 text-[10px] mt-1">Top scorer · Player of the tournament</div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-purple-950 rounded-full px-3 py-1 text-[10px] font-black tracking-widest">
              <span>07</span><span>·</span><span>CHAMPIONS</span>
            </div>
            <div className="text-amber-300/70 text-[10px] tracking-[0.3em]">FULL · TIME</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        @keyframes confetti-fall { 0%{transform:translateY(-10vh) rotate(0)} 100%{transform:translateY(110vh) rotate(720deg)} }
        .animate-confetti-fall { animation: confetti-fall linear infinite; }
        @keyframes spot-sway { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        .animate-spot-sway { animation: spot-sway 7s ease-in-out infinite; transform-origin: 50% 0%; }
        @keyframes glow-pulse { 0%,100%{opacity:.55} 50%{opacity:1} }
        .animate-glow-pulse { animation: glow-pulse 3.5s ease-in-out infinite; }
        @keyframes paper-sway { 0%,100%{transform:rotate(-2.5deg)} 50%{transform:rotate(-1.4deg)} }
        .animate-paper-sway { animation: paper-sway 6s ease-in-out infinite; }
        @keyframes fw-ring {
          0%   { transform: translate(-50%,-50%) scale(0.05); opacity: 1; }
          55%  { opacity: 0.85; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
        }
        .animate-fw-ring { animation: fw-ring 1.55s cubic-bezier(0.22,0.61,0.36,1) infinite; }
        @keyframes fw-burst {
          0%,8%  { transform: translate(-50%,-50%) scale(2.2); opacity: 1; }
          40%    { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          100%   { transform: translate(-50%,-50%) scale(0); opacity: 0; }
        }
        .animate-fw-burst { animation: fw-burst 1.55s ease-out infinite; }
        @keyframes fw-spark {
          0%   { transform: rotate(var(--angle,0deg)) scaleY(0); opacity: 1; }
          22%  { transform: rotate(var(--angle,0deg)) scaleY(1); opacity: 1; }
          65%  { transform: rotate(var(--angle,0deg)) scaleY(0.85); opacity: 0.65; }
          100% { transform: rotate(var(--angle,0deg)) scaleY(0.2); opacity: 0; }
        }
        .animate-fw-spark { animation: fw-spark 1.55s ease-out infinite; }
      `}</style>
    </div>
  );
}

function Teammate({ className, src, style }: { className?: string; src: string; delay: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <Image
        src={src}
        alt="Teammate cat celebrating"
        width={1024}
        height={1024}
        className="w-full h-auto drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)]"
        loading="lazy"
        unoptimized
      />
    </div>
  );
}

// Deterministic gray bars standing in for unreadable-at-this-scale print body copy.
function FakeTextLines({ seed, lines }: { seed: number; lines: number }) {
  const rnd = seeded(seed);
  const widths = Array.from({ length: lines }).map((_, i) =>
    i === lines - 1 ? 40 + rnd() * 20 : 78 + rnd() * 20
  );
  return (
    <div className="flex flex-col gap-[2.5px]">
      {widths.map((w, i) => (
        <div key={i} className="h-[3px] rounded-[1px] bg-zinc-700/35" style={{ width: `${Math.min(w, 100)}%` }} />
      ))}
    </div>
  );
}

export default Slide7;


