"use client";

import { useEffect, useState, type ReactNode } from "react";

// Reference desktop height for scale calculation.
// scale = physicalHeight / DESKTOP_H → 100dvh ≈ DESKTOP_H after browser scales content.
const DESKTOP_H = 810;

type ViewportState = "desktop" | "landscape" | "portrait";

function applyLandscapeViewport(w: number, h: number) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) return;
  // w and h must be the PHYSICAL CSS pixel dimensions (captured before any viewport change).
  // scale makes 100dvh ≈ DESKTOP_H; cssWidth ensures 100vw ≈ desktop width → lg: fires.
  const scale = h / DESKTOP_H;
  const cssWidth = Math.round(w / scale);
  meta.content = `width=${cssWidth}, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=no, viewport-fit=cover`;
}

function resetViewport() {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (meta) meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
}

function applyPhone(w: number, h: number, set: (s: ViewportState) => void) {
  if (w > h) {
    applyLandscapeViewport(w, h);
    set("landscape");
  } else {
    resetViewport();
    set("portrait");
  }
}

// ── Portrait overlay ────────────────────────────────────────────────────────
function PortraitOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
      style={{ background: "var(--space-deep, #080612)" }}
    >
      <style>{`
        @keyframes mg-phone-tilt {
          0%, 30%  { transform: rotate(0deg); }
          55%, 75% { transform: rotate(-90deg); }
          100%     { transform: rotate(0deg); }
        }
        @keyframes mg-glow-pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 0.55; transform: scale(1.14); }
        }
      `}</style>

      {/* ambient glow ring */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-28 w-28 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.18 295 / 0.28), transparent 70%)",
            animation: "mg-glow-pulse 2.6s ease-in-out infinite",
          }}
        />
        <div style={{ animation: "mg-phone-tilt 2.8s ease-in-out infinite" }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
            <rect
              x="14" y="7" width="28" height="42" rx="5.5"
              stroke="oklch(0.72 0.18 295)"
              strokeWidth="2.5"
              fill="oklch(0.72 0.18 295 / 0.07)"
            />
            <circle cx="28" cy="42.5" r="2.8" fill="oklch(0.72 0.18 295 / 0.5)" />
            <rect x="21" y="10.5" width="14" height="2" rx="1" fill="oklch(0.72 0.18 295 / 0.3)" />
          </svg>
        </div>
      </div>

      {/* text */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p
          className="text-[16px] font-semibold tracking-tight"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Rotate your device
        </p>
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>
          Landscape mode is required
        </p>
      </div>

      {/* ← landscape → arrows */}
      <div
        className="flex items-center gap-3"
        style={{ color: "oklch(0.72 0.18 295 / 0.4)" }}
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 12H5M9 6l-6 6 6 6" />
        </svg>
        <span
          className="text-[10px] uppercase tracking-[0.24em]"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          landscape
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M15 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}

// ── MobileGate ──────────────────────────────────────────────────────────────
export function MobileGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ViewportState>("desktop");

  useEffect(() => {
    // Non-touch (desktop/laptop) → pass through, nothing to do
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch) {
      setState("desktop");
      return;
    }

    // Capture physical dimensions BEFORE any viewport change.
    // After applyLandscapeViewport(), window.innerWidth/Height change → DO NOT
    // re-read them for detection (that would trigger a false "desktop" state).
    const physW = window.innerWidth;
    const physH = window.innerHeight;

    // Tablets: max dimension ≥ 1024px → show desktop layout untouched
    if (Math.max(physW, physH) >= 1024) {
      setState("desktop");
      return;
    }

    // Phone — set initial state
    applyPhone(physW, physH, setState);

    // On orientation change: reset viewport first (restores real CSS pixel dimensions),
    // then wait 200ms for the browser to finish the rotation, then re-detect.
    // We do NOT listen to "resize" here: changing the viewport meta itself fires resize,
    // which would create a feedback loop (scaled width ≥ 1024 → reset → real width → scale → ...).
    const onOrientationChange = () => {
      resetViewport();
      setTimeout(() => {
        applyPhone(window.innerWidth, window.innerHeight, setState);
      }, 200);
    };

    window.addEventListener("orientationchange", onOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", onOrientationChange);
      resetViewport();
    };
  }, []);

  if (state === "portrait") return <PortraitOverlay />;
  return <>{children}</>;
}
