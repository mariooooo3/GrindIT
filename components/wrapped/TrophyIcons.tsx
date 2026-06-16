import type { ReactNode } from "react";

// Thematic stroke-based icons used for trophies & badges across the wrapped
// slides. Single colour (inherits `color`/currentColor) so the parent can tint
// each glyph by rarity and add a glow. No emoji.
export type GlyphName =
  | "flame" | "moon" | "owl" | "bolt" | "hammer" | "broom" | "globe" | "star"
  | "crown" | "rocket" | "compass" | "columns" | "calendar" | "skull" | "swords"
  | "medal" | "sparkles" | "gauge" | "book" | "wrench" | "diamond" | "users"
  | "shield" | "fork" | "sunrise" | "trending" | "target" | "layers" | "trophy"
  | "heart" | "feather" | "telescope"
  | "infinity" | "mountain" | "atom" | "satellite" | "hourglass" | "bug"
  | "snowflake" | "flask" | "merge" | "coffee";

function inner(name: GlyphName): ReactNode {
  switch (name) {
    case "flame":
      return <path d="M12 3c1 3 3 4.5 3.5 6.5C16 12 14.5 14 12 14s-4-2-3.5-4.5C9 8 9.5 6.5 9 5c2 .5 2.5 1.5 3-2Z M7 14a5 5 0 1 0 10 0c0-2-1-3.5-2.5-5C15 12 13.5 13 12 13s-3-1-2.5-4C8 10.5 7 12 7 14Z" fill="currentColor" fillOpacity="0.14" />;
    case "moon":
      return <path d="M19 13.5A7.5 7.5 0 0 1 10.5 5a1 1 0 0 0-1.3-1A8.5 8.5 0 1 0 20 14.8a1 1 0 0 0-1-1.3Z" fill="currentColor" fillOpacity="0.14" />;
    case "owl":
      return (
        <>
          <path d="M5 9.5C5 5.5 8 4 12 4s7 1.5 7 5.5c0 5.5-3 9.5-7 9.5s-7-4-7-9.5Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M6 6 4 3.5M18 6l2-2.5" />
          <circle cx="9.2" cy="10.5" r="2.4" /><circle cx="14.8" cy="10.5" r="2.4" />
          <circle cx="9.2" cy="10.7" r="0.7" fill="currentColor" /><circle cx="14.8" cy="10.7" r="0.7" fill="currentColor" />
          <path d="M11 13.4 12 14.6 13 13.4" />
        </>
      );
    case "bolt":
      return <path d="M13 2 4 13h6l-1 9 9-12h-6l1-8Z" fill="currentColor" fillOpacity="0.14" />;
    case "hammer":
      return (
        <>
          <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
          <path d="M17.6 6.4 14 10l-2-2 3.6-3.6a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8Z" fill="currentColor" fillOpacity="0.14" />
        </>
      );
    case "broom":
      return (
        <>
          <path d="M19 4 11 12" />
          <path d="M11 12 4 19l1 1 7-7" />
          <path d="M9 14c-2 1-3 3-3 5 2 0 4-1 5-3" fill="currentColor" fillOpacity="0.12" />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" fill="currentColor" fillOpacity="0.08" />
          <path d="M3.5 12h17M12 3.5c2.5 2.3 2.5 14.7 0 17M12 3.5c-2.5 2.3-2.5 14.7 0 17" />
        </>
      );
    case "star":
      return <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.4 6.1 21.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z" fill="currentColor" fillOpacity="0.18" />;
    case "crown":
      return (
        <>
          <path d="M3 18 5 8l4.5 4L12 5l2.5 7L19 8l2 10Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M4 20h16" />
        </>
      );
    case "rocket":
      return (
        <>
          <path d="M12 2c3 1.5 5 5 5 9l-2 4H9l-2-4c0-4 2-7.5 5-9Z" fill="currentColor" fillOpacity="0.12" />
          <circle cx="12" cy="9" r="2" />
          <path d="M9 16c-1.5 1-2 2.5-2 4 1.5 0 3-.5 4-2M15 16c1.5 1 2 2.5 2 4-1.5 0-3-.5-4-2" />
        </>
      );
    case "compass":
      return (
        <>
          <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.07" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" fill="currentColor" fillOpacity="0.2" />
        </>
      );
    case "columns":
      return (
        <>
          <path d="M4 8 12 3l8 5" fill="currentColor" fillOpacity="0.12" />
          <path d="M6 9v8M12 9v8M18 9v8M4 20h16M4 8.5h16" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="currentColor" fillOpacity="0.08" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
          <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" />
        </>
      );
    case "skull":
      return (
        <>
          <path d="M5 11a7 7 0 1 1 14 0c0 2.2-1 3.8-2.5 4.7V18a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 18v-2.3C6 14.8 5 13.2 5 11Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="9.3" cy="11" r="1.5" fill="currentColor" /><circle cx="14.7" cy="11" r="1.5" fill="currentColor" />
          <path d="M11 19.5v-2M13 19.5v-2" />
        </>
      );
    case "swords":
      return (
        <>
          <path d="M14.5 3.5 20.5 9.5 18 12 12 6Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M9.5 3.5 3.5 9.5 6 12 12 6Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M6 12 3.5 14.5 5 16l2.5-2.5M18 12l2.5 2.5L19 16l-2.5-2.5" />
        </>
      );
    case "medal":
      return (
        <>
          <path d="M8 3h8l-2.5 6h-3L8 3Z" fill="currentColor" fillOpacity="0.12" />
          <circle cx="12" cy="15" r="5.5" fill="currentColor" fillOpacity="0.12" />
          <path d="m12 12.2 1.1 2.3 2.4.3-1.8 1.7.5 2.5-2.2-1.2-2.2 1.2.5-2.5-1.8-1.7 2.4-.3 1.1-2.3Z" fill="currentColor" fillOpacity="0.3" />
        </>
      );
    case "sparkles":
      return (
        <>
          <path d="M12 3c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5Z" fill="currentColor" fillOpacity="0.18" />
          <path d="M18.5 14c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z" fill="currentColor" fillOpacity="0.18" />
        </>
      );
    case "gauge":
      return (
        <>
          <path d="M4 16a8 8 0 1 1 16 0" fill="currentColor" fillOpacity="0.07" />
          <path d="m12 16 4-5" />
          <circle cx="12" cy="16" r="1.4" fill="currentColor" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" fill="currentColor" fillOpacity="0.05" />
        </>
      );
    case "wrench":
      return <path d="M14.7 6.3a4 4 0 0 0-5 5L3.5 17.5a2.1 2.1 0 0 0 3 3l6.2-6.2a4 4 0 0 0 5-5l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" fill="currentColor" fillOpacity="0.12" />;
    case "diamond":
      return (
        <>
          <path d="M6 4h12l3 5-9 11L3 9l3-5Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M3 9h18M9 4 7 9l5 11M15 4l2 5-5 11" />
        </>
      );
    case "users":
      return (
        <>
          <circle cx="9" cy="8" r="3.2" fill="currentColor" fillOpacity="0.12" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" fill="currentColor" fillOpacity="0.08" />
          <path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3 5 6v5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V6l-7-3Z" fill="currentColor" fillOpacity="0.1" />
          <path d="m9 11.5 2 2 3.5-3.8" />
        </>
      );
    case "fork":
      return (
        <>
          <circle cx="6" cy="6" r="2.6" /><circle cx="18" cy="6" r="2.6" /><circle cx="12" cy="18" r="2.6" />
          <path d="M6 8.6v1.4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8.6M12 12v3.4" />
        </>
      );
    case "sunrise":
      return (
        <>
          <path d="M5 18h14M3 21h18M8 18a4 4 0 0 1 8 0" fill="currentColor" fillOpacity="0.12" />
          <path d="M12 3v4M5.6 8.6 7 10M18.4 8.6 17 10M3 14h2M19 14h2" />
        </>
      );
    case "trending":
      return <path d="M3 17 10 10l4 4 7-7M15 7h6v6" fill="none" />;
    case "target":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" fill="currentColor" fillOpacity="0.06" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        </>
      );
    case "layers":
      return (
        <>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" fill="currentColor" fillOpacity="0.14" />
          <path d="m3 13 9 5 9-5M3 16.5l9 5 9-5" />
        </>
      );
    case "trophy":
      return (
        <>
          <path d="M7 4h10v5c0 3-2.2 5.5-5 5.5S7 12 7 9V4Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M7 5.5H4.5V8c0 1.8 1.4 3 3 3.2M17 5.5h2.5V8c0 1.8-1.4 3-3 3.2M10 14.5v2.5M14 14.5v2.5M8 20h8M9.5 17h5l.5 3h-6l.5-3Z" />
        </>
      );
    case "heart":
      return <path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.8C19 15.7 12 20 12 20Z" fill="currentColor" fillOpacity="0.14" />;
    case "feather":
      return (
        <>
          <path d="M19 5a5.5 5.5 0 0 0-7.8 0L5 11.2V19h7.8L19 12.8A5.5 5.5 0 0 0 19 5Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M16 8 8 16M14 9H9.5M14.5 12.5H10" />
        </>
      );
    case "telescope":
      return (
        <>
          <path d="m3.5 14 11-4 1.5 4-11 4-1.5-4Z" fill="currentColor" fillOpacity="0.12" />
          <path d="m14.5 10 3-1.2 1.3 3.4-3 1.2M9 16l2 5M6.5 17l2 4" />
        </>
      );
    case "infinity":
      return (
        <>
          <path d="M12 12C10 9.2 7.5 8 5.5 8A3.5 3.5 0 0 0 5.5 15C7.5 15 10 13.8 12 12Z" fill="currentColor" fillOpacity="0.18" />
          <path d="M12 12C14 9.2 16.5 8 18.5 8A3.5 3.5 0 0 1 18.5 15C16.5 15 14 13.8 12 12Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M12 12C10 9.2 7.5 8 5.5 8A3.5 3.5 0 0 0 5.5 15C7.5 15 10 13.8 12 12C14 9.2 16.5 8 18.5 8A3.5 3.5 0 0 1 18.5 15C16.5 15 14 13.8 12 12Z" />
        </>
      );
    case "mountain":
      return (
        <>
          <path d="M2 21L9 8l4 6.5 3.5-8L22 21Z" fill="currentColor" fillOpacity="0.10" />
          <path d="M2 21L9 8l4 6.5 3.5-8L22 21H2Z" />
          <path d="M15.5 7.5l-1.2 3.5-2-2Z" fill="currentColor" fillOpacity="0.45" />
        </>
      );
    case "atom":
      return (
        <>
          <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.55" />
          <circle cx="12" cy="12" r="2" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="currentColor" fillOpacity="0.06" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" fill="currentColor" fillOpacity="0.06" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)" fill="currentColor" fillOpacity="0.06" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)" />
        </>
      );
    case "satellite":
      return (
        <>
          <rect x="2" y="10.5" width="7" height="3" rx="0.7" fill="currentColor" fillOpacity="0.14" />
          <rect x="15" y="10.5" width="7" height="3" rx="0.7" fill="currentColor" fillOpacity="0.14" />
          <rect x="2" y="10.5" width="7" height="3" rx="0.7" />
          <rect x="15" y="10.5" width="7" height="3" rx="0.7" />
          <rect x="9" y="9" width="6" height="6" rx="1.2" fill="currentColor" fillOpacity="0.22" />
          <rect x="9" y="9" width="6" height="6" rx="1.2" />
          <line x1="12" y1="9" x2="16.5" y2="4.5" />
          <circle cx="17" cy="4" r="1" fill="currentColor" />
          <line x1="5" y1="10.5" x2="5" y2="13.5" strokeOpacity="0.35" />
          <line x1="18.5" y1="10.5" x2="18.5" y2="13.5" strokeOpacity="0.35" />
        </>
      );
    case "hourglass":
      return (
        <>
          <path d="M7 3l5 8.5 5-8.5H7Z" fill="currentColor" fillOpacity="0.10" />
          <path d="M7 21l5-8.5 5 8.5H7Z" fill="currentColor" fillOpacity="0.32" />
          <path d="M5 3h14M5 21h14" />
          <path d="M7 3l5 8.5 5-8.5" />
          <path d="M7 21l5-8.5 5 8.5" />
          <line x1="12" y1="11.5" x2="12" y2="12.5" strokeWidth="1.8" />
        </>
      );
    case "bug":
      return (
        <>
          <ellipse cx="12" cy="13.5" rx="3.8" ry="5" fill="currentColor" fillOpacity="0.12" />
          <circle cx="12" cy="7.5" r="2.5" fill="currentColor" fillOpacity="0.12" />
          <ellipse cx="12" cy="13.5" rx="3.8" ry="5" />
          <circle cx="12" cy="7.5" r="2.5" />
          <line x1="12" y1="8.5" x2="12" y2="18.5" strokeOpacity="0.38" />
          <path d="M8.2 11L4 9.5M8.2 13.5H3.5M8.2 16.5L4 18" />
          <path d="M15.8 11L20 9.5M15.8 13.5H20.5M15.8 16.5L20 18" />
          <path d="M10.2 5.5L8 3M13.8 5.5L16 3" />
          <circle cx="10.7" cy="7.5" r="0.8" fill="currentColor" />
          <circle cx="13.3" cy="7.5" r="0.8" fill="currentColor" />
        </>
      );
    case "snowflake":
      return (
        <>
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
          <path d="M12 6.5L10.2 8.3M12 6.5L13.8 8.3" />
          <path d="M12 17.5L10.2 15.7M12 17.5L13.8 15.7" />
          <path d="M6.5 12L8.3 10.2M6.5 12L8.3 13.8" />
          <path d="M17.5 12L15.7 10.2M17.5 12L15.7 13.8" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M9 3v6L4.5 16.5A2 2 0 0 0 6.4 19.5h11.2A2 2 0 0 0 19.5 16.5L15 9V3" fill="currentColor" fillOpacity="0.08" />
          <path d="M9 3v6L4.5 16.5A2 2 0 0 0 6.4 19.5h11.2A2 2 0 0 0 19.5 16.5L15 9V3" />
          <line x1="9" y1="3" x2="15" y2="3" />
          <path d="M7.2 17.5C8.5 16.2 10.2 15.5 12 15.5s3.5.7 4.8 2" fill="currentColor" fillOpacity="0.32" />
          <circle cx="9.5" cy="18" r="0.7" fill="currentColor" fillOpacity="0.5" />
          <circle cx="13.2" cy="17.2" r="0.55" fill="currentColor" fillOpacity="0.5" />
        </>
      );
    case "merge":
      return (
        <>
          <circle cx="6" cy="5" r="2.5" fill="currentColor" fillOpacity="0.20" />
          <circle cx="18" cy="5" r="2.5" fill="currentColor" fillOpacity="0.20" />
          <circle cx="12" cy="19" r="2.5" fill="currentColor" fillOpacity="0.20" />
          <circle cx="6" cy="5" r="2.5" />
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="12" cy="19" r="2.5" />
          <path d="M6 7.5C6 11.5 9 15 12 16.5" />
          <path d="M18 7.5C18 11.5 15 15 12 16.5" />
        </>
      );
    case "coffee":
      return (
        <>
          <path d="M6 8h12l-1.2 9.5a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M6 8h12l-1.2 9.5a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8Z" />
          <path d="M17.5 9.5h1.8a2.2 2.2 0 0 1 0 4.4H17" />
          <path d="M4.5 19.8h15" />
          <path d="M5.5 10.5h13" strokeOpacity="0.3" />
          <path d="M9 6.2c0 0-.7-1.4 0-2.7M12 5.8c0 0-.7-1.4 0-2.7M15 6.2c0 0-.7-1.4 0-2.7" />
        </>
      );
  }
}

export function Glyph({ name, size = 22, className, color }: { name: GlyphName; size?: number; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color ?? "currentColor"} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden>
      {inner(name)}
    </svg>
  );
}
