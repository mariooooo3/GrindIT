import { useMemo } from "react";

type Star = {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
};

function makeStars(count: number, seed = 1): Star[] {
  // Simple seeded PRNG so SSR/CSR match
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    top: `${rand() * 100}%`,
    left: `${rand() * 100}%`,
    size: rand() < 0.85 ? 1 : rand() < 0.95 ? 2 : 3,
    delay: `${(rand() * 6).toFixed(2)}s`,
    duration: `${(2.5 + rand() * 4).toFixed(2)}s`,
    opacity: 0.35 + rand() * 0.55,
  }));
}

export default function SpaceBackground() {
  const stars = useMemo(() => makeStars(110, 7), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "#080810" }}
    >
      {/* Base vertical gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #05050d 0%, #0a0820 45%, #08081a 70%, #050510 100%)",
        }}
      />

      {/* Soft violet nebula glows (kept away from vertical middle 60%) */}
      <div
        className="absolute -left-24 -top-24 h-[60vw] w-[60vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0) 70%)",
          animation: "sb-nebula 16s ease-in-out infinite",
          contain: "strict",
        }}
      />
      <div
        className="absolute -right-32 bottom-[-10%] h-[70vw] w-[70vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(76,29,149,0.08) 50%, rgba(0,0,0,0) 75%)",
          animation: "sb-nebula 22s ease-in-out infinite reverse",
          contain: "strict",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(91,33,182,0.18) 0%, rgba(8,8,16,0) 65%)",
          contain: "strict",
        }}
      />

      {/* Stars */}
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow:
              star.size > 1 ? "0 0 4px rgba(196,181,253,0.8)" : undefined,
            animation: `sb-twinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}

      {/* Planet 1 — top left, small */}
      <div
        className="absolute"
        style={{
          top: "8%",
          left: "10%",
          width: "70px",
          height: "70px",
          animation: "sb-float-a 14s ease-in-out infinite",
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #c4b5fd 0%, #7c3aed 45%, #2e1065 100%)",
            boxShadow:
              "0 0 40px 8px rgba(139,92,246,0.45), inset -6px -10px 20px rgba(0,0,0,0.55)",
          }}
        />
      </div>

      {/* Planet 2 — bottom right, medium */}
      <div
        className="absolute"
        style={{
          bottom: "10%",
          right: "-30px",
          width: "140px",
          height: "140px",
          animation: "sb-float-b 18s ease-in-out infinite",
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #a78bfa 0%, #6d28d9 50%, #1e1b4b 100%)",
            boxShadow:
              "0 0 60px 14px rgba(124,58,237,0.45), inset -10px -16px 32px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      {/* Planet 3 — top right tiny */}
      <div
        className="absolute"
        style={{
          top: "14%",
          right: "12%",
          width: "36px",
          height: "36px",
          animation: "sb-float-c 12s ease-in-out infinite",
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #ddd6fe 0%, #8b5cf6 55%, #3b0764 100%)",
            boxShadow:
              "0 0 24px 5px rgba(167,139,250,0.5), inset -3px -5px 10px rgba(0,0,0,0.55)",
          }}
        />
      </div>

      <style>{`
        @keyframes sb-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes sb-float-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, 14px); }
        }
        @keyframes sb-float-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-14px, -18px); }
        }
        @keyframes sb-float-c {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-6px, 10px); }
        }
        @keyframes sb-nebula {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          50% { transform: translate(10px, -10px) scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}