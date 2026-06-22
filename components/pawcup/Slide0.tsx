"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { buildFallbackNarrative } from "@/lib/fallbackNarrative";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import catSinger from "@/components/pawcup/assets/cat-singer.png.asset.json";
import trophy from "@/components/pawcup/assets/trophy-case.png.asset.json";
function Slide0({ profile }: { profile?: WrappedProfile }) {
  const intro = useMemo(() => {
    if (!profile) return null;
    const flat = mapToFlat(profile);
    const nightRatio = flat.totalCommits > 0 ? flat.nightCommits / flat.totalCommits : 0;
    return profile.narrative?.introVibeLine ?? buildFallbackNarrative({
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
    }, profile.tone).introVibeLine;
  }, [profile]);
  // Typewriter effect — plaque starts empty, text types in after the slide settles.
  // Re-triggers if intro changes (e.g. LLM response replaces the fallback).
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (!intro) { setDisplayedText(""); return; }
    setDisplayedText("");
    setIsTyping(false);
    let tick: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      let i = 0;
      setIsTyping(true);
      tick = setInterval(() => {
        i++;
        setDisplayedText(intro.slice(0, i));
        if (i >= intro.length) {
          if (tick) clearInterval(tick);
          tick = null;
          setIsTyping(false);
        }
      }, 28);
    }, 700);
    return () => {
      clearTimeout(start);
      if (tick) clearInterval(tick);
      setIsTyping(false);
    };
  }, [intro]);

  const [stars] = useState(() => Array.from({ length: 40 }).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 3, s: 1 + Math.random() * 2 })));
  const [sparks] = useState(() => Array.from({ length: 20 }).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 4 })));
  const [goldenSparkles] = useState(() => Array.from({ length: 14 }).map(() => ({ right: 10 + Math.random() * 70, top: 15 + Math.random() * 70, w: 2 + Math.random() * 3, h: 2 + Math.random() * 3, delay: Math.random() * 3 })));

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0b0418]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(11,4,24,0.85), rgba(11,4,24,0.95)), url(${stadium.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* purple ambient blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-3xl" />

      {/* stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
        />
      ))}

      {/* TOP HEADER */}

      {/* ====== LEFT: cat singer on stage ====== */}
      <div className="absolute left-0 top-0 bottom-0 w-[30%] z-10 pointer-events-none">
        {/* spotlights · aimed at cat */}
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            background: "linear-gradient(180deg, rgba(250,204,21,0.55) 0%, rgba(250,204,21,0.12) 70%, transparent 100%)",
            clipPath: "polygon(30% 0%, 44% 0%, 72% 100%, 48% 100%)",
            filter: "blur(6px)",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-[90%]"
          style={{
            background: "linear-gradient(180deg, rgba(168,85,247,0.50) 0%, rgba(168,85,247,0.10) 70%, transparent 100%)",
            clipPath: "polygon(22% 0%, 38% 0%, 65% 100%, 52% 100%)",
            filter: "blur(6px)",
            animation: "spot-sway 4s ease-in-out infinite",
          }}
        />

        {/* sparks */}
        {sparks.map((s, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-300 animate-twinkle"
            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}
          />
        ))}

        {/* stage floor reflection */}
        <div className="absolute inset-x-6 bottom-[6%] h-3 rounded-full bg-black/70 blur-md" />

        {/* speakers + white stands */}
        <div className="absolute left-[4%] bottom-[14%] flex flex-col items-center">
          <div className="w-10 h-20 rounded-md bg-black/80 border border-white/10">
            <div className="mx-auto mt-1 w-6 h-6 rounded-full bg-zinc-700 border border-zinc-500" />
            <div className="mx-auto mt-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600" />
          </div>
          {/* stand */}
          <div className="w-6 h-2 bg-gradient-to-b from-white to-gray-200 rounded-sm shadow-sm" />
          <div className="w-10 h-1.5 bg-gradient-to-b from-gray-100 to-white rounded-sm shadow" />
        </div>
        <div className="absolute right-[4%] bottom-[14%] flex flex-col items-center">
          <div className="w-10 h-20 rounded-md bg-black/80 border border-white/10">
            <div className="mx-auto mt-1 w-6 h-6 rounded-full bg-zinc-700 border border-zinc-500" />
            <div className="mx-auto mt-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600" />
          </div>
          {/* stand */}
          <div className="w-6 h-2 bg-gradient-to-b from-white to-gray-200 rounded-sm shadow-sm" />
          <div className="w-10 h-1.5 bg-gradient-to-b from-gray-100 to-white rounded-sm shadow" />
        </div>

        {/* singing cat · shifted toward the right of the stage */}
        <div className="absolute left-[50%] bottom-[8%] w-[64%] -translate-x-1/2 origin-bottom">
          <Image
            src={catSinger.url}
            alt="Black cat in tuxedo singing on stage"
            width={1024}
            height={1024}
            className="block w-full h-auto mx-auto"
            unoptimized
          />
        </div>

        {/* music notes */}
        <div className="absolute left-[58%] top-[32%] text-amber-300 text-2xl animate-note-rise" style={{ animationDelay: "0s" }}>{"\u266A"}</div>
        <div className="absolute left-[68%] top-[40%] text-pink-300 text-xl animate-note-rise" style={{ animationDelay: "1.2s" }}>{"\u266B"}</div>
        <div className="absolute left-[50%] top-[26%] text-cyan-300 text-lg animate-note-rise" style={{ animationDelay: "2.4s" }}>{"\u2669"}</div>
        <div className="absolute left-[72%] top-[34%] text-purple-300 text-2xl animate-note-rise" style={{ animationDelay: "0.6s" }}>{"\u266C"}</div>

        {/* caption */}
      </div>

      {/* ====== RIGHT: trophy in display case ====== */}
      <div className="absolute right-0 top-0 bottom-0 w-[28%] z-10">
        <div className="relative w-full h-full">
          {/* glowing aura */}
          <div className="absolute right-[10%] top-[20%] w-[80%] h-[60%] rounded-full bg-amber-400/20 blur-3xl animate-pulse-slow" />
          <div className="absolute right-[15%] top-[28%] w-[60%] h-[50%] rounded-full bg-purple-500/25 blur-3xl" />

          {/* trophy + stand */}
          <div className="absolute left-[82%] -translate-x-1/2 top-[33%] flex flex-col items-center w-[82%] animate-float-slow">
            {/* trophy image */}
              <div className="relative z-10 w-full">
                <Image
                  src={trophy.url}
                  alt="World Cup trophy in glass display case"
                  width={1024}
                  height={1024}
                  className="w-full h-auto drop-shadow-[0_30px_40px_rgba(250,204,21,0.35)]"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute left-1/2 top-[66%] h-[7%] w-[18%] -translate-x-1/2 rounded-full"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(222,180,78,0.98) 0%, rgba(204,146,38,0.94) 62%, rgba(204,146,38,0.18) 100%)",
                    filter: "blur(2px)",
                  }}
                />
 {/* glass shine sweep */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 overflow-hidden rounded-2xl" style={{height:"70%"}}>
                  <div className="absolute -inset-y-4 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-12 animate-shine" />
                </div>
              </div>
            {/* pedestal · trophy sits on this */}
            <div className="w-[58%] -mt-12 z-0">
              <div className="h-3 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 rounded-t-sm" />
              <div className="relative h-12 bg-gradient-to-b from-[#3a1d6e] via-[#26124a] to-[#150826] border-x-2 border-amber-500/60 flex items-center justify-center">
                <div className="absolute inset-0 flex justify-around px-3 opacity-60">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-[2px] bg-gradient-to-b from-amber-300/60 to-transparent" />
                  ))}
                </div>
                <span className="relative text-amber-300 text-[9px] font-black tracking-[0.3em]">2026</span>
              </div>
              <div className="h-3 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-300 rounded-b-sm" />
            </div>
            <div className="w-[70%] h-3 rounded-[50%] bg-black/50 blur-md mt-1" />
          </div>

          {/* engraved brass plaque on the trophy base — carries the intro line */}
          {intro && (
            <div className="absolute left-[41%] top-[19%] w-[95%] max-w-[400px] -translate-x-1/2">
              <div className="relative overflow-hidden rounded-md px-5 py-3 text-center"
                style={{
                  background: "linear-gradient(160deg, #f8e8ad 0%, #e6c259 40%, #b5852e 100%)",
                  border: "1px solid rgba(110,72,18,0.6)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 5px rgba(110,72,18,0.55)",
                }}>
                {/* synchronized shine sweep — same timing as the trophy */}
                <div className="pointer-events-none absolute -inset-y-4 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-12 animate-shine" />
                <div className="text-[7.5px] font-black uppercase tracking-[0.3em] text-amber-950/70">★ Champion&apos;s Inscription ★</div>
                <p className="mt-1 min-h-[2.4em] font-serif text-[12.5px] font-semibold italic leading-snug text-amber-950"
                  style={{ textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}>
                  {displayedText}
                  {isTyping && (
                    <span className="animate-cursor-blink ml-[1px] inline-block w-[1.5px] align-middle bg-amber-950/70" style={{ height: "0.9em" }} />
                  )}
                </p>
              </div>
            </div>
          )}

          {/* golden sparkles */}
          {goldenSparkles.map((sp, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-300 animate-twinkle"
              style={{
                right: `${sp.right}%`,
                top: `${sp.top}%`,
                width: sp.w,
                height: sp.h,
                animationDelay: `${sp.delay}s`,
                boxShadow: "0 0 8px rgba(250,204,21,0.9)",
              }}
            />
          ))}

        </div>
      </div>

      {/* ====== CENTER: Opening card (same shell as captain card) ====== */}
      <div data-wc-center-card className="absolute inset-0 z-20 flex items-center justify-center px-4">
        <div className="translate-y-16 w-[440px] max-w-[90vw] rounded-3xl bg-[#161029]/85 backdrop-blur-xl border border-purple-400/20 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.5)] p-7">
          {/* header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-purple-950 font-black text-xl shadow-lg">
              {"\u{1F3C6}"}
            </div>
            <div>
              <div className="text-purple-300/70 text-[10px] tracking-[0.35em] font-semibold">OPENING · NIGHT</div>
              <div className="text-white text-2xl font-bold">World Cup 2026</div>
            </div>
          </div>

          {/* tagline */}
          <p className="mt-5 text-white/80 text-sm leading-relaxed">
            The greatest stage on earth begins - 48 nations - 3 host countries - 104 matches of pure magic <span className="text-yellow-400">{"\u2728"}</span>
          </p>

          {/* countdown / hero number */}
          <div className="mt-5">
            <div className="text-purple-300/70 text-[10px] tracking-[0.35em]">KICK · OFF</div>
            <div className="text-white font-black text-5xl leading-none mt-1">JUN 11</div>
          </div>

          {/* hype meter */}
          <div className="mt-5">
            <div className="text-purple-300/70 text-[10px] tracking-[0.35em] mb-3">CEREMONY VIBES</div>
            <Bar label="Confetti" value={100} color="from-pink-500 to-rose-500" />
            <Bar label="Cat singer" value={98} color="from-amber-400 to-orange-500" />
            <Bar label="Crowd roar" value={95} color="from-cyan-400 to-sky-500" />
          </div>

          {/* host nations */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">USA</div>
              <div className="text-white text-xl font-black">US</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">CAN</div>
              <div className="text-white text-xl font-black">CA</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">MEX</div>
              <div className="text-white text-xl font-black">MX</div>
            </div>
          </div>

          {/* footer pill */}
          <div className="mt-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-purple-950 rounded-full px-3 py-1 text-[10px] font-black tracking-widest">
              <span>00</span><span>·</span><span>OPENING</span>
            </div>
            <div className="text-purple-300/60 text-[10px] tracking-[0.3em]">LIVE · TONIGHT</div>
          </div>
        </div>
      </div>

      {/* footer */}

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        @keyframes float-slow { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
        .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
        @keyframes note-rise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-90px) scale(1.2); opacity: 0; }
        }
        .animate-note-rise { animation: note-rise 3s ease-out infinite; }
        @keyframes spot-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        @keyframes shine {
          0% { transform: translateX(-50%) rotate(12deg); }
          100% { transform: translateX(400%) rotate(12deg); }
        }
        .animate-shine { animation: shine 4s ease-in-out infinite; }
        @keyframes pulse-slow { 0%,100%{opacity:.5} 50%{opacity:.9} }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .animate-cursor-blink { animation: cursor-blink 0.7s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[11px] text-white/80 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default Slide0;


