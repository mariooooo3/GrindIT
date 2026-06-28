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

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lighten(hex: string, t = 0.45): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r + (255 - r) * t)},${Math.round(g + (255 - g) * t)},${Math.round(b + (255 - b) * t)})`;
}

function darken(hex: string, t = 0.72): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r * (1 - t))},${Math.round(g * (1 - t))},${Math.round(b * (1 - t))})`;
}

export default function SpaceBackground({ accent = "#8b5cf6" }: { accent?: string }) {
  const stars = useMemo(() => makeStars(110, 7), []);
  const light = lighten(accent);
  const mid   = accent;
  const dark  = darken(accent);
  const { r, g, b } = hexToRgb(accent);
  const glow  = `rgba(${r},${g},${b},`;

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

      {/* Soft nebula glows tinted with accent */}
      <div
        className="absolute -left-24 -top-24 h-[60vw] w-[60vw] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${glow}0.22) 0%, ${glow}0) 70%)`,
          animation: "sb-nebula 16s ease-in-out infinite",
          contain: "strict",
        }}
      />
      <div
        className="absolute -right-32 bottom-[-10%] h-[70vw] w-[70vw] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${glow}0.16) 0%, ${glow}0.06) 50%, rgba(0,0,0,0) 75%)`,
          animation: "sb-nebula 22s ease-in-out infinite reverse",
          contain: "strict",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${glow}0.14) 0%, rgba(8,8,16,0) 65%)`,
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
          top: "14%",
          left: "3%",
          width: "70px",
          height: "70px",
          animation: "sb-float-a 14s ease-in-out infinite",
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${light} 0%, ${mid} 45%, ${dark} 100%)`,
            boxShadow: `0 0 40px 8px ${glow}0.4), inset -6px -10px 20px rgba(0,0,0,0.55)`,
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
            background: `radial-gradient(circle at 35% 30%, ${lighten(accent, 0.3)} 0%, ${mid} 50%, ${darken(accent, 0.8)} 100%)`,
            boxShadow: `0 0 60px 14px ${glow}0.4), inset -10px -16px 32px rgba(0,0,0,0.6)`,
          }}
        />
      </div>

      {/* Planet 3 — top right tiny */}
      <div
        className="absolute"
        style={{
          top: "20%",
          right: "3%",
          width: "36px",
          height: "36px",
          animation: "sb-float-c 12s ease-in-out infinite",
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${lighten(accent, 0.55)} 0%, ${mid} 55%, ${dark} 100%)`,
            boxShadow: `0 0 24px 5px ${glow}0.45), inset -3px -5px 10px rgba(0,0,0,0.55)`,
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
