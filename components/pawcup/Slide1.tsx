"use client";

import Image from "next/image";
import { useState } from "react";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import catBack from "@/components/pawcup/assets/cat-back.png.asset.json";


function Slide1() {
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

      {/* ====== LEFT: training equipment ====== */}
      <div className="absolute left-[3%] top-0 bottom-0 w-[28%] z-10 pointer-events-none">
        <div className="absolute inset-0 translate-y-[7%]">
          {/* Realistic 3D training field */}
          <div className="absolute left-[2%] right-[2%] top-[15%] bottom-[15%]">
            {/* perspective grass surface */}
            <div style={{
              position: "absolute", bottom: 0, left: "0%", right: "0%", height: "100%",
              transform: "perspective(900px) rotateX(16deg)",
              transformOrigin: "50% 100%",
            }}>
              {/* alternating mower stripes */}
              <div style={{
                position: "absolute", inset: 0,
                background: "repeating-linear-gradient(0deg,#14532d 0px,#14532d 48px,#166534 48px,#166534 96px)",
              }} />
              {/* grass sheen overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.18) 100%)",
              }} />
              {/* field boundary */}
              <div style={{
                position: "absolute", top: "8%", left: "6%", right: "6%", bottom: "2%",
                border: "2px solid rgba(255,255,255,0.75)",
              }} />
              {/* center horizontal line */}
              <div style={{
                position: "absolute", top: "54%", left: "6%", right: "6%",
                height: "2px", background: "rgba(255,255,255,0.75)",
              }} />
              {/* penalty box top */}
              <div style={{
                position: "absolute", top: "8%", left: "28%", right: "28%",
                height: "18%", border: "2px solid rgba(255,255,255,0.6)", borderTop: "none",
              }} />
              {/* penalty box bottom */}
              <div style={{
                position: "absolute", bottom: "2%", left: "28%", right: "28%",
                height: "18%", border: "2px solid rgba(255,255,255,0.6)", borderBottom: "none",
              }} />
            </div>
            {/* ground-level glow */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "32px",
              background: "linear-gradient(to top, rgba(20,83,45,0.6), transparent)",
            }} />
          </div>

          {/* Slalom course · jalons arranged in a deliberate S-curve */}
          <Jalon className="absolute left-[23%] bottom-[63%]" color="#facc15" h={170} delay="0s" />
          <Jalon className="absolute left-[57%] bottom-[54%]" color="#ef4444" h={185} delay="0.35s" />
          <Jalon className="absolute left-[27%] bottom-[44%]" color="#facc15" h={175} delay="0.7s" />
          <Jalon className="absolute left-[63%] bottom-[34%]" color="#ef4444" h={165} delay="1.05s" />

          {/* Cones · flanking the slalom path */}
          <Cone className="absolute left-[13%] bottom-[35%]" />
          <Cone className="absolute left-[41%] bottom-[29%]" big />
          <Cone className="absolute left-[71%] bottom-[25%]" />
          <Cone className="absolute left-[53%] bottom-[21%]" small />
          <Cone className="absolute left-[11%] bottom-[22%]" small />

          {/* Soccer balls · more realistic, better positioned */}
          <Ball className="absolute left-[39%] bottom-[38%]" size={68} delay="0s" />
          <Ball className="absolute left-[69%] bottom-[32%]" size={68} delay="0.9s" />
          <Ball className="absolute left-[17%] bottom-[28%]" size={68} delay="1.8s" />
        </div>

        {/* caption */}
      </div>

      {/* ====== RIGHT: cat from back + tactics board ====== */}
      <div className="absolute right-0 top-0 bottom-0 w-[28%] z-10">
        <div className="relative w-full h-full">
          {/* Tactics board */}
          <TacticsBoard className="absolute right-[18%] top-[18%]" />

          {/* Cat seen from back */}
          <div className="absolute right-[12%] bottom-[6%] w-[42%] animate-float-slow">
            <Image
              src="/cat-back-2-transparent-v2.png"
              alt="Cat coach from behind"
              width={1024}
              height={1024}
              className="w-full h-auto drop-shadow-[0_25px_30px_rgba(0,0,0,0.7)]"
              unoptimized
            />
          </div>

          {/* floor shadow */}
          <div className="absolute right-[8%] bottom-[4%] w-[55%] h-6 rounded-[50%] bg-black/60 blur-md" />

        </div>
      </div>

      {/* ====== CENTER: Captain card ====== */}
      <div data-wc-center-card className="absolute inset-0 z-20 flex items-center justify-center px-4">
        <div className="w-[440px] max-w-[90vw] rounded-3xl bg-[#161029]/85 backdrop-blur-xl border border-purple-400/20 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.5)] p-7">
          {/* header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-white font-black text-xl shadow-lg">
              WM
            </div>
            <div>
              <div className="text-purple-300/70 text-[10px] tracking-[0.35em] font-semibold">CAPTAIN</div>
              <div className="text-white text-2xl font-bold">@whiskermessi</div>
            </div>
          </div>

          {/* bio */}
          <p className="mt-5 text-white/80 text-sm leading-relaxed">
            Captain of Purple Paws FC - 8x Golden Paw - World Cup 2026 hopeful - Magic left paw <span className="text-yellow-400">{"\u2B50"}</span>
          </p>

          {/* total goals */}
          <div className="mt-5">
            <div className="text-purple-300/70 text-[10px] tracking-[0.35em]">TOTAL GOALS</div>
            <div className="text-white font-black text-5xl leading-none mt-1">109</div>
          </div>

          {/* top skills */}
          <div className="mt-5">
            <div className="text-purple-300/70 text-[10px] tracking-[0.35em] mb-3">TOP SKILLS</div>
            <Skill label="Dribbling" value={96} color="from-cyan-400 to-sky-500" />
            <Skill label="Passing" value={92} color="from-amber-400 to-orange-500" />
            <Skill label="Finishing" value={90} color="from-pink-500 to-rose-500" />
          </div>

          {/* form + streak */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">FORM</div>
              <div className="text-purple-300 text-3xl font-black">94</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-purple-300/60 text-[9px] tracking-[0.3em]">STREAK</div>
              <div className="text-amber-400 text-3xl font-black">14<span className="text-base">g</span></div>
            </div>
          </div>

          {/* footer pill */}
          <div className="mt-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-purple-950 rounded-full px-3 py-1 text-[10px] font-black tracking-widest">
              <span>01</span><span>·</span><span>PLAYER</span>
            </div>
            <div className="text-purple-300/60 text-[10px] tracking-[0.3em]">PRE · MATCH</div>
          </div>
        </div>
      </div>

      {/* footer */}

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        @keyframes jalon-sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        .animate-sway { animation: jalon-sway 3.5s ease-in-out infinite; transform-origin: bottom center; }
        @keyframes chalk-draw { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:0} }
        .chalk { stroke-dasharray:200; animation: chalk-draw 3s ease-out forwards; }
      `}</style>
    </div>
  );
}

function Skill({ label, value, color }: { label: string; value: number; color: string }) {
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

function Jalon({ className, color, h, delay }: { className?: string; color: string; h: number; delay: string }) {
  const bands = 6;
  const bandH = Math.floor((h - 18) / bands);
  return (
    <div className={`${className} animate-sway`} style={{ animationDelay: delay }}>
      <svg width="18" height={h} viewBox={`0 0 18 ${h}`}>
        <defs>
          <linearGradient id={`jg${h}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {/* pole shadow */}
        <ellipse cx="9" cy={h - 2} rx="7" ry="3" fill="#000" opacity="0.45" />
        {/* base disc */}
        <ellipse cx="9" cy={h - 6} rx="7" ry="3" fill="#888" stroke="#555" strokeWidth="0.5" />
        {/* pole tube */}
        <rect x="7" y="4" width="4" height={h - 14} fill="#d1d5db" rx="2" />
        <rect x="7" y="4" width="2" height={h - 14} fill="rgba(255,255,255,0.35)" rx="2" />
        {/* colored bands */}
        {Array.from({ length: bands }).map((_, i) => (
          <rect key={i} x="4" y={4 + i * bandH} width="10" height={bandH - 1}
            fill={i % 2 === 0 ? color : "#ffffff"} rx="1.5"
            style={{ filter: i % 2 === 0 ? `drop-shadow(0 0 2px ${color}80)` : undefined }} />
        ))}
        {/* highlight sheen over bands */}
        <rect x="4" y="4" width="10" height={h - 18} fill={`url(#jg${h})`} rx="1.5" />
        {/* top cap */}
        <circle cx="9" cy="5" r="3.5" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5" />
        <circle cx="8" cy="4" r="1.5" fill="rgba(255,255,255,0.6)" />
      </svg>
    </div>
  );
}

function Cone({ className, big, small }: { className?: string; big?: boolean; small?: boolean }) {
  const w = big ? 68 : small ? 34 : 50;
  const h = big ? 68 : small ? 34 : 50;
  const id = big ? "b" : small ? "s" : "m";
  return (
    <div className={className}>
      <svg width={w} height={h} viewBox="0 0 70 72">
        <defs>
          <linearGradient id={`cL${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`cH${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* shadow */}
        <ellipse cx="35" cy="68" rx="25" ry="4" fill="#000" opacity="0.4" />
        {/* base flat */}
        <ellipse cx="35" cy="62" rx="22" ry="5" fill="#c2410c" />
        {/* main cone body */}
        <polygon points="35,6 56,62 14,62" fill="#f97316" />
        {/* shade left */}
        <polygon points="35,6 56,62 14,62" fill={`url(#cL${id})`} opacity="0.7" />
        {/* white stripe */}
        <rect x="17" y="34" width="36" height="7" fill="#fff" opacity="0.88" rx="1" />
        {/* highlight */}
        <polygon points="35,6 56,62 14,62" fill={`url(#cH${id})`} opacity="0.3" />
        {/* top knob */}
        <circle cx="35" cy="8" r="3.5" fill="#ea6518" stroke="#c2410c" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

function Ball({ className, size }: { className?: string; size: number; delay: string }) {
  const gId = `s1bg${size}`;
  const glId = `s1gl${size}`;
  const clipId = `s1clip${size}`;
  const wave = "M48 52 C 55 39 37 33 39 20 C 40 13 33 10 23 13";
  return (
    <div className={className}>
      <svg width={size} height={size + 6} viewBox="0 0 100 106">
        <defs>
          <clipPath id={clipId}><circle cx="50" cy="50" r="46" /></clipPath>
          <radialGradient id={gId} cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="62%" stopColor="#eef1f5" />
            <stop offset="100%" stopColor="#bcc2cc" />
          </radialGradient>
          <radialGradient id={glId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ground shadow */}
        <ellipse cx="50" cy="103" rx="36" ry="4" fill="#000" opacity="0.35" />
        {/* ball sphere */}
        <circle cx="50" cy="50" r="46" fill={`url(#${gId})`} />
        {/* three wavy colour ribbons */}
        <g clipPath={`url(#${clipId})`} fill="none" strokeLinecap="round">
          <path d={wave} stroke="#c8163d" strokeWidth="15" />
          <path d={wave} stroke="#1f9d4d" strokeWidth="15" transform="rotate(120 50 50)" />
          <path d={wave} stroke="#1d7fe0" strokeWidth="15" transform="rotate(240 50 50)" />
        </g>
        {/* curved panel seams */}
        <g clipPath={`url(#${clipId})`} fill="none" stroke="#2a2e38" strokeLinecap="round" opacity="0.7">
          <path d="M8 39 Q 50 23 92 39" strokeWidth="2.8" />
          <path d="M8 61 Q 50 77 92 61" strokeWidth="2.8" />
          <path d="M36 6 Q 20 50 36 94" strokeWidth="2.5" />
          <path d="M64 6 Q 80 50 64 94" strokeWidth="2.5" />
        </g>
        {/* glossy highlight */}
        <ellipse cx="36" cy="31" rx="19" ry="12.5" fill={`url(#${glId})`} transform="rotate(-28 36 31)" clipPath={`url(#${clipId})`} />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#000000" strokeOpacity="0.16" strokeWidth="1.8" />
      </svg>
    </div>
  );
}
function TacticsBoard({ className }: { className?: string }) {
  return (
    <div className={`${className} w-[260px]`}>
      <div className="relative rounded-xl bg-[#1a0f3a] border-2 border-purple-400/40 p-3 shadow-[0_15px_40px_rgba(168,85,247,0.4)]">
        <div className="text-purple-300/70 text-[9px] tracking-[0.4em] text-center mb-1">? FORMATION 4-3-3 ?</div>
        <svg viewBox="0 0 200 240" className="w-full h-auto">
          {/* pitch outline */}
          <rect x="6" y="6" width="188" height="228" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.6" />
          <line x1="6" y1="120" x2="194" y2="120" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
          <circle cx="100" cy="120" r="22" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
          <rect x="60" y="6" width="80" height="30" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
          <rect x="60" y="204" width="80" height="30" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />

          {/* dots = players */}
          {[
            [100, 220],
            [35, 175], [80, 180], [120, 180], [165, 175],
            [55, 130], [100, 140], [145, 130],
            [40, 70], [100, 60], [160, 70],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="6" fill="#facc15" stroke="#000" strokeWidth="1" />
            </g>
          ))}

          {/* tactic arrows (chalk) */}
          <path d="M100 140 Q 100 100 100 70" stroke="#22d3ee" strokeWidth="1.8" fill="none" markerEnd="url(#arrowC)" className="chalk" />
          <path d="M55 130 Q 30 100 40 75" stroke="#22d3ee" strokeWidth="1.8" fill="none" markerEnd="url(#arrowC)" className="chalk" />
          <path d="M145 130 Q 170 100 160 75" stroke="#22d3ee" strokeWidth="1.8" fill="none" markerEnd="url(#arrowC)" className="chalk" />

          {/* X marks */}
          <text x="30" y="50" fill="#ef4444" fontSize="14" fontWeight="900">X</text>
          <text x="160" y="50" fill="#ef4444" fontSize="14" fontWeight="900">X</text>
          <text x="90" y="35" fill="#ef4444" fontSize="14" fontWeight="900">X</text>

          <defs>
            <marker id="arrowC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#22d3ee" />
            </marker>
          </defs>
        </svg>
        <div className="text-purple-300/50 text-[8px] tracking-[0.3em] text-center mt-1">COACH ? WHISKERS</div>
      </div>
    </div>
  );
}

export default Slide1;





