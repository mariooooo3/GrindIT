import { useMemo, useId, type CSSProperties } from "react";

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

// ── Surface patterns ──────────────────────────────────────────────────────
// Each pattern is a translucent CSS overlay clipped to the planet disc, so the
// base radial shading still reads through. They use plain rgba (no blend modes)
// to stay robust and to never bleed into the space background behind the disc.
const PATTERNS: Record<string, CSSProperties> = {
  // gas-giant horizontal banding
  bands: {
    background:
      "repeating-linear-gradient(168deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 9px, rgba(255,255,255,0.12) 9px, rgba(255,255,255,0.12) 11px, rgba(255,255,255,0) 11px, rgba(255,255,255,0) 18px)",
  },
  // near-vertical longitude lines
  meridians: {
    background:
      "repeating-linear-gradient(86deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 10px, rgba(255,255,255,0.10) 10px, rgba(255,255,255,0.10) 11px, rgba(255,255,255,0) 11px, rgba(255,255,255,0) 19px)",
  },
  // lat/long grid
  grid: {
    background:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 12px), repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 12px)",
  },
  // pocked, moon-like craters
  craters: {
    background:
      "radial-gradient(circle at 30% 32%, rgba(0,0,0,0.32) 0 7%, rgba(255,255,255,0.10) 8%, rgba(0,0,0,0) 12%), radial-gradient(circle at 66% 58%, rgba(0,0,0,0.28) 0 9%, rgba(0,0,0,0) 13%), radial-gradient(circle at 48% 76%, rgba(0,0,0,0.22) 0 5%, rgba(0,0,0,0) 8%), radial-gradient(circle at 73% 27%, rgba(0,0,0,0.20) 0 4%, rgba(0,0,0,0) 6%)",
  },
  // topographic contour rings
  contours: {
    background:
      "repeating-radial-gradient(circle at 42% 38%, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 10px)",
  },
  // dusting of bright speckles
  speckle: {
    background: "radial-gradient(rgba(255,255,255,0.6) 0.6px, rgba(255,255,255,0) 1.4px)",
    backgroundSize: "6px 6px",
  },
  // halftone dot field
  halftone: {
    background: "radial-gradient(rgba(0,0,0,0.30) 1.4px, rgba(0,0,0,0) 1.9px)",
    backgroundSize: "8px 8px",
  },
  // storm swirl
  swirl: {
    background:
      "conic-gradient(from 200deg at 58% 42%, rgba(255,255,255,0.18), rgba(255,255,255,0) 22%, rgba(0,0,0,0.26) 52%, rgba(0,0,0,0) 80%, rgba(255,255,255,0.14))",
  },
  // diagonal weave
  stripes: {
    background:
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.20) 0px, rgba(0,0,0,0.20) 4px, rgba(0,0,0,0) 4px, rgba(0,0,0,0) 11px)",
  },
  // marbled blobs
  marble: {
    background:
      "radial-gradient(circle at 26% 24%, rgba(255,255,255,0.22), rgba(255,255,255,0) 40%), radial-gradient(circle at 74% 72%, rgba(0,0,0,0.26), rgba(0,0,0,0) 46%), radial-gradient(circle at 62% 32%, rgba(255,255,255,0.10), rgba(255,255,255,0) 30%)",
  },
  // molten blobs (bright + dark pools)
  lava: {
    background:
      "radial-gradient(circle at 35% 40%, rgba(255,255,255,0.22) 0 10%, rgba(255,255,255,0) 14%), radial-gradient(circle at 62% 64%, rgba(255,255,255,0.16) 0 8%, rgba(255,255,255,0) 12%), radial-gradient(circle at 70% 30%, rgba(0,0,0,0.24) 0 9%, rgba(0,0,0,0) 13%), radial-gradient(circle at 30% 72%, rgba(0,0,0,0.20) 0 7%, rgba(0,0,0,0) 11%)",
  },
};

// Surface patterns used for the seed-driven texture pool. The Saturn "rings"
// variant is deliberately NOT here — it's reserved for a curated set of slides
// (see RING_ACCENTS) where a ringed planet reads best, rather than appearing at
// random on every slide.
const PATTERN_NAMES = [
  "bands", "craters", "speckle", "swirl", "stripes", "marble",
  "meridians", "grid", "contours", "halftone", "lava",
] as const;

// Slides (keyed by their accent) whose big bottom-right planet gets the ring.
// Picked where it looks best: violet (intro/landing), gold (journey, classic
// Saturn), green (top repo). Easy to extend — just add an accent hex.
const RING_ACCENTS = new Set(["#8b5cf6", "#fbbf24", "#34d399"]);

type Colors = { mid: string; light: string; dark: string };

// ── Saturn-style ringed planet ────────────────────────────────────────────
// SVG so the ring can pass BEHIND the disc at the top and IN FRONT at the
// bottom — the crossing is what sells it as a ring rather than a wire loop.
function RingedPlanet({ size, accent, colors, glow }: { size: number; accent: string; colors: Colors; glow: string }) {
  const id = useId().replace(/[:]/g, "");
  const ring = lighten(accent, 0.5);
  // Two equal semicircle arcs between the ring's left/right tips: one over the
  // top (drawn behind the disc), one under the bottom (drawn over the disc).
  const backArc = "M14,70 A96,27 0 0,0 206,70";
  const frontArc = "M14,70 A96,27 0 0,1 206,70";
  return (
    <svg
      viewBox="0 0 220 140"
      style={{
        position: "absolute", left: "50%", top: "50%",
        width: `${size * 2.2}px`, height: `${size * 1.4}px`,
        transform: "translate(-50%,-50%)", overflow: "visible",
      }}
    >
      <defs>
        <radialGradient id={`${id}-disc`} cx="35%" cy="32%" r="72%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="52%" stopColor={colors.mid} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="50%" cy="50%" r="50%">
          <stop offset="58%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor={`${glow}0)`} />
          <stop offset="85%" stopColor={`${glow}0.32)`} />
          <stop offset="100%" stopColor={`${glow}0)`} />
        </radialGradient>
      </defs>

      {/* outer glow ring */}
      <circle cx="110" cy="70" r="66" fill={`url(#${id}-halo)`} />

      {/* ring — back half (behind the planet) */}
      <g transform="rotate(-18 110 70)">
        <path d={backArc} fill="none" stroke={ring} strokeWidth="10" strokeLinecap="round" opacity="0.45" />
      </g>

      {/* planet disc + bottom-right shading */}
      <circle cx="110" cy="70" r="50" fill={`url(#${id}-disc)`} />
      <circle cx="110" cy="70" r="50" fill={`url(#${id}-shade)`} />

      {/* ring — front half (over the planet), with a thin Cassini-gap line */}
      <g transform="rotate(-18 110 70)">
        <path d={frontArc} fill="none" stroke={ring} strokeWidth="10" strokeLinecap="round" opacity="0.92" />
        <path d={frontArc} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
}

type PlanetSpec = {
  pos: CSSProperties;
  size: number;
  anim: string;
  grad: (c: Colors) => string;
  shadow: (glow: string) => string;
  lightT: number;
  darkT: number;
};

// Positions/sizes/animations are unchanged from the original 3 planets.
const PLANETS: PlanetSpec[] = [
  {
    pos: { top: "14%", left: "3%" }, size: 70,
    anim: "sb-float-a 14s ease-in-out infinite",
    grad: (c) => `radial-gradient(circle at 30% 30%, ${c.light} 0%, ${c.mid} 45%, ${c.dark} 100%)`,
    shadow: (g) => `0 0 40px 8px ${g}0.4), inset -6px -10px 20px rgba(0,0,0,0.55)`,
    lightT: 0.45, darkT: 0.72,
  },
  {
    pos: { bottom: "10%", right: "-30px" }, size: 140,
    anim: "sb-float-b 18s ease-in-out infinite",
    grad: (c) => `radial-gradient(circle at 35% 30%, ${c.light} 0%, ${c.mid} 50%, ${c.dark} 100%)`,
    shadow: (g) => `0 0 60px 14px ${g}0.4), inset -10px -16px 32px rgba(0,0,0,0.6)`,
    lightT: 0.3, darkT: 0.8,
  },
  {
    pos: { top: "20%", right: "3%" }, size: 36,
    anim: "sb-float-c 12s ease-in-out infinite",
    grad: (c) => `radial-gradient(circle at 30% 30%, ${c.light} 0%, ${c.mid} 55%, ${c.dark} 100%)`,
    shadow: (g) => `0 0 24px 5px ${g}0.45), inset -3px -5px 10px rgba(0,0,0,0.55)`,
    lightT: 0.55, darkT: 0.72,
  },
];

export default function SpaceBackground({ accent = "#8b5cf6" }: { accent?: string }) {
  const stars = useMemo(() => makeStars(110, 7), []);
  const mid = accent;
  const { r, g, b } = hexToRgb(accent);
  const glow = `rgba(${r},${g},${b},`;
  // Deterministic pattern set per accent → every slide (each has a unique accent)
  // gets a different trio of surface textures, varying by pattern as well as hue.
  const seed = useMemo(
    () => Math.abs([...accent].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)),
    [accent],
  );

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
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute -right-32 bottom-[-10%] h-[70vw] w-[70vw] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${glow}0.16) 0%, ${glow}0.06) 50%, rgba(0,0,0,0) 75%)`,
          animation: "sb-nebula 22s ease-in-out infinite reverse",
          contain: "strict",
          willChange: "transform, opacity",
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
            boxShadow: star.size > 1 ? "0 0 4px rgba(196,181,253,0.7)" : undefined,
            animation: `sb-twinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}

      {/* Planets — each gets a distinct surface pattern from the per-accent seed.
          The big bottom-right planet (index 1) is ringed only on curated slides. */}
      {PLANETS.map((p, i) => {
        const ringed = i === 1 && RING_ACCENTS.has(accent.toLowerCase());
        const name = ringed ? "rings" : PATTERN_NAMES[(seed + i) % PATTERN_NAMES.length];
        const colors: Colors = { mid, light: lighten(accent, p.lightT), dark: darken(accent, p.darkT) };
        return (
          <div
            key={i}
            className="absolute"
            style={{ ...p.pos, width: `${p.size}px`, height: `${p.size}px`, animation: p.anim, willChange: "transform" }}
          >
            {name === "rings" ? (
              <RingedPlanet size={p.size} accent={accent} colors={colors} glow={glow} />
            ) : (
              <div
                className="relative h-full w-full overflow-hidden rounded-full"
                style={{ background: p.grad(colors), boxShadow: p.shadow(glow) }}
              >
                <div className="absolute inset-0 rounded-full" style={PATTERNS[name]} />
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes sb-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes sb-float-a {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(8px, 14px, 0); }
        }
        @keyframes sb-float-b {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-14px, -18px, 0); }
        }
        @keyframes sb-float-c {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-6px, 10px, 0); }
        }
        @keyframes sb-nebula {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.9; }
          50% { transform: translate3d(10px, -10px, 0) scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
