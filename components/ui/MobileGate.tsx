"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Reference desktop height for scale calculation.
// scale = physicalHeight / DESKTOP_H → 100dvh ≈ DESKTOP_H after browser scales content.
const DESKTOP_H = 810;

type ViewportState = "desktop" | "landscape" | "portrait";

function applyLandscapeViewport(w: number, h: number) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) return;
  const scale = h / DESKTOP_H;
  const cssWidth = Math.round(w / scale);
  meta.content = `width=${cssWidth}, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=no, viewport-fit=cover`;
}

function resetViewport() {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (meta) meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
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
  // Store the physical dimensions used for scaling so we can re-apply on any navigation.
  const dims = useRef<{ w: number; h: number } | null>(null);
  const ready = useRef(false);
  const pathname = usePathname();

  // ── Initial setup (runs once on mount) ──────────────────────────────────
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    ready.current = true;

    if (!isTouch) {
      setState("desktop");
      return;
    }

    // Capture physical dimensions BEFORE any viewport change.
    // After applyLandscapeViewport(), innerWidth/Height change — don't re-read for detection.
    const physW = window.innerWidth;
    const physH = window.innerHeight;

    // Tablets (max dim ≥ 1024px) → show desktop layout untouched
    if (Math.max(physW, physH) >= 1024) {
      setState("desktop");
      return;
    }

    const applyPhone = (w: number, h: number) => {
      if (w > h) {
        dims.current = { w, h };
        applyLandscapeViewport(w, h);
        setState("landscape");
      } else {
        dims.current = null;
        resetViewport();
        setState("portrait");
      }
    };

    applyPhone(physW, physH);

    // orientationchange: reset viewport first to recover real CSS px dimensions,
    // then wait for browser to finish rotation before re-detecting.
    // We deliberately avoid "resize" — changing viewport meta fires resize,
    // creating a feedback loop (scaled width ≥ 1024 → reset → real width → scale → ...).
    const onOrientationChange = () => {
      resetViewport();
      setTimeout(() => applyPhone(window.innerWidth, window.innerHeight), 200);
    };

    // pageshow with e.persisted = true means the browser restored the page from
    // bfcache (back/forward navigation). In that case the viewport meta may have
    // been reset to its cached value — re-apply immediately.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && dims.current) {
        applyLandscapeViewport(dims.current.w, dims.current.h);
      }
    };

    window.addEventListener("orientationchange", onOrientationChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("orientationchange", onOrientationChange);
      window.removeEventListener("pageshow", onPageShow);
      resetViewport();
    };
  }, []);

  // ── Re-apply on every Next.js client-side navigation ────────────────────
  // Covers the case where the browser or Next.js resets the viewport meta
  // when the route changes (e.g. back button handled by the router, not bfcache).
  useEffect(() => {
    if (!ready.current) return;
    if (dims.current) {
      applyLandscapeViewport(dims.current.w, dims.current.h);
    }
  }, [pathname]);

  if (state === "portrait") return <PortraitOverlay />;
  return <>{children}</>;
}
