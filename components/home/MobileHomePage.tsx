"use client";

import Link from "next/link";
import { MobileHeroScene } from "@/components/MobileHeroScene";
import SpaceBackground from "@/components/SpaceBackground";
import AuthButton from "@/components/ui/AuthButton";
import { WorldCupLanding } from "@/components/pawcup/WorldCupTheme";
import logo from "@/components/pawcup/assets/logo3.asset.json";
import { ThemeSwitch } from "./_theme-switch";
import { HeroCard } from "./_hero-card";
import { FeaturesSection, HomeFooter } from "./_features";
import { useHome } from "./HomeContext";

// ── Mobile Nav ────────────────────────────────────────────────────────────
function MobileNav() {
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
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("features");
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 20, behavior: "smooth" });
              window.history.pushState(null, "", "#features");
            }}
            className="pointer-events-auto ml-3 shrink-0 rounded-full border border-violet-300/35 bg-violet-400/10 px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-violet-200/90 transition-colors hover:bg-violet-400/20 hover:text-white"
          >
            How it works
          </a>
        </div>
        {/* floating glass pill — no center tagline, no Developer Recap badge */}
        <div className="relative z-[1] flex items-center justify-between rounded-full border border-white/[0.08] bg-black/50 px-4 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-5"
          style={{ backdropFilter: "blur(20px) saturate(1.6)" }}>
          {/* left: logo — no CommitNodes on mobile */}
          <Link href="/" className="relative z-10 flex items-center gap-1 sm:gap-2">
            <div className="relative h-8 w-8 shrink-0 sm:h-11 sm:w-11">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo1.png" alt="GitHub Wrapped" width={72} height={72}
                className="h-8 w-8 rounded-lg object-cover select-none sm:h-11 sm:w-11 sm:rounded-xl"
                draggable={false} />
            </div>
            <span className="text-[17px] font-black tracking-tight sm:text-[22px]" style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 0 24px rgba(139,92,246,0.35)" }}>
              <span style={{ color: "var(--violet-glow)", textShadow: "0 0 18px var(--violet-glow)" }}>G</span>rind<span style={{ color: "var(--violet-glow)", textShadow: "0 0 18px var(--violet-glow)" }}>IT</span>
            </span>
          </Link>
          {/* right: auth only */}
          <div className="relative">
            <AuthButton />
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

  return (
    <main className="relative overflow-hidden text-white" style={{ background: "var(--space-deep)" }}>
      <MobileNav />

      <section className="relative flex flex-col items-center justify-end pb-4 pt-20" style={{ height: "var(--hero-height, 100svh)" }}>
        {/* WorldCup overlay */}
        <div
          className={`absolute inset-0 z-[1] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
            ready && worldCup ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <WorldCupLanding isLoggedIn={false} />
        </div>

        {/* Space / mobile scene */}
        <div
          className={`absolute inset-0 ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${
            ready && !worldCup ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ transitionDelay: ready && !worldCup && !animate ? "60ms" : "0ms" }}
        >
          <SpaceBackground />
          <MobileHeroScene />
        </div>

        {/* top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36"
          style={{ background: "linear-gradient(to bottom,color-mix(in oklab,var(--space-deep) 85%,transparent),transparent)" }} />

        {/* landing logo */}
        <div className={`pointer-events-none absolute top-0 left-0 right-0 z-[5] ${animate ? "transition-opacity duration-[520ms] ease-out" : ""} ${ready && !worldCup ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center px-6 pt-[116px]">
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

        <HeroCard />
      </section>

      <FeaturesSection />
      <HomeFooter />
    </main>
  );
}
