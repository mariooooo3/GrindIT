"use client";

import Image from "next/image";
import { useState } from "react";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import catFans from "@/components/pawcup/assets/cat-fans.png.asset.json";
import catMascot from "@/components/pawcup/assets/cat-mascot.asset.json";

function Slide2() {
  const [stars] = useState(() => Array.from({ length: 40 }).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 3, s: 1 + Math.random() * 2 })));

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

      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
        />
      ))}

      {/* camera flash blits */}
      {[
        { x: 7,  y: 18, d: "0s",    s: 5 },
        { x: 22, y: 9,  d: "0.7s",  s: 4 },
        { x: 71, y: 11, d: "1.3s",  s: 6 },
        { x: 88, y: 22, d: "0.4s",  s: 4 },
        { x: 14, y: 52, d: "1.8s",  s: 5 },
        { x: 91, y: 48, d: "0.9s",  s: 4 },
        { x: 34, y: 78, d: "2.2s",  s: 3 },
        { x: 66, y: 80, d: "0.3s",  s: 5 },
        { x: 50, y: 14, d: "1.5s",  s: 4 },
        { x: 79, y: 65, d: "2.6s",  s: 6 },
        { x: 4,  y: 72, d: "1.1s",  s: 3 },
        { x: 95, y: 70, d: "0.6s",  s: 4 },
      ].map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none z-50"
          style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.s, height: f.s, animation: `camera-flash ${1.2 + (i % 4) * 0.5}s ease-out infinite`, animationDelay: f.d }}
        />
      ))}

{/* HEADER */}

      {/* ====== LEFT: cat fans cheering ====== */}
      <div className="absolute left-0 top-0 bottom-0 w-[30%] z-10 pointer-events-none">
        <div className="absolute inset-0 translate-y-[4%]">
          {/* stadium bleachers */}
          <div className="absolute right-[-2%] top-[42%] h-[38%] w-[88%] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="standFade" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1e0a3c" />
                  <stop offset="100%" stopColor="#2d1060" />
                </linearGradient>
              </defs>
              <rect width="120" height="120" fill="url(#standFade)" />
              {Array.from({ length: 3 }).map((_, row) => {
                const rowH = 40;
                const y = row * rowH;
                const riserH = 13;
                const riserShade = row % 2 === 0 ? "#1a0840" : "#22105a";
                const seatColors = [["#7c3aed","#f59e0b","#9333ea"], ["#a855f7","#7c3aed","#facc15"], ["#6d28d9","#a855f7","#f59e0b"]];
                return (
                  <g key={row}>
                    <rect x="0" y={y} width="120" height={riserH} fill={riserShade} />
                    {[0,1,2].map((col) => (
                      <rect key={col} x={col * 38 + 8} y={y + riserH + 3} width="28" height="22" rx="4" fill={seatColors[row][col]} opacity="0.9" />
                    ))}
                    <line x1="0" y1={y + rowH} x2="120" y2={y + rowH} stroke="rgba(168,85,247,0.25)" strokeWidth="0.5" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* stadium light beams */}
          <div className="absolute -top-6 left-[10%] w-[40%] h-[60%]"
            style={{
              background: "linear-gradient(180deg, rgba(250,204,21,0.25) 0%, transparent 100%)",
              clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
              filter: "blur(4px)",
              animation: "spot-sway 4s ease-in-out infinite",
            }}
          />
          <div className="absolute -top-6 right-[10%] w-[40%] h-[60%]"
            style={{
              background: "linear-gradient(180deg, rgba(168,85,247,0.3) 0%, transparent 100%)",
              clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
              filter: "blur(4px)",
              animation: "spot-sway 5s ease-in-out infinite reverse",
            }}
          />

          {/* confetti falling */}
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti-fall pointer-events-none"
              style={{
                left: `${5 + i * 7}%`,
                top: "-6%",
                width: 6,
                height: 13,
                background: ["#a855f7","#f59e0b","#22c55e","#f472b6","#60a5fa","#facc15","#e879f9"][i % 7],
                borderRadius: 2,
                animationDelay: `${i * 0.22}s`,
                animationDuration: `${2.2 + (i % 4) * 0.4}s`,
              }}
            />
          ))}

          {/* flag poles above bleachers */}
          {[
            { left: "24%", color: "#a855f7", stripe: "#7c3aed", delay: "0s" },
            { left: "60%", color: "#facc15", stripe: "#f59e0b", delay: "0.3s" },
            { left: "94%", color: "#a855f7", stripe: "#7c3aed", delay: "0.6s" },
          ].map((flag, i) => (
            <div key={i} className="absolute" style={{ left: flag.left, top: "30%", transform: "translateX(-50%)" }}>
              {/* pennant */}
              <div
                style={{
                  width: 36,
                  height: 22,
                  background: `linear-gradient(135deg, ${flag.color} 50%, ${flag.stripe} 50%)`,
                  borderRadius: "0 5px 5px 0",
                  transformOrigin: "0% 50%",
                  animation: `flag-wave ${1.6 + i * 0.25}s ease-in-out infinite`,
                  animationDelay: flag.delay,
                  boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
                  marginLeft: 2,
                }}
              />
              {/* pole */}
              <div style={{ width: 2, height: 78, background: "linear-gradient(180deg, #d1d5db, #6b7280)", margin: "0 auto", marginTop: -22 }} />
              {/* base */}
              <div style={{ width: 8, height: 4, background: "#4b5563", borderRadius: 2, margin: "0 auto" }} />
            </div>
          ))}

          {/* fans · centered in the left panel */}
          <div className="absolute right-[-2%] bottom-[6%] flex items-end justify-end animate-fans-cheer origin-bottom">
            <Image
              src={catFans.url}
              alt="Cat fans cheering in the stands"
              width={1024}
              height={1024}
              className="block w-[86%] h-auto drop-shadow-[0_25px_30px_rgba(0,0,0,0.7)]"
              unoptimized
            />
          </div>

          {/* floating hearts + sparks */}
          <div className="absolute left-[14%] top-[32%] text-pink-300 text-xl animate-note-rise" style={{ animationDelay: "0s" }}>{"\u2764"}</div>
          <div className="absolute left-[78%] top-[38%] text-amber-300 text-lg animate-note-rise" style={{ animationDelay: "1.4s" }}>{"\u2605"}</div>
          <div className="absolute left-[44%] top-[28%] text-purple-300 text-xl animate-note-rise" style={{ animationDelay: "2.2s" }}>{"\u2726"}</div>
          <div className="absolute left-[62%] top-[34%] text-cyan-300 text-lg animate-note-rise" style={{ animationDelay: "0.8s" }}>{"\u2665"}</div>
        </div>

        {/* GTH Ultras banner */}
        <div className="absolute top-[24%] left-[20%] right-[-4%] flex items-center justify-center gap-2 z-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-400/50" />
          <div className="bg-purple-800/80 backdrop-blur border border-purple-400/40 text-purple-100 text-[9px] font-black tracking-[0.35em] px-3 py-1 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            GTH · ULTRAS
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-400/50" />
        </div>
      </div>

      {/* ====== RIGHT: goal + celebrating cat ====== */}
      <div className="absolute right-0 top-0 bottom-0 w-[30%] z-10 pointer-events-none">
        {/* GOAL */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20%] w-[78%]">
          <Goal />
        </div>

        {/* goalkeeper diving · inside the goal */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[29%] w-[28%] z-10">
          <Image
            src="/cat-goalkeeper.png"
            alt="Cat goalkeeper diving"
            width={1024}
            height={1024}
            className="block w-full h-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
            unoptimized
          />
        </div>

        {/* celebrating cat · same mascot as the homepage */}
        <div className="absolute right-[0%] bottom-[4%] w-[60%] origin-bottom z-20">
          <Image
            src={catMascot.url}
            alt="Purple Paws mascot celebrating a goal"
            width={1024}
            height={1024}
            className="block w-full h-auto drop-shadow-[0_25px_30px_rgba(0,0,0,0.7)]"
            unoptimized
          />
        </div>

        {/* shadow under cat */}
        <div className="absolute right-[6%] bottom-[3%] w-[44%] h-4 rounded-[50%] bg-black/60 blur-md" />

      </div>

      {/* ====== CENTER: scoreboard card (same shell) ====== */}
      <div data-wc-center-card className="absolute inset-0 z-20 flex items-center justify-center px-4">
        <div className="w-[440px] max-w-[90vw] rounded-3xl bg-[#161029]/85 backdrop-blur-xl border border-purple-400/20 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.5)] p-7">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-purple-950 font-black text-xl shadow-lg">
              ?
            </div>
            <div>
              <div className="text-purple-300/70 text-[10px] tracking-[0.35em] font-semibold">GROUP · STAGE</div>
              <div className="text-white text-2xl font-bold">Match Recap</div>
            </div>
          </div>

          <p className="mt-5 text-white/80 text-sm leading-relaxed">
            Purple Paws FC strikes late · 87&apos; winner from <span className="text-amber-300">@whiskermessi</span> · The stadium goes wild <span className="text-yellow-400">{"\u{1F525}"}</span>
          </p>

          {/* scoreboard */}
          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 grid place-items-center text-xs font-black">PPF</div>
                <span className="text-[10px] tracking-[0.3em] text-purple-300/70">PAWS</span>
              </div>
              <div className="flex items-center gap-3 text-4xl font-black">
                <span className="text-amber-300 animate-pulse-slow">2</span>
                <span className="text-purple-300/40 text-2xl">·</span>
                <span className="text-white/80">1</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 grid place-items-center text-xs font-black">DGS</div>
                <span className="text-[10px] tracking-[0.3em] text-purple-300/70">DOGS</span>
              </div>
            </div>
          </div>

          {/* match stats */}
          <div className="mt-5">
            <div className="text-purple-300/70 text-[10px] tracking-[0.35em] mb-3">MATCH STATS</div>
            <Bar label="Possession" value={62} color="from-cyan-400 to-sky-500" />
            <Bar label="Shots on target" value={78} color="from-amber-400 to-orange-500" />
            <Bar label="xG" value={84} color="from-pink-500 to-rose-500" />
          </div>

          {/* footer pill */}
          <div className="mt-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-purple-950 rounded-full px-3 py-1 text-[10px] font-black tracking-widest">
              <span>02</span><span>·</span><span>GOAL</span>
            </div>
            <div className="text-purple-300/60 text-[10px] tracking-[0.3em]">FULL · TIME</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        @keyframes spot-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        @keyframes pulse-slow { 0%,100%{opacity:.8} 50%{opacity:1} }
        .animate-pulse-slow { animation: pulse-slow 1.4s ease-in-out infinite; }
        @keyframes note-rise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-90px) scale(1.2); opacity: 0; }
        }
        .animate-note-rise { animation: note-rise 3s ease-out infinite; }
        @keyframes fans-cheer {
          0%,100% { transform: translateY(0); }
          25% { transform: translateY(-6px) rotate(-1deg); }
          75% { transform: translateY(-6px) rotate(1deg); }
        }
        .animate-fans-cheer { animation: fans-cheer 0.9s ease-in-out infinite; }
        @keyframes camera-flash {
          0%,80%,100% { opacity:0; transform:scale(0.4); }
          85% { opacity:1; transform:scale(2.2); }
          92% { opacity:0.5; transform:scale(1.4); }
        }
        @keyframes flag-wave {
          0%,100% { transform: skewY(0deg); }
          30%      { transform: skewY(4deg) scaleX(0.96); }
          70%      { transform: skewY(-4deg) scaleX(0.96); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg) scaleX(1); opacity: 1; }
          50%  { transform: translateY(55vh) rotate(180deg) scaleX(-1); opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(360deg) scaleX(1); opacity: 0.2; }
        }
        .animate-confetti-fall { animation: confetti-fall linear infinite; }
      `}</style>
    </div>
  );
}

function Goal() {
  return (
    <svg viewBox="0 0 240 160" className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
      {/* net mesh */}
      <defs>
        <pattern id="net" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 0 L10 10 M10 0 L0 10" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.6" />
        </pattern>
      </defs>
      {/* back of net (perspective) */}
      <polygon points="30,30 210,30 200,130 40,130" fill="url(#net)" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.6" />
      {/* side panels */}
      <polygon points="20,20 30,30 40,130 20,140" fill="url(#net)" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.6" />
      <polygon points="220,20 210,30 200,130 220,140" fill="url(#net)" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.6" />
      {/* frame */}
      <line x1="20" y1="20" x2="220" y2="20" stroke="#ffffff" strokeWidth="3" />
      <line x1="20" y1="20" x2="20" y2="140" stroke="#ffffff" strokeWidth="3" />
      <line x1="220" y1="20" x2="220" y2="140" stroke="#ffffff" strokeWidth="3" />
      {/* ground line */}
      <line x1="10" y1="142" x2="230" y2="142" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />
    </svg>
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

export default Slide2;
