"use client";

import { motion } from "framer-motion";
import { useHome } from "./HomeContext";
import { SoccerBallTiny } from "./_icons";

const EASE = [0.32, 0.72, 0, 1] as const;

export function FeaturesSection() {
  const { worldCup } = useHome();

  return (
    <section
      id="features"
      className="relative scroll-mt-28 px-5 py-12 md:py-32 transition-colors duration-700"
      style={{
        background: worldCup
          ? "linear-gradient(180deg, rgba(35,4,60,0.98) 0%, rgba(20,3,40,0.96) 22%, var(--space-deep) 68%)"
          : "linear-gradient(180deg, rgba(26,8,45,0.95) 0%, rgba(16,8,28,0.96) 20%, var(--space-deep) 60%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-72 transition-opacity duration-700"
        style={{
          opacity: worldCup ? 1 : 0.7,
          background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.24), rgba(92,38,132,0.16) 42%, transparent 72%)",
          filter: "blur(18px)",
        }}
      />
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }}>

          <div className="mb-6 text-center md:mb-10">
            <h2 className="text-[26px] font-bold tracking-[-0.04em] text-white md:text-[40px]">
              How it{" "}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(108deg, var(--violet-glow), var(--commit-green))" }}>
                works
              </span>
            </h2>
            <p className="mt-2 text-[14px] text-zinc-500">Everything you need to know before you start.</p>
          </div>

          <div className="rounded-[1.7rem] p-[5px]"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(255,255,255,0.06) 50%, rgba(34,197,94,0.25) 100%)", boxShadow: "0 0 40px -10px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            <div className="relative overflow-hidden rounded-[calc(1.7rem-5px)] px-5 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] md:px-7 md:py-7"
              style={{ background: "linear-gradient(145deg, rgba(30,12,60,0.97) 0%, rgba(10,8,20,0.98) 55%, rgba(8,22,14,0.96) 100%)" }}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-40"
                style={{ background: "radial-gradient(circle, var(--violet-glow), transparent 70%)", filter: "blur(20px)" }} />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, var(--commit-green), transparent 70%)", filter: "blur(20px)" }} />

              <div className="relative grid items-center gap-7 md:grid-cols-[1fr_0.9fr]">
                <div className="text-center md:text-left">
                  <h3 className="relative text-[18px] font-bold leading-tight tracking-[-0.03em] text-white md:text-[22px]">
                    Your GitHub activity, decoded into a cinematic recap.
                  </h3>
                  <p className="relative mt-5 text-[14px] leading-relaxed text-zinc-300">
                    Generate a cinematic recap of your GitHub activity — no account needed. Connect for the full experience and unlock{" "}
                    <span className="font-semibold text-violet-300">All time</span> mode.
                  </p>

                  <ol className="relative mt-5 space-y-3">
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

                  <p className="relative mt-5 text-[12px] leading-relaxed text-zinc-600">
                    Every month we ship a fresh <span className="font-semibold text-zinc-400">visual theme</span> — this month&apos;s is{" "}
                    <span className="font-semibold" style={{ color: "var(--commit-green)" }}>World Cup</span>{" "}
                    <span className="inline-flex translate-y-[1px]"><SoccerBallTiny size={12} /></span>
                  </p>
                </div>

                <div className="relative">
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
      </div>
    </section>
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
