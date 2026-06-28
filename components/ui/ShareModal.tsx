"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { captureElement, captureDesktopElement } from "@/lib/captureElement";

type Scope = "card" | "slide";
type ShareNav = Navigator & { canShare?: (d?: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };

const ANIM_CSS = `
@keyframes sm-glow{0%,100%{box-shadow:0 0 0 1px rgba(139,92,246,.18),0 48px 80px -20px rgba(0,0,0,.95),0 0 48px rgba(139,92,246,.07)}50%{box-shadow:0 0 0 1px rgba(139,92,246,.36),0 48px 80px -20px rgba(0,0,0,.95),0 0 80px rgba(139,92,246,.18)}}
@keyframes sm-scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
@keyframes sm-dot{0%,100%{opacity:.18;transform:scale(.8)}50%{opacity:.85;transform:scale(1)}}
`;

const SP = [0.32, 0.72, 0, 1] as const;

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
  { id: "copy",     label: "Copy",      accent: "#ffffff", icon: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" },
  { id: "x",        label: "Post on X", accent: "#60a5fa", icon: "M4 4l16 16M20 4L4 20" },
  { id: "linkedin", label: "LinkedIn",  accent: "#0a66c2", icon: "M4 4h16v16H4zM8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4" },
] as const;

// Funny render-flavoured copy, in the same spirit as the landing-page loader.
const RENDER_MESSAGES = [
  "Polishing your pixels...",
  "Framing your masterpiece...",
  "Bribing the GPU...",
  "Summoning the screenshot gods...",
  "Aligning every star...",
  "Making it look expensive...",
  "Adding a tasteful glow...",
  "Convincing the card to pose...",
  "Rendering at maximum smug...",
  "Touching up your planet...",
  "Negotiating with the pixels...",
  "Applying main-character lighting...",
] as const;

function ScanLoader() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * RENDER_MESSAGES.length));
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % RENDER_MESSAGES.length), 1600);
    return () => clearInterval(id);
  }, []);
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
      <div className="h-4 overflow-hidden px-6 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={idx}
            className="block"
            style={{ fontSize:11, fontWeight:500, color:"rgba(196,181,253,.72)" }}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.26, ease: SP }}
          >
            {RENDER_MESSAGES[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
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
  const blobRef = useRef<Blob | null>(null);

  // inject CSS once
  useEffect(() => {
    const id = "__share-modal-css";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id; s.textContent = ANIM_CSS;
    document.head.appendChild(s);
  }, []);

  // clear preview after modal exit animation completes
  useEffect(() => {
    if (!open) {
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
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (scope === "card") {
      // Mobile: render the slide at desktop width in an off-screen iframe so the
      // lg: layout fires, then crop to the card. Produces a card identical to the
      // desktop slides (proper spacing/fonts) instead of the cramped mobile card.
      if (isMobile)
        return await captureDesktopElement(slide, { cropToSelector: "[data-share-card]", scale });
      const card = document.querySelector("[data-share-card]") as HTMLElement | null;
      if (!card) return null;
      const accent    = (card as HTMLElement & { dataset: DOMStringMap }).dataset.accent ?? "#a78bfa";
      const wrapperBg = `radial-gradient(ellipse at 50% -20%, ${accent}50 0%, ${accent}12 40%, #080612 70%)`;
      return await captureElement(card, { scale, wrapperBg, wrapperPad: 72 });
    }
    // Full slide — desktop only (toggle hidden on mobile)
    return await captureElement(slide, { scale });
  }, [scope, slideRef]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    blobRef.current = null;
    const t = setTimeout(async () => {
      if (!alive) return;
      setBusy(true);
      setPreview(null); // show ScanLoader while re-rendering
      setFailed(false);
      const prev = await capture(1.5);
      if (!alive) return;
      const hiPromise = capture(2.5);
      if (prev) {
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej;
          r.readAsDataURL(prev);
        });
        if (!alive) return;
        setPreview(dataUrl);
      } else {
        setPreview(null);
      }
      setFailed(!prev);
      setBusy(false);
      const hi = await hiPromise;
      if (!alive) return;
      blobRef.current = hi;
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
  const onCopy = async () => {
    const blob = await getBlob(); if (!blob) return;
    try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); flash("Copied."); }
    catch { dl(blob); flash("Saved instead."); }
  };
  const onX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(captionText)}`, "_blank", "noopener");
  };
  const onLinkedIn = () => {
    // LinkedIn dropped prefilled-text sharing; share-offsite reliably opens the
    // composer with the grindit.dev link preview (the feed/?shareActive route
    // silently fails to create a post on mobile).
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://www.grindit.dev")}`, "_blank", "noopener");
  };
  const handlers: Record<string, () => void> = { download: onDownload, copy: onCopy, x: onX, linkedin: onLinkedIn };

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

            {/* ── scope toggle — desktop only; mobile keeps card always ── */}
            <div className="mt-4 px-4 hidden lg:block">
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

            {/* native share */}
            {canNativeShare && (
              <div className="mt-3 px-4">
                <motion.button onClick={onNative} disabled={busy}
                  className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full py-2.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
                  style={{ background:"linear-gradient(130deg,#5b21b6,#7c3aed,#6d28d9)" }}
                  whileHover={{ scale:1.01 }} whileTap={{ scale:0.975 }}
                  transition={{ type:"spring", stiffness:400, damping:26 }}>
                  <Icon d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" />
                  Share…
                </motion.button>
              </div>
            )}

            {/* ── action grid ── */}
            <div className="grid grid-cols-2 gap-2 p-4 pt-3">
              {ACTIONS.map(({ id, label, icon, accent }, i) => (
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
