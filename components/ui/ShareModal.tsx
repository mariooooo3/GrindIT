"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { captureElement, prewarmCapture } from "@/lib/captureElement";

type Scope = "card" | "slide";
type ShareNav = Navigator & { canShare?: (d?: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };

const ANIM_CSS = `
@keyframes sm-glow{0%,100%{box-shadow:0 0 0 1px rgba(139,92,246,.18),0 48px 80px -20px rgba(0,0,0,.95),0 0 48px rgba(139,92,246,.07)}50%{box-shadow:0 0 0 1px rgba(139,92,246,.36),0 48px 80px -20px rgba(0,0,0,.95),0 0 80px rgba(139,92,246,.18)}}
@keyframes sm-scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
@keyframes sm-dot{0%,100%{opacity:.18;transform:scale(.8)}50%{opacity:.85;transform:scale(1)}}
`;

const SP = [0.32, 0.72, 0, 1] as const;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function Icon({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
         stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ACTIONS = [
  { id: "download", label: "Save",      accent: "#a78bfa", icon: "M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2M7 10l5 5 5-5M12 15V3" },
  { id: "x",        label: "Post on X", accent: "#60a5fa", icon: "M4 4l16 16M20 4L4 20" },
  { id: "linkedin", label: "LinkedIn",  accent: "#0a66c2", icon: "M4 4h16v16H4zM8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4" },
] as const;

// Native-share action, shown first in the action grid (mobile and desktop).
const SHARE_ACTION = { id: "share", label: "Share", accent: "#a78bfa", icon: "M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" } as const;

// Funny git/GitHub-flavoured copy, in the same spirit as the landing-page loader.
const RENDER_MESSAGES = [
  "git commit -m 'looks expensive'...",
  "Force-pushing your pixels...",
  "Squashing commits into one flex...",
  "Resolving merge conflicts with your ego...",
  "Cherry-picking the best pixels...",
  "Staging your whole personality...",
  "Rebasing onto main-character energy...",
  "Bribing the CI to stay green...",
  "git blame: still your fault, but prettier...",
  "Fetching origin/clout...",
  "Stashing your humility...",
  "Pushing to origin/legend...",
] as const;

function ScanLoader() {
  // One random message per render — ScanLoader remounts each time a capture starts,
  // so a fresh line is picked without rotating mid-render.
  const [msg] = useState(() => RENDER_MESSAGES[Math.floor(Math.random() * RENDER_MESSAGES.length)]);
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden"
         style={{ background: "rgba(3,1,14,.9)" }}>
      <div className="absolute inset-y-0 w-1/4 pointer-events-none"
           style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,.1),transparent)",
                    animation: "sm-scan 2.2s cubic-bezier(.4,0,.6,1) infinite" }} />
      <div className="flex items-center gap-1.5">
        {[0,1,2,3].map((i) => (
          <div key={i} className="h-[5px] w-[5px] rounded-full"
               style={{ background: "#7c3aed", animation: `sm-dot 1.5s ease-in-out ${i*0.18}s infinite` }} />
        ))}
      </div>
      <motion.span
        className="block px-6 text-center"
        style={{ fontSize:11, fontWeight:500, color:"rgba(196,181,253,.72)" }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: SP }}
      >
        {msg}
      </motion.span>
    </div>
  );
}


export default function ShareModal({
  open, onClose, slideRef, username, slideTitle, worldCup = false,
}: {
  open: boolean; onClose: () => void; slideRef: RefObject<HTMLDivElement | null>;
  username: string; slideTitle: string; worldCup?: boolean;
}) {
  const [scope,      setScope]      = useState<Scope>("card");
  const [busy,       setBusy]       = useState(false);
  const [preview,    setPreview]    = useState<string | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);
  const [failed,     setFailed]     = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [captureKey, setCaptureKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  // Holds the in-flight hi-res capture so a button pressed before it resolves can
  // await the same render instead of kicking off a second (slow) one.
  const hiPromiseRef = useRef<Promise<Blob | null> | null>(null);

  // Track viewport so the action grid and share handlers can branch on mobile.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // inject CSS once
  useEffect(() => {
    const id = "__share-modal-css";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id; s.textContent = ANIM_CSS;
    document.head.appendChild(s);
  }, []);

  // Reset to card mode on every open; clear preview after modal exit animation completes
  useEffect(() => {
    if (open) {
      setScope("card");
    } else {
      const t = setTimeout(() => { setPreview(null); setFailed(false); setBusy(false); }, 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  const canNativeShare = typeof navigator !== "undefined" && typeof (navigator as ShareNav).canShare === "function";
  // Full caption (with URL) — used when opening browser compose (no image attached)
  const captionText = worldCup
    ? `@${username} at the World Cup ⚽🐾\n\nMake yours:\nhttps://www.grindit.dev\n\n#WorldCup #GrindIT`
    : `My GitHub Wrapped — @${username} · ${slideTitle} 🚀🐱\n\nMake yours:\nhttps://www.grindit.dev\n\n#GrindIT`;
  // Caption without URL — used when image file is attached via native share (URL blocks image attachment on X/LinkedIn)
  const captionNative = worldCup
    ? `@${username} at the World Cup ⚽🐾\n\n#WorldCup #GrindIT`
    : `My GitHub Wrapped — @${username} · ${slideTitle} 🚀🐱\n\n#GrindIT`;
  const filename = `github-wrapped-${username}-${scope}.png`;

  const capture = useCallback(async (scale = 2.5): Promise<Blob | null> => {
    const slide = slideRef.current;
    if (!slide) return null;
    if (scope === "card") {
      // Both themes use the same fast clone-into-wrapper path: only the card element
      // is processed (no stadium scenes, no space background nodes) — dramatically
      // faster than capturing the full slide and cropping.
      // WC: find the card in the WC layer (the space-theme card is opacity-0 there).
      // Space: any [data-share-card] works since there is only one visible.
      const cardSelector = worldCup
        ? ".wc-original-card-layer [data-share-card]"
        : "[data-share-card]";
      const card = document.querySelector(cardSelector) as HTMLElement | null;
      if (!card) return null;
      const accent = card.dataset.accent ?? (worldCup ? "#facc15" : "#a78bfa");
      const wrapperBg = worldCup
        ? `radial-gradient(ellipse at 50% -20%, #facc1550 0%, #facc1514 40%, #080612 70%)`
        : `radial-gradient(ellipse at 50% -20%, ${accent}50 0%, ${accent}12 40%, #080612 70%)`;
      const mobileCard = window.innerWidth < 1024;
      return await captureElement(card, {
        scale,
        wrapperBg,
        wrapperPad: 72,
        // On small phones the card is constrained by vw (e.g. w-[min(300px,84vw)]).
        // Force a minimum of 300px so the browser reflows content at the intended
        // design width instead of the squeezed viewport width. Desktop unaffected.
        ...(mobileCard ? { minCaptureWidth: 300 } : {}),
      });
    }
    // Full slide — same clone-into-wrapper approach as card mode, just bigger:
    // capture only the VISIBLE layer div (not the full slide container with both
    // layers). No live-DOM mutation, no restore, no skipLayer/skipSet complexity.
    //
    // For WC mode: wc-pawcup-scene has ~500 nodes hidden on mobile by globals.css
    // display:none — remove them from the clone so they're never serialized.
    // The bonus slide re-enables wc-pawcup-scene (display:block), so we check first.
    const mobile = window.innerWidth < 1024;

    // Both themes use the visible layer div. For WC: always strip wc-pawcup-scene
    // from the clone — on mobile it's display:none, on desktop it's visible but has
    // 500+ decorative nodes we don't need in the share image.
    const layerSel = worldCup ? "[data-share-layer='worldcup']" : "[data-share-layer='space']";
    const layer = slide.querySelector<HTMLElement>(layerSel) ?? slide;
    const removeFromClone: string[] = [];

    if (worldCup) {
      // On mobile, wc-pawcup-scene is display:none (globals.css). Remove from clone
      // to skip serializing 500+ hidden nodes.
      // On desktop, keep it — it provides the side decorations (astronaut, constellation,
      // moon, chapter heading) and the background for the share image.
      if (mobile && layer.querySelector(".wc-pawcup-scene")) {
        removeFromClone.push(".wc-pawcup-scene");
      }
    }

    return await captureElement(layer, {
      scale: 2,
      wrapperBg: "#080612",
      wrapperPad: 0,
      noCardDeco: true,
      addLogoTopLeft: true,
      addSlideWatermark: !mobile,
      ...(removeFromClone.length ? { removeFromClone } : {}),
    });
  }, [scope, slideRef, worldCup]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    blobRef.current = null;
    hiPromiseRef.current = null;
    // Pre-import modern-screenshot and pre-fetch the watermark logo in parallel
    // so neither hits the network during the actual capture.
    prewarmCapture().catch(() => {});
    const t = setTimeout(async () => {
      if (!alive) return;
      setBusy(true);
      setPreview(null); // show ScanLoader while rendering
      setFailed(false);
      // Single full-quality render reused for both the preview and the export blob.
      // (Previously we rendered twice — at 1.5 then 2.5 — which doubled the costly
      // off-screen iframe work on mobile.)
      const p = capture(2.5);
      hiPromiseRef.current = p;
      const blob = await p;
      if (!alive) return;
      blobRef.current = blob;
      hiPromiseRef.current = null;
      if (blob) {
        const dataUrl = await blobToDataUrl(blob);
        if (!alive) return;
        setPreview(dataUrl);
      } else {
        setPreview(null);
      }
      setFailed(!blob);
      setBusy(false);
    }, 80);
    return () => { alive = false; clearTimeout(t); };
  }, [open, scope, capture, captureKey]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };
  const getBlob = async () => {
    if (blobRef.current) return blobRef.current;
    // Reuse the render already in flight from the preview effect rather than
    // starting a second one — this is what made the first press slow.
    if (hiPromiseRef.current) {
      const b = await hiPromiseRef.current;
      if (b) blobRef.current = b;
      return b;
    }
    setBusy(true); const b = await capture(); setBusy(false); blobRef.current = b; return b;
  };
  const dl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: filename }).click();
    URL.revokeObjectURL(url);
  };
  const onNative = async () => {
    const blob = await getBlob(); if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as ShareNav;
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try { await nav.share({ files: [file], text: captionNative, title: "GitHub Wrapped" }); } catch { /* cancelled */ }
    } else { dl(blob); flash("Downloaded instead."); }
  };
  const onDownload = async () => {
    const b = await getBlob();
    if (b) { dl(b); flash("Image saved."); }
  };
  const onX = async () => {
    // Desktop: auto-download the image first so it's ready to attach in the composer.
    // Mobile: X handles the deep link well, no download needed.
    if (!isMobile) { const b = await getBlob(); if (b) dl(b); }
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(captionText)}`, "_blank", "noopener");
  };
  const onLinkedIn = async () => {
    // Same format as X: open the composer with the prefilled caption (no image).
    // The linkedin.com universal link opens the app directly when installed, so the
    // user posts from their logged-in account instead of a fresh Chrome tab.
    // Desktop also downloads the image first so it can be attached manually.
    if (!isMobile) { const b = await getBlob(); if (b) dl(b); }
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(captionText)}`, "_blank", "noopener");
  };
  const handlers: Record<string, () => void> = { download: onDownload, x: onX, linkedin: onLinkedIn, share: onNative };

  // Share leads the grid on both modes. Mobile keeps only Share + X (LinkedIn just
  // deep-links without posting, and the web can't save to the gallery so no Save).
  // Desktop shows Share, Save, X, LinkedIn.
  const shareLead = canNativeShare ? [SHARE_ACTION] : [];
  const gridActions = isMobile
    ? [...shareLead, ...ACTIONS.filter((a) => a.id === "x")]
    : [...shareLead, ...ACTIONS];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={onClose}>

          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.82)", backdropFilter: "blur(20px)" }} />

          <div className="pointer-events-none absolute"
               style={{ width:320, height:320, borderRadius:"50%",
                        background:"radial-gradient(circle,rgba(109,40,217,.16) 0%,transparent 68%)",
                        filter:"blur(28px)" }} />

          {/* ── modal — spring-expands for Full slide ── */}
          <motion.div
            className="relative w-full max-w-[400px] overflow-hidden rounded-[24px]"
            style={{
              background: "linear-gradient(168deg,#0d0822 0%,#070419 52%,#040213 100%)",
              animation: "sm-glow 4.5s ease-in-out infinite",
            }}
            initial={{ scale: 0.88, y: 28, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1,    y: 0,  opacity: 1, filter: "blur(0px)" }}
            exit={{    scale: 0.93, y: 12, opacity: 0, filter: "blur(4px)" }}
            transition={{
              scale:   { type: "spring", stiffness: 380, damping: 30, mass: 0.85 },
              y:       { type: "spring", stiffness: 380, damping: 30, mass: 0.85 },
              opacity: { duration: 0.22, ease: "easeOut" },
              filter:  { duration: 0.2, ease: "easeOut" },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* top hairline */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
                 style={{ background:"linear-gradient(90deg,transparent 8%,rgba(255,255,255,.14) 38%,rgba(255,255,255,.07) 62%,transparent 92%)" }} />

            {/* close */}
            <motion.button onClick={onClose} aria-label="Close"
              className="absolute right-3.5 top-3.5 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full"
              style={{ background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.22)", color:"rgba(255,255,255,.65)" }}
              whileHover={{ scale: 1.12, background:"rgba(255,255,255,.18)", color:"rgba(255,255,255,.9)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 440, damping: 24 }}>
              <Icon d="M6 6l12 12M18 6L6 18" size={11} />
            </motion.button>

            {/* ── HERO: double-bezel preview ── */}
            <div className="px-4 pt-4">
              {/* outer bezel */}
              <div style={{ padding:"1.5px", borderRadius:"20px",
                            background:"linear-gradient(148deg,rgba(139,92,246,.32) 0%,rgba(255,255,255,.04) 42%,rgba(99,60,180,.18) 100%)" }}>
                {/* inner core */}
                <div className="relative flex h-[272px] items-center justify-center overflow-hidden"
                     style={{ borderRadius:"18.5px", background:"rgba(3,1,14,.88)",
                              boxShadow:"inset 0 1px 0 rgba(255,255,255,.06)" }}>

                  {/* preview image — crossfade on key change */}
                  <AnimatePresence mode="sync">
                    {preview && (
                      <motion.img
                        key={preview}
                        src={preview}
                        alt="Share preview"
                        className="h-full w-full object-contain"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        transition={{ duration: 0.38, ease: SP } as any}
                      />
                    )}
                  </AnimatePresence>

                  {/* initial scan loader (first load, no preview yet) */}
                  <AnimatePresence>
                    {!preview && !failed && (
                      <motion.div key="scan" className="absolute inset-0"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <ScanLoader />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* failed state */}
                  <AnimatePresence>
                    {failed && (
                      <motion.div key="fail" className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,.2)", letterSpacing:".06em" }}>
                          Couldn&apos;t render this slide.
                        </span>
                        <button
                          onClick={() => setCaptureKey(k => k + 1)}
                          style={{ fontSize:10, color:"rgba(139,92,246,.7)", letterSpacing:".06em", background:"none", cursor:"pointer", padding:"2px 8px", borderRadius:4, border:"1px solid rgba(139,92,246,.25)" }}>
                          Retry
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </div>

            {/* ── scope toggle — card / full slide, on desktop and mobile, both themes ── */}
            <div className="mt-4 px-4">
              <div className="relative flex items-center rounded-full py-[3px]"
                   style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>
                {/* sliding pill — pure CSS transform, no layout recalc */}
                <div className="pointer-events-none absolute inset-y-[3px] rounded-full"
                     style={{
                       width: "calc(50% - 3px)",
                       background: "rgba(124,58,237,.2)",
                       boxShadow: "0 0 0 1px rgba(167,139,250,.3)",
                       transform: scope === "card" ? "translateX(3px)" : "translateX(calc(100% + 3px))",
                       transition: "transform 0.22s cubic-bezier(0.32,0.72,0,1)",
                     }} />
                {(["card","slide"] as Scope[]).map((val) => (
                  <motion.button key={val} onClick={() => setScope(val)}
                    className="relative z-10 flex-1 cursor-pointer py-[7px] text-center"
                    style={{ fontSize:11, fontWeight:500,
                             color: scope === val ? "#c4b5fd" : "rgba(255,255,255,.28)",
                             transition: "color 0.18s ease" }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 440, damping: 28 }}>
                    {val === "card" ? "Card" : "Full slide"}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── action grid ── */}
            {/* Share leads (handles saving to Photos via the OS sheet). Mobile shows
                Share + X only; desktop shows Share, Save, X, LinkedIn. */}
            <div className="grid grid-cols-2 gap-2 p-4 pt-3">
              {gridActions.map(({ id, label, icon, accent }, i) => (
                <motion.button key={id} onClick={handlers[id]} disabled={busy}
                  className="group flex flex-col cursor-pointer items-center gap-[9px] rounded-[13px] py-3.5 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-25"
                  style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" }}
                  initial={{ opacity:0, y:14, scale: 0.95 }}
                  animate={{ opacity:1, y:0,  scale: 1 }}
                  transition={{ delay: 0.08 + i*0.04, type: "spring", stiffness: 360, damping: 28 }}
                  whileHover={{ y:-3, scale: 1.03, background: "rgba(255,255,255,.07)", borderColor: `${accent}66` }}
                  whileTap={{ scale: 0.93 }}>
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
                       style={{ background:`${accent}1f`, color:accent, boxShadow:`0 0 12px ${accent}33` }}>
                    <Icon d={icon} size={13} />
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,.82)" }}>{label}</span>
                </motion.button>
              ))}
            </div>

            {/* bottom hairline */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                 style={{ background:"linear-gradient(90deg,transparent,rgba(124,58,237,.2),transparent)" }} />

            {/* toast */}
            <AnimatePresence>
              {toast && (
                <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="pointer-events-none absolute inset-x-0 bottom-3.5 mx-auto w-fit rounded-full"
                  style={{ padding:"6px 14px", background:"rgba(0,0,0,.92)", backdropFilter:"blur(12px)",
                           border:"1px solid rgba(255,255,255,.09)", fontSize:10, fontWeight:500,
                           color:"rgba(255,255,255,.55)", letterSpacing:".02em" }}>
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
