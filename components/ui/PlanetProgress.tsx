"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

function WorldCupBall({
  size = 28,
  glow = false,
}: {
  size?: number;
  glow?: boolean;
}) {
  const wave = "M31 33 C 35 25 24 21 25 13 C 25.5 8.5 21 6.5 15 8";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden
      className={glow ? "drop-shadow-[0_0_10px_rgba(250,204,21,0.75)]" : undefined}
    >
      <defs>
        <radialGradient id="wcBallSphereProgress" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#eef1f5" />
          <stop offset="100%" stopColor="#bcc2cc" />
        </radialGradient>
        <radialGradient id="wcBallGlossProgress" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="wcBallClipProgress">
          <circle cx="32" cy="32" r="28" />
        </clipPath>
      </defs>

      <circle cx="32" cy="32" r="28" fill="url(#wcBallSphereProgress)" />
      <g clipPath="url(#wcBallClipProgress)" fill="none" strokeLinecap="round">
        <path d={wave} stroke="#c8163d" strokeWidth="9" />
        <path d={wave} stroke="#1f9d4d" strokeWidth="9" transform="rotate(120 32 32)" />
        <path d={wave} stroke="#1d7fe0" strokeWidth="9" transform="rotate(240 32 32)" />
      </g>
      <g clipPath="url(#wcBallClipProgress)" fill="none" stroke="#2a2e38" strokeLinecap="round" opacity="0.7">
        <path d="M5 25 Q 32 15 59 25" strokeWidth="1.8" />
        <path d="M5 39 Q 32 49 59 39" strokeWidth="1.8" />
        <path d="M23 4 Q 13 32 23 60" strokeWidth="1.6" />
        <path d="M41 4 Q 51 32 41 60" strokeWidth="1.6" />
      </g>
      <g clipPath="url(#wcBallClipProgress)">
        <circle cx="32" cy="32" r="6.8" fill="#1d7fe0" />
        <circle cx="32" cy="32" r="6.8" fill="none" stroke="#ffffff" strokeWidth="1.6" />
        <circle cx="32" cy="32" r="2.7" fill="#ffffff" opacity="0.9" />
      </g>
      <ellipse
        cx="23"
        cy="20"
        rx="12"
        ry="8"
        fill="url(#wcBallGlossProgress)"
        transform="rotate(-28 23 20)"
        clipPath="url(#wcBallClipProgress)"
      />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#000000" strokeOpacity="0.16" strokeWidth="1.2" />
    </svg>
  );
}

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
  const { worldCup } = useTheme();
  const lastIdx = Math.max(1, total - 1);
  const progress = (current / lastIdx) * 100;
  const biasPx = -16;

  if (worldCup) {
    return (
      <nav aria-label="Wrapped journey" className="relative flex h-10 w-full items-center sm:h-12">
        <div className="pointer-events-none absolute left-[24px] right-[24px] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/10 sm:left-[72px] sm:right-[72px]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-fuchsia-400"
            animate={{ width: `${progress}%` }}
            transition={{ type: "tween", duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            style={{ boxShadow: "0 0 16px rgba(250,204,21,0.35)" }}
          />
        </div>

        <div className="relative flex w-full items-center justify-between px-[18px] sm:px-[72px]">
          {Array.from({ length: total }).map((_, i) => {
            const active = current === i;
            const done = i <= current;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onNavigate(i)}
                aria-label={`Go to match event ${i + 1}`}
                aria-current={active ? "step" : undefined}
                className="relative z-10 grid h-7 w-7 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50 sm:h-9 sm:w-9"
              >
                <motion.span
                  animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={active ? { repeat: Infinity, duration: 1.8 } : { duration: 0.2 }}
                  className="grid h-5 min-w-[26px] place-items-center rounded-[4px] border px-1 text-[8px] font-black tracking-[0.18em] sm:h-7 sm:min-w-[34px] sm:rounded-[5px] sm:text-[9px]"
                  style={{
                    borderColor: active ? "rgba(250,204,21,0.9)" : done ? "rgba(250,204,21,0.45)" : "rgba(255,255,255,0.12)",
                    background: active
                      ? "linear-gradient(180deg, rgba(55,35,10,0.96), rgba(24,14,6,0.96))"
                      : done
                        ? "linear-gradient(180deg, rgba(42,28,9,0.92), rgba(20,12,5,0.92))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                    color: active ? "#fde68a" : done ? "rgba(255,233,160,0.88)" : "rgba(255,255,255,0.38)",
                    boxShadow: active
                      ? "0 0 14px rgba(250,204,21,0.28), inset 0 1px 0 rgba(255,255,255,0.14)"
                      : done
                        ? "inset 0 1px 0 rgba(255,255,255,0.08)"
                        : "inset 0 1px 0 rgba(255,255,255,0.04)",
                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>
              </button>
            );
          })}

          <div className="pointer-events-none absolute left-[27px] right-[27px] top-0 sm:left-[88px] sm:right-[88px]">
            <motion.div
              className="absolute -top-[9px] z-20 sm:-top-[11px]"
              animate={{ left: `${progress}%` }}
              transition={{ type: "tween", duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              style={{ x: "-50%" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <WorldCupBall size={32} glow />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </nav>
    );
  }

  const travelColor = colors[current] ?? "#a78bfa";

  return (
    <nav aria-label="Wrapped journey" className="relative flex h-8 w-full items-center sm:h-10">
      {/* base path — the journey still ahead */}
      <div className="pointer-events-none absolute left-[24px] right-[24px] top-1/2 -translate-y-1/2 border-t border-dashed border-white/15 sm:left-[72px] sm:right-[72px]" />
      {/* traveled path — glowing trail filling up to the current planet */}
      <div className="pointer-events-none absolute left-[24px] right-[24px] top-1/2 -translate-y-1/2 sm:left-[72px] sm:right-[72px]">
        <motion.div
          className="absolute left-0 top-0 h-[2px] -translate-y-1/2 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: "tween", duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: `linear-gradient(90deg, ${travelColor}55, ${travelColor})`,
            boxShadow: `0 0 12px ${travelColor}aa`,
          }}
        />
      </div>

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
