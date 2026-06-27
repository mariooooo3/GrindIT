"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Glyph, type GlyphName } from "@/components/wrapped/TrophyIcons";

// Minimal shape a badge needs to be explained. Matches the relevant fields of
// TraitBadge (lib/badges.ts) so any trait badge can be passed straight in.
export type PopoverBadge = {
  id: string;
  label: string;
  icon: string;
  color: string;
  explanation: string;
};

const POPOVER_W = 264;

/**
 * Lightweight, accessible badge info popover. Rendered through a portal on
 * document.body — deliberately OUTSIDE the slide card — so it can never be
 * captured by the share-image renderer (which clones [data-share-card] / the
 * slide root). `data-share-ignore` is added as belt-and-suspenders for the
 * modern-screenshot node filter.
 *
 * Visual model mirrors SlideArchetype's inline reveal panel (icon · label ·
 * explanation, tinted by the badge colour) for a consistent experience.
 *
 * Closes on: Escape, click/tap outside, the × button, or scroll/resize (which
 * would otherwise leave it anchored to a stale position).
 */
export function BadgePopover({
  badge,
  anchor,
  onClose,
}: {
  badge: PopoverBadge | null;
  anchor: DOMRect | null;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const open = !!(badge && anchor);

  // Measure the rendered popover, then anchor it over the badge (clamped to the
  // viewport, flipped above the badge when there isn't room below).
  useLayoutEffect(() => {
    if (!open || !anchor) { setPos(null); return; }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = cardRef.current?.offsetHeight ?? 150;
    const centerX = anchor.left + anchor.width / 2;
    const left = Math.max(8, Math.min(centerX - POPOVER_W / 2, vw - POPOVER_W - 8));
    const spaceBelow = vh - anchor.bottom;
    const top = spaceBelow > h + 12 || spaceBelow > anchor.top
      ? anchor.bottom + 8
      : Math.max(8, anchor.top - h - 8);
    setPos({ left, top });
  }, [open, anchor, badge]);

  // Focus the close button on open; restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Escape / scroll / resize all dismiss. Scroll uses capture so it catches the
  // card's inner scroll container too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const dismiss = () => onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && badge && (
        <div data-share-ignore className="fixed inset-0 z-[80]">
          {/* click/tap-outside catcher */}
          <div className="absolute inset-0" onPointerDown={onClose} aria-hidden />

          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${badge.label} badge details`}
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: pos ? 1 : 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 2 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            className="absolute rounded-2xl p-3.5"
            style={{
              width: POPOVER_W,
              left: pos?.left ?? -9999,
              top: pos?.top ?? 0,
              background: "linear-gradient(160deg, rgba(10,6,26,0.98), rgba(6,4,18,0.98))",
              border: `1px solid ${badge.color}55`,
              boxShadow: `0 18px 50px -12px rgba(0,0,0,0.8), 0 0 24px ${badge.color}33`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-white/45 transition-colors hover:text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex items-center gap-3 pr-6">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{
                  color: badge.color,
                  background: `${badge.color}1c`,
                  border: `1px solid ${badge.color}40`,
                  filter: `drop-shadow(0 0 6px ${badge.color}88)`,
                }}
              >
                <Glyph name={badge.icon as GlyphName} size={26} />
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold leading-tight" style={{ color: badge.color }}>
                  {badge.label}
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[12px] leading-snug text-white/70">{badge.explanation}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
