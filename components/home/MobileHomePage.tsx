"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileHeroScene } from "@/components/MobileHeroScene";
import SpaceBackground from "@/components/SpaceBackground";
import AuthButton from "@/components/ui/AuthButton";
import WorldCupMobileBackground from "@/components/WorldCupMobileBackground";
import logo from "@/components/pawcup/assets/logo3.asset.json";
import { ThemeSwitch } from "./_theme-switch";
import { HeroCard } from "./_hero-card";
import { HowItWorksModal, HomeFooter } from "./_features";
import { useHome } from "./HomeContext";

// ── Blinking commit-branch nodes on the logo ────────────────────────────
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
            width: 5, height: 5,
            transform: "translate(-50%, -50%)",
            background: lit.has(i) ? "oklch(0.88 0.32 145)" : "transparent",
            boxShadow: lit.has(i)
              ? "0 0 8px 2px oklch(0.78 0.28 145 / 0.85), 0 0 3px 1px oklch(0.92 0.36 145)"
              : "none",
            transition: "background 0.12s ease, box-shadow 0.12s ease",
          }}
        />
      ))}
    </>
  );
}

// ── Mobile Nav ────────────────────────────────────────────────────────────
function MobileNav({ onHowItWorks }: { onHowItWorks: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-6xl px-3 pt-3 pointer-events-auto sm:px-5 sm:pt-5">
        {/* mobile tagline bar — above the main nav pill */}
        <div
          className="mb-1.5 flex items-center justify-between rounded-full border border-white/[0.07] bg-black/40 px-4 py-1.5"
          style={{ backdropFilter: "blur(20px) saturate(1.4)" }}
        >
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-white/90">
            Your GitHub story,{" "}
            <span className="bg-clip-text text-transparent font-bold" style={{ backgroundImage: "linear-gradient(108deg,var(--silver),var(--violet-glow) 60%,var(--commit-green))" }}>
              unwrapped.
            </span>
          </span>
          <button
            onClick={onHowItWorks}
            className="pointer-events-auto ml-3 shrink-0 cursor-pointer rounded-full border border-violet-300/35 bg-violet-400/10 px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-violet-200/90 transition-colors hover:bg-violet-400/20 hover:text-white"
          >
            How it works
          </button>
        </div>
        {/* floating glass pill — with Developer Recap badge below auth */}
        <div className="relative z-[1] flex items-center justify-between rounded-full border border-white/[0.08] bg-black/50 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-5"
          style={{ backdropFilter: "blur(20px) saturate(1.6)" }}>
          {/* left: logo */}
          <Link href="/" className="relative z-10 flex cursor-default items-center gap-1 sm:gap-2">
            <div className="relative h-8 w-8 shrink-0 sm:h-11 sm:w-11">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo1.png" alt="GitHub Wrapped" width={72} height={72}
                className="h-8 w-8 rounded-lg object-cover select-none sm:h-11 sm:w-11 sm:rounded-xl"
                draggable={false} />
              <CommitNodes />
            </div>
            <span className="text-[17px] font-black tracking-tight sm:text-[22px]" style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 0 24px rgba(139,92,246,0.35)" }}>
              <span style={{ color: "var(--violet-glow)", textShadow: "0 0 18px var(--violet-glow)" }}>G</span>rind<span style={{ color: "var(--violet-glow)", textShadow: "0 0 18px var(--violet-glow)" }}>IT</span>
            </span>
          </Link>
          {/* right: auth + developer recap badge */}
          <div className="flex flex-col items-center gap-1">
            <AuthButton />
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--commit-green)" }} />
              Developer Recap · Any Period
            </div>
          </div>
        </div>
        {/* ThemeSwitch — separate frame, right-aligned */}
        <div className="relative z-0 mt-6 flex justify-end">
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}

// ── Mobile page ───────────────────────────────────────────────────────────
export function MobileHomePage() {
  const { worldCup, ready, animate } = useHome();
  const [howOpen, setHowOpen] = useState(false);

  return (
    <main className="relative h-[100svh] overflow-hidden text-white" style={{ background: "var(--space-deep)" }}>
      <MobileNav onHowItWorks={() => setHowOpen(true)} />

      <section className="relative flex flex-col items-center justify-end pb-4 pt-20" style={{ height: "var(--hero-height, 100svh)" }}>
        {/* Theme background — WC always visible underneath; Space fades in on top */}
        {/* isolate creates a stacking context so z-10/z-20 inside WC don't escape above SpaceBackground */}
        <div className="absolute inset-0 isolate">
          <WorldCupMobileBackground />
        </div>
        <div
          className={`absolute inset-0 ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
            ready && worldCup ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{ transitionDelay: ready && !worldCup && !animate ? "60ms" : "0ms" }}
        >
          <SpaceBackground />
        </div>

        {/* Hero scene — space theme only, opacity-based to avoid bounding-box flash on mount */}
        <div
          className={`absolute inset-0 ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
            ready && worldCup ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <MobileHeroScene />
        </div>

        {/* top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36"
          style={{ background: "linear-gradient(to bottom,color-mix(in oklab,var(--space-deep) 85%,transparent),transparent)" }} />

        {/* landing logo */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 z-[5]">
          <div className="flex items-center px-6 pt-[142px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.url} alt="GrindIT" width={48} height={48} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur p-1"
              style={{ boxShadow: "0 0 0 2px oklch(0.72 0.18 295 / 0.7), 0 0 14px oklch(0.72 0.18 295 / 0.55), 0 0 28px oklch(0.72 0.18 295 / 0.25)" }} />
          </div>
        </div>

        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
          style={{ background: "linear-gradient(to top, rgba(6,14,8,0.98) 0%, rgba(8,16,10,0.90) 18%, rgba(10,22,12,0.55) 50%, rgba(12,28,14,0.18) 72%, transparent 100%)" }} />

        <HeroCard />
      </section>

      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />
    </main>
  );
}
