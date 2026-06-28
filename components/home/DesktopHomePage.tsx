"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { HeroScene } from "@/components/HeroScene";
import SpaceBackground from "@/components/SpaceBackground";
import AuthButton from "@/components/ui/AuthButton";
import { WorldCupLanding } from "@/components/pawcup/WorldCupTheme";
import logo from "@/components/pawcup/assets/logo3.asset.json";
import { ThemeSwitch } from "./_theme-switch";
import { HeroCard } from "./_hero-card";
import { HowItWorksModal, HomeFooter } from "./_features";
import { useHome } from "./HomeContext";
import { authCallbackUrl } from "@/lib/hooks/useWrappedHome";

const EASE = [0.32, 0.72, 0, 1] as const;

// ── Commit nodes that flash on the logo ────────────────────────────────────
// Positions as % of logo container (72×72px display)
const BRANCH_NODES = [
  { x: "70.0%", y: "27.0%" },
  { x: "80.6%", y: "15.3%" },
  { x: "86.1%", y: "26.4%" },
];

function CommitNodes() {
  const [lit, setLit] = useState<Set<number>>(new Set());

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const idx = Math.floor(Math.random() * BRANCH_NODES.length);
      setLit(prev => new Set([...prev, idx]));
      setTimeout(() => setLit(prev => { const n = new Set(prev); n.delete(idx); return n; }), 280 + Math.random() * 320);
      t = setTimeout(flash, 550 + Math.random() * 1300);
    };
    t = setTimeout(flash, 800 + Math.random() * 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {BRANCH_NODES.map((node, i) => (
        <span key={i} className="pointer-events-none absolute rounded-full"
          style={{
            left: node.x, top: node.y,
            width: 6, height: 6,
            transform: "translate(-50%, -50%)",
            background: lit.has(i) ? "oklch(0.88 0.32 145)" : "transparent",
            boxShadow: lit.has(i)
              ? "0 0 10px 3px oklch(0.78 0.28 145 / 0.85), 0 0 4px 1px oklch(0.92 0.36 145)"
              : "none",
            transition: "background 0.12s ease, box-shadow 0.12s ease",
          }}
        />
      ))}
    </>
  );
}

// ── TV signal-loss effect ─────────────────────────────────────────────────
function TVSignal() {
  return (
    <div className="relative overflow-hidden rounded-[0.55rem]">
      <video src="/vid2.mp4" autoPlay loop muted playsInline
        className="block w-full"
        style={{ willChange: "auto", transform: "translateZ(0)" }} />

      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.045) 3px, rgba(0,0,0,0.045) 4px)" }} />
      <div className="pointer-events-none absolute inset-0 z-20"
        style={{ background: "radial-gradient(ellipse at 32% 18%, rgba(255,255,255,0.07), transparent 52%)" }} />

      <div className="pointer-events-none absolute inset-x-0 z-30 h-[3px] tv-scanline-a"
        style={{ top: "22%", background: "rgba(255,255,255,1)" }} />

      <div className="pointer-events-none absolute inset-x-0 z-30 h-[3px] tv-scanline-b"
        style={{ top: "61%", background: "rgba(200,220,255,1)" }} />

      <div className="pointer-events-none absolute inset-x-0 z-30 h-[5px] tv-scanline-c"
        style={{ top: "42%", background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))" }} />

      <div className="pointer-events-none absolute inset-x-0 z-[31] tv-sweep"
        style={{ height: 20, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.5) 60%, transparent)" }} />

      {/* Static noise overlay — replaces expensive animated backdropFilter */}
      <div className="pointer-events-none absolute inset-0 z-[35] tv-static-overlay"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(220,220,220,0.08) 0px, rgba(220,220,220,0.08) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "screen",
        }} />
    </div>
  );
}

// ── Pixel star "ALL TIME WRAPPER" text ────────────────────────────────────
const GLYPH: Record<string, number[][]> = {
  A: [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0]],
  P: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  D: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
};
const CELL = 7;
const CHAR_GAP = 4;
const WORD_GAP = 10;

function buildStars(lines: string[]) {
  const stars: { x: number; y: number; delay: number; dur: number }[] = [];
  let s = 7;
  const rnd = () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
  let baseY = 0;
  for (const line of lines) {
    let curX = 0;
    for (const ch of line) {
      if (ch === " ") { curX += WORD_GAP; continue; }
      const g = GLYPH[ch];
      if (!g) { curX += CELL * 5 + CHAR_GAP; continue; }
      for (let row = 0; row < g.length; row++)
        for (let col = 0; col < g[row].length; col++)
          if (g[row][col]) stars.push({ x: curX + col * CELL, y: baseY + row * CELL, delay: rnd() * 3, dur: 1.0 + rnd() * 2.0 });
      curX += 5 * CELL + CHAR_GAP;
    }
    baseY += 5 * CELL + 10;
  }
  return stars;
}

const PIXEL_STARS = buildStars(["ALL TIME", "WRAPPER"]);

function StarPixelText({ onConnect, isLoggedIn }: { onConnect: () => void; isLoggedIn: boolean }) {
  return (
    <div className="flex flex-col items-start gap-4 select-none">
      <style>{`@keyframes sf{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div className={`relative${!isLoggedIn ? " cursor-pointer" : ""}`} style={{ width: 280, height: 108 }}
        onClick={!isLoggedIn ? onConnect : undefined}
      >
        {PIXEL_STARS.map((st, i) => {
          const green = i % 7 === 0;
          return (
            <span key={i} className="pointer-events-none absolute"
              style={{
                left: st.x, top: st.y,
                width: CELL, height: CELL,
                fontSize: CELL + 1,
                lineHeight: 1,
                color: green ? "rgb(134,239,172)" : "rgb(196,181,253)",
                textShadow: green
                  ? "0 0 5px rgba(74,222,128,0.95), 0 0 10px rgba(74,222,128,0.6)"
                  : "0 0 5px rgba(167,139,250,0.95), 0 0 10px rgba(139,92,246,0.6)",
                animation: `sf ${st.dur}s ease-in-out ${st.delay}s infinite`,
              }}
            >✦</span>
          );
        })}
      </div>
      {isLoggedIn && (
        <p className="text-[8px] tracking-[0.22em] uppercase" style={{ color: "rgba(74,222,128,0.6)" }}>✓ unlocked</p>
      )}
    </div>
  );
}

// ── Desktop Nav ───────────────────────────────────────────────────────────
function DesktopNav({ onHowItWorks }: { onHowItWorks: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-6xl px-3 pt-3 pointer-events-auto sm:px-5 sm:pt-5">
        {/* floating glass pill */}
        <div className="relative z-[1] flex items-center justify-between rounded-full border border-white/[0.08] bg-black/50 px-4 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-5"
          style={{ backdropFilter: "blur(20px) saturate(1.6)" }}>
          {/* left: logo with commit nodes */}
          <Link href="/" className="relative z-10 flex cursor-default items-center gap-1 sm:gap-2">
            <div className="relative h-8 w-8 shrink-0 sm:h-[72px] sm:w-[72px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo1.png" alt="GitHub Wrapped" width={72} height={72}
                className="h-8 w-8 rounded-lg object-cover select-none sm:h-[72px] sm:w-[72px] sm:rounded-xl"
                draggable={false} />
              <CommitNodes />
            </div>
            <span className="text-[17px] font-black tracking-tight sm:text-[22px]" style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 0 24px rgba(139,92,246,0.35)" }}>
              <span style={{ color: "var(--violet-glow)", textShadow: "0 0 18px var(--violet-glow)" }}>G</span>rind<span style={{ color: "var(--violet-glow)", textShadow: "0 0 18px var(--violet-glow)" }}>IT</span>
            </span>
          </Link>
          {/* center: tagline — absolutely positioned, only md+ */}
          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <div className="hidden flex-col items-center gap-1 md:flex">
              <span className="text-[20px] font-bold tracking-[-0.03em] text-white/90">
                Your GitHub story,{" "}
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(108deg,var(--silver),var(--violet-glow) 55%,var(--commit-green))" }}>
                  unwrapped.
                </span>
              </span>
              <button
                onClick={onHowItWorks}
                className="pointer-events-auto cursor-pointer rounded-full border border-violet-300/30 bg-white/[0.06] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300/80 shadow-[0_6px_18px_-12px_rgba(167,139,250,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-violet-400/[0.16] hover:text-white hover:shadow-[0_10px_24px_-14px_rgba(167,139,250,1),inset_0_1px_0_rgba(255,255,255,0.16)] active:translate-y-0 active:scale-[0.96]"
              >
                How it works
              </button>
            </div>
          </div>
          {/* right: auth + badge + ThemeSwitch */}
          <div className="relative flex items-center gap-3">
            <ThemeSwitch />
            <div className="flex flex-col items-center gap-1">
              <AuthButton />
              <div className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-300 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--commit-green)" }} />
                Developer Recap · Any Period
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Desktop page ──────────────────────────────────────────────────────────
export function DesktopHomePage() {
  const { worldCup, ready, animate, isLoggedIn } = useHome();
  const [howOpen, setHowOpen] = useState(false);

  return (
    <main className="relative h-[100svh] overflow-hidden text-white" style={{ background: "var(--space-deep)" }}>
      <DesktopNav onHowItWorks={() => setHowOpen(true)} />

      <section className="relative flex flex-col items-center justify-end pb-4 pt-20" style={{ height: "var(--hero-height, 100svh)" }}>
        {/* WorldCup overlay */}
        <div
          className={`absolute inset-0 z-[1] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
            ready && worldCup ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <WorldCupLanding isLoggedIn={isLoggedIn} />
        </div>

        {/* Space / planet scene */}
        <div
          className={`absolute inset-0 ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
            ready && !worldCup ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ transitionDelay: ready && !worldCup && !animate ? "60ms" : "0ms" }}
        >
          <SpaceBackground />
          <HeroScene />
        </div>

        {/* top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36"
          style={{ background: "linear-gradient(to bottom,color-mix(in oklab,var(--space-deep) 85%,transparent),transparent)" }} />

        {/* landing logo */}
        <div className={`pointer-events-none absolute top-0 left-0 right-0 z-[5] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${ready && !worldCup ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center px-6 pt-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.url} alt="GrindIT" width={48} height={48} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur p-1"
              style={{ boxShadow: "0 0 0 2px oklch(0.72 0.18 295 / 0.7), 0 0 14px oklch(0.72 0.18 295 / 0.55), 0 0 28px oklch(0.72 0.18 295 / 0.25)" }} />
          </div>
        </div>

        {/* bottom fade */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[58%] ${animate ? "transition-colors duration-700" : ""}`}
          style={{
            background: ready && worldCup
              ? "linear-gradient(to top, rgba(35,4,60,0.98) 0%, rgba(45,5,80,0.88) 18%, rgba(70,20,130,0.50) 48%, rgba(100,40,170,0.18) 74%, transparent 100%)"
              : "linear-gradient(to top, rgba(26,8,45,0.98) 0%, rgba(26,8,45,0.90) 18%, rgba(54,20,86,0.55) 50%, rgba(74,24,112,0.18) 72%, transparent 100%)",
          }}
        />

        {/* TV decoration — right side, xl only */}
        {ready && !worldCup && <div
          className="pointer-events-none absolute right-10 top-[54%] z-[5] xl:block hidden tv-float"
          style={{ width: "min(21vw, 270px)" }}
        >
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.45) 0%, rgba(74,222,128,0.18) 55%, transparent 75%)", opacity: 0.7 }} />

          <div className="absolute left-1/2 -top-9 -translate-x-1/2 flex gap-5">
            <div className="relative h-9 w-[2px] origin-bottom -rotate-12 rounded-full"
              style={{ background: "linear-gradient(to top, rgba(139,92,246,0.9), rgba(139,92,246,0.1))" }}>
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(139,92,246,1)", boxShadow: "0 0 10px 3px rgba(139,92,246,0.8)", display: "block" }} />
            </div>
            <div className="relative h-9 w-[2px] origin-bottom rotate-12 rounded-full"
              style={{ background: "linear-gradient(to top, rgba(74,222,128,0.9), rgba(74,222,128,0.1))" }}>
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(74,222,128,1)", boxShadow: "0 0 10px 3px rgba(74,222,128,0.8)", display: "block" }} />
            </div>
          </div>

          <div className="relative rounded-[1.5rem] p-[10px]"
            style={{
              background: "linear-gradient(145deg, #1c0e3f 0%, #0a0618 45%, #130a28 100%)",
              border: "1.5px solid rgba(139,92,246,0.22)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 50px rgba(0,0,0,0.95), 0 0 40px rgba(139,92,246,0.12)",
            }}>
            <div className="rounded-[0.85rem] p-[5px]"
              style={{ background: "rgba(0,0,0,0.85)", boxShadow: "inset 0 2px 12px rgba(0,0,0,1), inset 0 0 0 1px rgba(255,255,255,0.03)" }}>
              <TVSignal />
            </div>
            <div className="mt-2 flex items-center justify-between px-1.5">
              <div className="flex items-center gap-1.5">
                <span className="block h-1.5 w-1.5 rounded-full tv-led" />
                <span className="text-[6px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "rgba(139,92,246,0.55)", fontFamily: "monospace" }}>SPACE·1</span>
              </div>
              <div className="flex gap-1.5">
                {["-20deg", "25deg"].map((rot, i) => (
                  <div key={i} className="relative h-[14px] w-[14px] rounded-full"
                    style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), rgba(0,0,0,0.7))", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.07)" }}>
                    <div className="absolute left-1/2 top-[18%] h-[38%] w-[2px] -translate-x-1/2 rounded-full"
                      style={{ background: "rgba(255,255,255,0.28)", transform: `translateX(-50%) rotate(${rot})`, transformOrigin: "bottom center" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-4 w-5"
              style={{ background: "linear-gradient(to bottom, #1c0e3f, #0a0618)", borderLeft: "1.5px solid rgba(139,92,246,0.18)", borderRight: "1.5px solid rgba(139,92,246,0.18)", borderBottom: "1.5px solid rgba(139,92,246,0.18)", borderRadius: "0 0 3px 3px" }} />
            <div className="h-[5px] w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 30%, rgba(74,222,128,0.35) 70%, transparent 100%)", boxShadow: "0 0 14px 2px rgba(139,92,246,0.35)" }} />
          </div>
        </div>}

        {/* StarPixelText — left center, lg only */}
        {ready && !worldCup && <motion.div
          className="pointer-events-none absolute left-24 z-[6] lg:block hidden"
          style={{ top: "60%", transform: "translateY(-50%)" }}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 1.0, ease: EASE }}
        >
          <StarPixelText isLoggedIn={isLoggedIn} onConnect={() => signIn("github", { callbackUrl: authCallbackUrl() })} />
        </motion.div>}

        <HeroCard />
      </section>

      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />
    </main>
  );
}
