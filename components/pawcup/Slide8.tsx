"use client";

import { useMemo } from "react";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import { determineAward, AwardIcon } from "@/lib/wc-award";
import type { WrappedProfile } from "@/types/wrapped";

const LEFT = [
  ["Argentina", "ar"], ["Austria", "at"], ["Australia", "au"], ["Belgium", "be"],
  ["Bosnia & Herz.", "ba"], ["Brazil", "br"], ["Canada", "ca"], ["Cape Verde", "cv"],
  ["Colombia", "co"], ["Croatia", "hr"], ["Curacao", "cw"], ["Czechia", "cz"],
  ["Ecuador", "ec"], ["Egypt", "eg"], ["England", "gb-eng"], ["France", "fr"],
  ["Germany", "de"], ["Ghana", "gh"], ["Haiti", "ht"], ["Iran", "ir"],
  ["Iraq", "iq"], ["Ivory Coast", "ci"], ["Japan", "jp"], ["Jordan", "jo"],
] as const;

const RIGHT = [
  ["Mexico", "mx"], ["Morocco", "ma"], ["Netherlands", "nl"], ["New Zealand", "nz"],
  ["Norway", "no"], ["Panama", "pa"], ["Paraguay", "py"], ["Portugal", "pt"],
  ["Qatar", "qa"], ["Saudi Arabia", "sa"], ["Scotland", "gb-sct"], ["Senegal", "sn"],
  ["South Africa", "za"], ["South Korea", "kr"], ["Spain", "es"], ["Sweden", "se"],
  ["Switzerland", "ch"], ["Tunisia", "tn"], ["Turkiye", "tr"], ["United States", "us"],
  ["Uruguay", "uy"], ["Uzbekistan", "uz"], ["Algeria", "dz"], ["DR Congo", "cd"],
] as const;

export default function Slide8({ profile, speech, speechLoading }: {
  profile?: WrappedProfile;
  speech: string | null;
  speechLoading: boolean;
}) {
  const award = useMemo(() => (profile ? determineAward(profile) : null), [profile]);

  const stars = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => {
        const rand = (n: number) => {
          const x = Math.sin(i * 9301 + n * 49297) * 233280;
          return x - Math.floor(x);
        };
        return { x: rand(1) * 100, y: rand(2) * 100, d: rand(3) * 3, s: 1 + rand(4) * 2 };
      }),
    [],
  );

  const startOver = () => {
    try { sessionStorage.removeItem("wrappedProfile"); } catch {}
    window.location.href = "/";
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#0b0418]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(11,4,24,0.85), rgba(11,4,24,0.95)), url(${stadium.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-3xl" />

      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
        />
      ))}

      <FlagColumn items={LEFT} side="left" />
      <FlagColumn items={RIGHT} side="right" />

      <div data-wc-center-card className="absolute inset-0 z-20 flex items-start justify-center px-4 pt-[96px] pointer-events-none sm:pt-[108px] lg:items-center lg:pt-0">
        {award && profile ? (
          <div
            className="relative w-[min(286px,82vw)] max-w-[82vw] overflow-hidden rounded-[26px] pointer-events-auto sm:w-[min(300px,84vw)] sm:max-w-[84vw] lg:w-[430px] lg:max-w-[90vw] lg:rounded-3xl"
            style={{
              background: "rgba(10,4,24,0.94)",
              border: `1px solid ${award.border}`,
              boxShadow: `0 30px 80px -20px ${award.glow}, 0 0 0 1px ${award.border}`,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, transparent, ${award.color}, transparent)` }}
            />

            {/* ambient glow blob */}
            <div
              className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full blur-3xl"
              style={{ background: award.glow }}
            />

            <div className="relative px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5 lg:p-6 lg:pb-5">
              {/* GrindIT logo — top right */}
              <div className="absolute right-4 top-4 pointer-events-none sm:right-5 sm:top-5">
                <span className="text-[16px] font-bold tracking-tight sm:text-[18px] lg:text-[20px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: award.color, textShadow: `0 0 14px ${award.color}aa` }}>G</span>rind<span style={{ color: award.color, textShadow: `0 0 14px ${award.color}aa` }}>IT</span>
                </span>
              </div>

              {/* header row */}
              <div>
                <div
                  className="mb-0.5 text-[7px] font-black tracking-[0.42em] sm:text-[8px] lg:text-[9px] lg:tracking-[0.55em]"
                  style={{ color: `${award.color}99` }}
                >
                  WORLD CUP 2026
                </div>
                <div
                  className="text-[9px] font-semibold tracking-[0.16em] sm:text-[10px] lg:text-[11px] lg:tracking-[0.22em]"
                  style={{ color: `${award.color}77` }}
                >
                  INDIVIDUAL AWARD
                </div>
              </div>

              {/* award name + badge aligned */}
              <div className="mt-3 flex items-center justify-between gap-2.5 sm:mt-4 sm:gap-3">
                <div>
                  <div
                    className="text-[22px] font-black leading-none tracking-tight sm:text-[24px] lg:text-[30px]"
                    style={{
                      color: award.color,
                      textShadow: `0 0 40px ${award.glow}`,
                    }}
                  >
                    {award.name}
                  </div>
                  <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:text-[10px] lg:text-[11px] lg:tracking-[0.25em]">
                    {award.subtitle}
                  </div>
                </div>
                {/* award icon — aligned with title */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 lg:h-14 lg:w-14 lg:rounded-2xl"
                  style={{
                    background: `${award.color}18`,
                    border: `1px solid ${award.border}`,
                    color: award.color,
                    boxShadow: `0 0 24px ${award.glow}`,
                  }}
                >
                  <AwardIcon id={award.id} className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                </div>
              </div>

              {/* recipient */}
              <div
                className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2 sm:mt-4 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-2.5"
                style={{
                  background: `${award.color}0d`,
                  border: `1px solid ${award.border}`,
                }}
              >
                {profile.user.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.user.avatarUrl}
                    alt={profile.user.login}
                    className="h-8 w-8 rounded-full ring-2 sm:h-9 sm:w-9"
                    style={{ "--tw-ring-color": award.color } as React.CSSProperties}
                    draggable={false}
                  />
                )}
                <div>
                  <div className="text-[8px] tracking-[0.22em] text-white/40 sm:text-[9px] lg:text-[10px] lg:tracking-[0.3em]">AWARDED TO</div>
                  <div className="text-[13px] font-bold text-white sm:text-[14px] lg:text-[15px]">@{profile.user.login}</div>
                </div>
              </div>

              {/* key stat */}
              <div
                className="mt-3 rounded-lg px-3 py-2.5 text-center sm:rounded-xl sm:px-4 sm:py-3"
                style={{
                  background: `linear-gradient(135deg, ${award.color}12, transparent)`,
                  border: `1px solid ${award.border}`,
                }}
              >
                <div className="mb-1 text-[7px] tracking-[0.28em] text-white/35 sm:text-[8px] lg:tracking-[0.4em]">KEY STAT</div>
                <div
                  className="text-[14px] font-black leading-tight sm:text-[15px] lg:text-[17px]"
                  style={{ color: award.color }}
                >
                  {award.keyStat(profile)}
                </div>
              </div>

              {/* LLM speech */}
              <div className="mt-3 min-h-[56px] sm:mt-4 sm:min-h-[64px] lg:min-h-[72px]">
                {speechLoading ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ background: award.color }}
                    />
                    <span className="text-[9px] tracking-[0.18em] text-white/30 sm:text-[10px] lg:tracking-widest">
                      PRESENTING AWARD…
                    </span>
                  </div>
                ) : speech ? (
                  <p className="text-[10px] leading-relaxed text-white/70 italic sm:text-[11px] lg:text-[12px]">
                    &ldquo;{speech}&rdquo;
                  </p>
                ) : (
                  <p className="text-[10px] leading-relaxed text-white/50 italic sm:text-[11px] lg:text-[12px]">
                    &ldquo;A performance for the ages. World Cup 2026 crowns its newest legend.&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* bottom accent bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${award.color}55, transparent)` }}
            />
          </div>
        ) : (
          /* fallback — no profile (shouldn't happen in WC mode) */
          <div className="relative w-[430px] min-h-[540px] max-w-[90vw] overflow-hidden rounded-3xl border border-amber-400/30 bg-[#0d0820]/92 p-6 backdrop-blur-xl">
            <div className="text-center text-amber-400 text-lg font-black tracking-widest">
              WORLD CUP 2026
            </div>
          </div>
        )}
      </div>

      <div data-share-ignore className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
        <button
          onClick={startOver}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-5 py-2 text-sm font-medium text-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Start over
        </button>
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        @keyframes flag-in { 0% { opacity: 0; transform: translateY(8px) scale(0.85); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .flag-in { animation: flag-in 0.5s ease-out both; }
        @keyframes flag-wave { 0%,100%{transform:translateY(0) rotate(-0.5deg)} 50%{transform:translateY(-2px) rotate(0.5deg)} }
        .flag-wave { animation: flag-wave 3.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function FlagColumn({ items, side }: { items: readonly (readonly [string, string])[]; side: "left" | "right" }) {
  return (
    <div className={`absolute top-[140px] bottom-[48px] z-10 w-[26%] px-5 pointer-events-none ${side === "left" ? "left-0" : "right-0"}`}>
      <div className="grid h-full grid-cols-4 content-start gap-0.5">
        {items.map(([name, code], i) => (
          <div
            key={code}
            className="flag-in flex flex-col items-center gap-0.5 rounded border border-white/10 bg-white/5 p-0.5 backdrop-blur-sm"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <div className="flag-wave aspect-[4/3] w-full overflow-hidden rounded-sm ring-1 ring-white/15 shadow-[0_1px_4px_rgba(0,0,0,0.5)]" style={{ animationDelay: `${(i % 6) * 0.2}s` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://flagcdn.com/w80/${code}.png`} alt={`${name} flag`} className="h-full w-full object-cover" loading="eager" crossOrigin="anonymous" draggable={false} />
            </div>
            <div className="w-full truncate text-center text-[7px] font-semibold leading-none tracking-wide text-white/85">
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
