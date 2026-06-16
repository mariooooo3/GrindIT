"use client";

import { useState, useEffect, useCallback, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { captureElement, captureDesktopElement } from "@/lib/captureElement";

type Scope = "card" | "slide";

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};

function Icon({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function ShareModal({
  open,
  onClose,
  slideRef,
  username,
  slideTitle,
}: {
  open: boolean;
  onClose: () => void;
  slideRef: RefObject<HTMLDivElement | null>;
  username: string;
  slideTitle: string;
}) {
  const [scope, setScope] = useState<Scope>("card");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount guard for the portal
  useEffect(() => { setMounted(true); }, []);

  const canNativeShare = typeof navigator !== "undefined" && typeof (navigator as ShareNavigator).canShare === "function";
  const caption = `My GitHub Wrapped — @${username} · ${slideTitle} 🚀🐱 #GitHubWrapped`;
  const filename = `github-wrapped-${username}-${scope}.png`;

  const capture = useCallback(async (): Promise<Blob | null> => {
    const slide = slideRef.current;
    if (!slide) return null;
    // On viewports below the desktop breakpoint, render the slide in an off-screen
    // desktop-width iframe so the share image matches the desktop layout.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return await captureDesktopElement(slide, { cropToSelector: scope === "card" ? "[data-share-card]" : null });
    }
    if (scope === "card") {
      // Render the (pixel-accurate) full slide and crop to the card, so the card
      // image is identical to what's on screen.
      const card = document.querySelector("[data-share-card]") as HTMLElement | null;
      if (!card) return null;
      return await captureElement(slide, { cropTo: card });
    }
    return await captureElement(slide, {});
  }, [scope, slideRef]);

  // (Re)generate the preview whenever the modal opens or the scope changes.
  // All state updates happen inside the async callback (not the effect body).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    blobRef.current = null;
    const t = setTimeout(async () => {
      if (!alive) return;
      setBusy(true);
      setPreview(null);
      setFailed(false);
      const blob = await capture();
      if (!alive) return;
      blobRef.current = blob;
      setPreview(blob ? URL.createObjectURL(blob) : null);
      setFailed(!blob);
      setBusy(false);
    }, 80);
    return () => { alive = false; clearTimeout(t); };
  }, [open, scope, capture]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const getBlob = async (): Promise<Blob | null> => {
    if (blobRef.current) return blobRef.current;
    setBusy(true);
    const b = await capture();
    setBusy(false);
    blobRef.current = b;
    return b;
  };

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const onNative = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as ShareNavigator;
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try { await nav.share({ files: [file], text: caption, title: "GitHub Wrapped" }); } catch { /* user cancelled */ }
    } else {
      download(blob);
      flash("Native share unavailable — image downloaded instead.");
    }
  };

  const onDownload = async () => { const b = await getBlob(); if (b) { download(b); flash("Image downloaded."); } };

  const onCopy = async () => {
    const blob = await getBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Image copied to clipboard.");
    } catch {
      download(blob);
      flash("Copy unsupported — image downloaded instead.");
    }
  };

  const onX = async () => {
    const b = await getBlob(); if (b) download(b);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`, "_blank", "noopener");
    flash("Image downloaded — attach it in the post.");
  };

  const onLinkedIn = async () => {
    const b = await getBlob(); if (b) download(b);
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(caption)}`, "_blank", "noopener");
    flash("Image downloaded — attach it in the post.");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0a1a] p-5 text-white shadow-2xl"
            initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Share this slide</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
                <Icon d="M6 6l12 12M18 6L6 18" />
              </button>
            </div>

            {/* scope toggle */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {([["card", "Card"], ["slide", "Full slide"]] as [Scope, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setScope(val)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${scope === val ? "bg-violet-500/30 text-violet-100 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.5)]" : "text-white/55 hover:text-white/80"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* preview */}
            <div className="mt-4 flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Share preview" className="max-h-[300px] w-auto object-contain" />
              ) : failed ? (
                <span className="py-10 text-[11px] text-white/40">Couldn&apos;t render this slide.</span>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-white/50">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
                  <span className="text-[11px]">Rendering image…</span>
                </div>
              )}
            </div>

            {/* actions */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {canNativeShare && (
                <button onClick={onNative} disabled={busy}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                  style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }}>
                  <Icon d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /> Share…
                </button>
              )}
              <button onClick={onDownload} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50">
                <Icon d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2M7 10l5 5 5-5M12 15V3" /> Download
              </button>
              <button onClick={onCopy} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50">
                <Icon d="M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /> Copy
              </button>
              <button onClick={onX} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50">
                <Icon d="M4 4l16 16M20 4L4 20" /> X
              </button>
              <button onClick={onLinkedIn} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50">
                <Icon d="M4 4h16v16H4zM8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4" /> LinkedIn
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
              X / LinkedIn don&apos;t accept direct image uploads from the web — we download the PNG and open the composer so you can attach it.
            </p>

            <AnimatePresence>
              {toast && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-black/80 px-3 py-1.5 text-[11px] text-white/80">
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
