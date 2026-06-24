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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-10 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, oklch(0.22 0.12 295) 0%, #080612 65%)",
      }}
    >
      <style>{`
        @keyframes mg-phone-tilt {
          0%, 25%  { transform: rotate(0deg); }
          55%, 75% { transform: rotate(-90deg); }
          100%     { transform: rotate(0deg); }
        }
        @keyframes mg-glow-pulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(1.18); }
        }
        @keyframes mg-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes mg-star {
          0%, 100% { opacity: 0.1; }
          50%      { opacity: 0.7; }
        }
      `}</style>

      {/* background stars */}
      {[
        { top: "12%", left: "18%", s: 2, d: "0s" },
        { top: "8%",  left: "72%", s: 1.5, d: "0.8s" },
        { top: "22%", left: "88%", s: 2.5, d: "1.4s" },
        { top: "75%", left: "10%", s: 1.5, d: "0.4s" },
        { top: "80%", left: "82%", s: 2, d: "1.1s" },
        { top: "65%", left: "55%", s: 1, d: "1.8s" },
        { top: "40%", left: "6%",  s: 1.5, d: "0.6s" },
        { top: "30%", left: "93%", s: 1, d: "2s" },
      ].map((st, i) => (
        <div key={i} className="pointer-events-none absolute rounded-full bg-white"
          style={{ top: st.top, left: st.left, width: st.s, height: st.s,
            animation: `mg-star ${2 + i * 0.4}s ease-in-out ${st.d} infinite` }} />
      ))}

      {/* outer glow blob */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.18 295 / 0.14), transparent 70%)",
          animation: "mg-glow-pulse 3s ease-in-out infinite",
        }} />

      {/* phone icon */}
      <div style={{ animation: "mg-float 3.2s ease-in-out infinite" }}>
        <div className="relative flex items-center justify-center">
          {/* ring */}
          <div className="absolute h-32 w-32 rounded-full border"
            style={{
              borderColor: "oklch(0.72 0.18 295 / 0.18)",
              boxShadow: "0 0 32px oklch(0.72 0.18 295 / 0.12), inset 0 0 32px oklch(0.72 0.18 295 / 0.06)",
            }} />
          <div className="absolute h-24 w-24 rounded-full border"
            style={{ borderColor: "oklch(0.72 0.18 295 / 0.10)" }} />
          <div style={{ animation: "mg-phone-tilt 3s ease-in-out infinite" }}>
            <svg width="64" height="64" viewBox="0 0 56 56" fill="none" aria-hidden>
              <rect x="14" y="7" width="28" height="42" rx="6"
                stroke="oklch(0.72 0.18 295)"
                strokeWidth="2"
                fill="oklch(0.72 0.18 295 / 0.08)" />
              <rect x="14" y="7" width="28" height="42" rx="6"
                fill="none"
                stroke="oklch(0.85 0.10 295 / 0.15)"
                strokeWidth="0.5" />
              <circle cx="28" cy="42.5" r="3" fill="oklch(0.72 0.18 295 / 0.55)" />
              <rect x="21" y="11" width="14" height="1.8" rx="0.9" fill="oklch(0.72 0.18 295 / 0.35)" />
              {/* screen glow */}
              <rect x="17" y="15" width="22" height="23" rx="2" fill="oklch(0.72 0.18 295 / 0.06)" />
            </svg>
          </div>
        </div>
      </div>

      {/* text block */}
      <div className="flex flex-col items-center gap-2 text-center px-8">
        <p className="text-[18px] font-bold tracking-tight"
          style={{ color: "rgba(255,255,255,0.92)" }}>
          Rotate your device
        </p>
        <p className="text-[12px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.36)" }}>
          GrindIT works in landscape mode
        </p>
      </div>

      {/* landscape hint pill */}
      <div className="flex items-center gap-3 rounded-full border px-5 py-2"
        style={{
          borderColor: "oklch(0.72 0.18 295 / 0.22)",
          background: "oklch(0.72 0.18 295 / 0.07)",
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="oklch(0.72 0.18 295)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M9 6l-6 6 6 6" />
        </svg>
        <span className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "oklch(0.72 0.18 295 / 0.7)" }}>
          landscape
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="oklch(0.72 0.18 295)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
