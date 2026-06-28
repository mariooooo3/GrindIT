"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHome } from "./HomeContext";
import { SoccerBallTiny } from "./_icons";

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { worldCup } = useHome();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // unused but keep to avoid unused-var warning
  void worldCup;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* panel */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-[201] w-full max-w-2xl px-4"
            style={{ translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div className="rounded-[1.7rem] p-[5px] max-h-[88vh] overflow-y-auto"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(255,255,255,0.06) 50%, rgba(34,197,94,0.25) 100%)",
                boxShadow: "0 0 80px -8px rgba(139,92,246,0.55), 0 40px 80px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
              <div className="relative overflow-hidden rounded-[calc(1.7rem-5px)] px-5 py-6 md:px-8 md:py-7"
                style={{ background: "linear-gradient(145deg, rgba(30,12,60,0.97) 0%, rgba(10,8,20,0.98) 55%, rgba(8,22,14,0.96) 100%)" }}>

                {/* decorative blobs */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full opacity-40"
                  style={{ background: "radial-gradient(circle, var(--violet-glow), transparent 70%)", filter: "blur(22px)" }} />
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full opacity-30"
                  style={{ background: "radial-gradient(circle, var(--commit-green), transparent 70%)", filter: "blur(22px)" }} />

                {/* close button */}
                <motion.button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.65)" }}
                  whileHover={{ scale: 1.12, background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,1)" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 440, damping: 24 }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </motion.button>

                {/* title */}
                <div className="mb-5 pr-8 text-center md:text-left">
                  <h2 className="text-[22px] font-bold tracking-[-0.04em] text-white md:text-[28px]">
                    How it{" "}
                    <span className="bg-clip-text text-transparent"
                      style={{ backgroundImage: "linear-gradient(108deg, var(--violet-glow), var(--commit-green))" }}>
                      works
                    </span>
                  </h2>
                  <p className="mt-1.5 text-[13px] text-zinc-500">Everything you need to know before you start.</p>
                </div>

                {/* content grid */}
                <div className="relative grid items-center gap-6 md:grid-cols-[1fr_0.85fr]">
                  <div>
                    <h3 className="text-[15px] font-bold leading-tight tracking-[-0.03em] text-white md:text-[17px]">
                      Your GitHub activity, decoded into a cinematic recap.
                    </h3>
                    <p className="mt-3.5 text-[13px] leading-relaxed text-zinc-300">
                      Generate a cinematic recap of your GitHub activity — no account needed. Connect for the full experience and unlock{" "}
                      <span className="font-semibold text-violet-300">All time</span> mode.
                    </p>

                    <ol className="mt-4 space-y-3">
                      {[
                        { n: "01", label: "Enter your username", desc: "Public profiles work instantly — no login required." },
                        { n: "02", label: "Pick a period & AI tone", desc: "Last 30 days, this year, all time. Roast, hype, or poetic." },
                        { n: "03", label: "Generate your recap", desc: "We analyse your repos, commits, languages & streaks." },
                        { n: "04", label: "Share it", desc: "Download your slides or share a link directly." },
                      ].map(({ n, label, desc }) => (
                        <li key={n} className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 text-[10px] font-bold tabular-nums tracking-[0.12em]"
                            style={{ color: "var(--violet-glow)" }}>{n}</span>
                          <div>
                            <span className="text-[13px] font-semibold text-white">{label}</span>
                            <span className="ml-2 text-[12px] text-zinc-500">{desc}</span>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <p className="mt-4 text-[12px] leading-relaxed text-zinc-600">
                      Every month we ship a fresh <span className="font-semibold text-zinc-400">visual theme</span> — this month&apos;s is{" "}
                      <span className="font-semibold" style={{ color: "var(--commit-green)" }}>World Cup</span>{" "}
                      <span className="inline-flex translate-y-[1px]"><SoccerBallTiny size={12} /></span>
                    </p>
                  </div>

                  <div className="relative mt-5 md:mt-0">
                    <div className="absolute -inset-3 rounded-[1.4rem] bg-[radial-gradient(circle_at_50%_75%,rgba(139,92,246,0.28),transparent_58%)]" />
                    <div className="relative rounded-[1.35rem] border border-white/[0.08] bg-white/[0.035] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="overflow-hidden rounded-[calc(1.35rem-0.5rem)] border border-white/[0.08] bg-black shadow-[0_20px_70px_-35px_rgba(139,92,246,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logo2.png"
                          alt="Terminal cat illustration"
                          width={520}
                          height={325}
                          className="aspect-[16/10] w-full object-cover object-center opacity-95"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function HomeFooter() {
  return (
    <footer className="py-10 text-center">
      <div className="mx-auto max-w-xs border-t border-white/[0.06] pt-8">
        <p className="text-[11px] text-zinc-500">
          Made with GitHub API · AI summaries by Groq · No data stored on our servers · Open source
        </p>
      </div>
    </footer>
  );
}
