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
  const progress = (current / Math.max(1, total - 1)) * 100;
  const catX = current >= total - 1 ? -72 : 18;

  return (
    <nav aria-label="Wrapped journey" className="relative flex h-10 w-full items-center">
      {/* dashed track */}
      <div className="pointer-events-none absolute left-[72px] right-[72px] top-1/2 -translate-y-1/2 border-t border-dashed border-white/15" />

      <div className="relative flex w-full items-center justify-between px-[72px]">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate(i)}
            aria-label={`Go to planet ${i + 1}`}
            aria-current={current === i ? "step" : undefined}
            className="relative z-10 grid h-8 w-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <motion.span
              animate={current === i ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={current === i ? { repeat: Infinity, duration: 1.8 } : { duration: 0.2 }}
              className="block h-[18px] w-[18px] rounded-full border border-white/20"
              style={{
                background: colors[i] ?? "rgba(255,255,255,0.4)",
                opacity: i <= current ? 1 : 0.35,
                boxShadow: current === i ? `0 0 14px 3px ${colors[i] ?? "#a78bfa"}` : "none",
              }}
            />
          </button>
        ))}

        <div className="pointer-events-none absolute inset-x-[72px] top-0">
          {/* gliding cat rocket */}
          <motion.div
            className="absolute -top-5 z-20"
            animate={{ left: `${progress}%`, rotate: current % 2 ? 6 : -6 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            style={{ x: catX }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cat-rocket.png"
              alt=""
              width={54}
              height={54}
              draggable={false}
              className="select-none object-contain drop-shadow-[0_0_12px_rgba(167,139,250,0.75)]"
            />
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
