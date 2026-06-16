"use client";

import { motion } from "framer-motion";

// Top "journey" bar: one planet dot per slide, coloured to match the planet
// shown on that slide, with a cat-rocket that glides to the current slide.
export default function PlanetProgress({
  total,
  current,
  colors,
  onNavigate,
}: {
  total: number;
  current: number;
  colors: string[];
  onNavigate: (i: number) => void;
}) {
  const lastIdx = Math.max(1, total - 1);
  const progress = (current / lastIdx) * 100;
  // uniform leftward nudge on every slide — keeps the rocket a consistent
  // distance from each dot and off the right edge on the final slide
  const biasPx = -16;

  return (
    <nav aria-label="Wrapped journey" className="relative flex h-8 w-full items-center sm:h-10">
      {/* dashed track */}
      <div className="pointer-events-none absolute left-[24px] right-[24px] top-1/2 -translate-y-1/2 border-t border-dashed border-white/15 sm:left-[72px] sm:right-[72px]" />

      <div className="relative flex w-full items-center justify-between px-[18px] sm:px-[72px]">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate(i)}
            aria-label={`Go to planet ${i + 1}`}
            aria-current={current === i ? "step" : undefined}
            className="relative z-10 grid h-6 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-8 sm:w-8"
          >
            <motion.span
              animate={current === i ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={current === i ? { repeat: Infinity, duration: 1.8 } : { duration: 0.2 }}
              className="block h-[11px] w-[11px] rounded-full border border-white/20 sm:h-[18px] sm:w-[18px]"
              style={{
                background: colors[i] ?? "rgba(255,255,255,0.4)",
                opacity: i <= current ? 1 : 0.35,
                boxShadow: current === i ? `0 0 14px 3px ${colors[i] ?? "#a78bfa"}` : "none",
              }}
            />
          </button>
        ))}

        {/* rocket track — inset so 0%..100% maps onto the first and last dot centres */}
        <div className="pointer-events-none absolute left-[27px] right-[27px] top-0 sm:left-[88px] sm:right-[88px]">
          <motion.div
            className="absolute -top-3 z-20 h-9 w-9 sm:-top-5 sm:h-[54px] sm:w-[54px]"
            animate={{ left: `${progress}%`, rotate: current % 2 ? 6 : -6 }}
            transition={{ type: "tween", duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            style={{ x: "-50%", marginLeft: biasPx }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cat-rocket.png"
              alt=""
              width={54}
              height={54}
              draggable={false}
              className="block h-full w-full select-none object-contain drop-shadow-[0_0_12px_rgba(167,139,250,0.75)]"
            />
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
