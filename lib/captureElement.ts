// Screenshot helper built on modern-screenshot (SVG foreignObject — supports oklch/oklab).
//
// CARD mode:  render full slide (perfect quality) → crop around card + padding →
//             apply radial vignette so edges fade to dark. No CSS manipulation.
// SLIDE mode: full screenshot, pixel-accurate.

import logoAsset from "@/components/pawcup/assets/logo3.asset.json";

// Per-session cache: external img src → Promise<data URL>.
// Storing the Promise (not the resolved string) means concurrent callers for the
// same URL all await the same in-flight fetch instead of each starting a new one.
const imgDataCache = new Map<string, Promise<string | null>>();

/**
 * Call once when the share modal opens.
 * Pre-imports modern-screenshot (eliminates dynamic-import cost on first capture)
 * and pre-fetches the watermark logo so it's in imgDataCache before capture starts.
 */
export async function prewarmCapture(): Promise<void> {
  // logoAsset is already statically imported above — use it directly.
  await import("modern-screenshot");
  toDataUrl(logoAsset.url).catch(() => {});
  // Pre-fetch any background-image URLs currently in the live DOM (e.g. stadium
  // in WC mode) so they land in imgDataCache before the first capture starts.
  const BG_RE = /url\(["']?([^"')]+)["']?\)/g;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("[style*='background-image']"))) {
    let m: RegExpExecArray | null;
    BG_RE.lastIndex = 0;
    while ((m = BG_RE.exec(el.style.backgroundImage)) !== null) {
      const url = m[1];
      if (url && !url.startsWith("data:") && !url.startsWith("/") && !url.startsWith("blob:")) {
        toDataUrl(url).catch(() => {});
      }
    }
  }
  // Pre-fetch <img crossOrigin="anonymous"> elements (e.g. flag images in WC bonus slide)
  // so they're in imgDataCache before inlineExternalImages runs during capture.
  for (const img of Array.from(document.querySelectorAll<HTMLImageElement>("img[crossorigin]"))) {
    const src = img.getAttribute("src") ?? "";
    if (src && !src.startsWith("data:") && !src.startsWith("/") && !src.startsWith("blob:")) {
      toDataUrl(src).catch(() => {});
    }
  }
}

function toDataUrl(src: string): Promise<string | null> {
  if (imgDataCache.has(src)) return imgDataCache.get(src)!;
  const p = (async () => {
    try {
      const res = await fetch(src, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  })();
  imgDataCache.set(src, p);
  return p;
}

// Replace all external <img> src AND inline background-image URLs with cached
// data URLs so modern-screenshot never fetches them during render.
// Handles both <img src="..."> and style="background-image:url(...)" (e.g. stadium).
async function inlineExternalImages(root: HTMLElement): Promise<() => void> {
  const restores: Array<() => void> = [];

  const isExternal = (url: string) =>
    !!url && !url.startsWith("data:") && !url.startsWith("/") && !url.startsWith("blob:");

  // <img> src attributes
  const imgJobs = Array.from(root.querySelectorAll<HTMLImageElement>("img")).map(async (img) => {
    const src = img.getAttribute("src") ?? "";
    if (!isExternal(src)) return;
    const dataUrl = await toDataUrl(src);
    if (!dataUrl) return;
    img.setAttribute("src", dataUrl);
    restores.push(() => img.setAttribute("src", src));
  });

  // Inline background-image: url(...) on any element (catches WorldCupSlideBackground
  // stadium image which would otherwise be fetched by modern-screenshot at render time).
  const BG_URL_RE = /url\(["']?([^"')]+)["']?\)/g;
  const bgJobs = Array.from(root.querySelectorAll<HTMLElement>("*"))
    .filter((el) => el.style.backgroundImage.includes("url("))
    .map(async (el) => {
      const orig = el.style.backgroundImage;
      const urls: string[] = [];
      let m: RegExpExecArray | null;
      BG_URL_RE.lastIndex = 0;
      while ((m = BG_URL_RE.exec(orig)) !== null) urls.push(m[1]);
      const externals = urls.filter(isExternal);
      if (!externals.length) return;
      let replaced = orig;
      await Promise.all(externals.map(async (url) => {
        const dataUrl = await toDataUrl(url);
        if (dataUrl) replaced = replaced.replace(url, dataUrl);
      }));
      if (replaced !== orig) {
        el.style.backgroundImage = replaced;
        restores.push(() => { el.style.backgroundImage = orig; });
      }
    });

  await Promise.all([...imgJobs, ...bgJobs]);
  return () => restores.forEach((fn) => fn());
}

/**
 * Crop a region around the card from the full-slide canvas and apply a dark
 * radial vignette that fades the outer slide context to near-black.
 * The card itself is untouched — pixels come directly from the full-slide render.
 */
function cropWithVignette(
  canvas: HTMLCanvasElement,
  cardX: number, cardY: number, cardW: number, cardH: number,
  scale: number,
): HTMLCanvasElement {
  const PAD = Math.round(60 * scale);
  const x0 = Math.max(0, cardX - PAD);
  const y0 = Math.max(0, cardY - PAD);
  const x1 = Math.min(canvas.width,  cardX + cardW + PAD);
  const y1 = Math.min(canvas.height, cardY + cardH + PAD);
  const W = x1 - x0, H = y1 - y0;

  const out = document.createElement("canvas");
  out.width = W; out.height = H;
  const ctx = out.getContext("2d");
  if (!ctx) return canvas;

  // Draw the cropped region exactly as rendered
  ctx.drawImage(canvas, x0, y0, W, H, 0, 0, W, H);

  // Radial vignette: transparent over the card, fades to near-black at edges
  const cx = cardX + cardW / 2 - x0;
  const cy = cardY + cardH / 2 - y0;
  const inner = Math.max(cardW, cardH) * 0.48;
  const outer = Math.hypot(W, H) * 0.68;
  const vig = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  vig.addColorStop(0,   "rgba(0,0,0,0)");
  vig.addColorStop(0.4, "rgba(0,0,0,0.20)");
  vig.addColorStop(1,   "rgba(0,0,0,0.90)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  return out;
}

// ── text-fix helpers ──────────────────────────────────────────────────────────

/**
 * Resolve CSS lineHeight to a pixel value.
 * Tailwind utility classes (leading-tight = line-height:1.25) produce a unitless
 * computed value in getComputedStyle. We detect this and multiply by fontSize.
 */
function resolveLineHeightPx(cs: CSSStyleDeclaration): number {
  const raw = cs.lineHeight;
  const fontSize = parseFloat(cs.fontSize) || 16;
  const parsed = parseFloat(raw);
  return (parsed > 0 && parsed < 10) ? parsed * fontSize : (parsed || fontSize * 1.2);
}

/**
 * Apply fixes to a single element before foreignObject capture:
 *  - Remove backdrop-filter (not supported in foreignObject)
 *  - Lock flex/grid containers to their live width
 *  - Force short multi-word text (2–5 words) to a single line via
 *      width:max-content + white-space:nowrap +   substitution.
 *    This handles badge labels that sit inside flex-col/items-center parents
 *    and therefore receive min-content width (already 2 lines in the DOM).
 *  - Apply white-space:nowrap to other provably-single-line elements.
 */
function applyNodeFixes(
  el: HTMLElement,
  cs: CSSStyleDeclaration,
  setStyle: (el: HTMLElement, props: Record<string, string>) => void,
  onTextReplace: (el: HTMLElement, orig: string) => void,
  addRestore?: (fn: () => void) => void,
) {
  // 1. Backdrop-filter
  if (cs.backdropFilter !== "none" || cs.getPropertyValue("-webkit-backdrop-filter") !== "none") {
    setStyle(el, { "backdrop-filter": "none", "-webkit-backdrop-filter": "none" });
  }

  const d = cs.display;
  const rect = el.getBoundingClientRect();
  const widthPx = rect.width > 0 ? `${rect.width}px` : null;

  // 2. Lock flex/grid containers to their live width — foreignObject can shrink them
  if (d === "flex" || d === "grid" || d === "inline-flex" || d === "inline-grid") {
    if (widthPx) {
      setStyle(el, { "min-width": widthPx });
    }
  }

  // 3. inline-flex (pills, chips): prevent text reflow.
  // width:max-content forces the pill to be exactly as wide as its content needs —
  // foreignObject font metrics can be slightly wider than the live DOM so a fixed
  // or min-width is not enough; max-content is self-adaptive and never wraps.
  if (d === "inline-flex" || d === "inline-grid") {
    setStyle(el, {
      "white-space": "nowrap",
      "flex-wrap": "nowrap",
      "flex-shrink": "0",
      "width": "max-content",
    });
    // Text nodes are NOT iterated by querySelectorAll and white-space:nowrap is not
    // reliably inherited to anonymous flex text boxes in SVG foreignObject.
    // Replace spaces with   (non-breaking space) directly on each text node —
    //   cannot break in any renderer, including foreignObject.
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const origText = child.textContent ?? "";
        if (origText.includes(" ")) {
          child.textContent = origText.replace(/ /g, " ");
          if (addRestore) addRestore(() => { child.textContent = origText; });
        }
      }
    }
    return;
  }

  // 4. Skip block flex/grid containers — only handle text-bearing elements below
  if (d === "flex" || d === "grid") return;

  const text = el.textContent ?? "";
  if (!text.trim()) return;

  // 5. Short multi-word leaf text (badge labels, rarity pills, stat labels, etc.)
  //    Force to a single line unconditionally — the primary fix for foreignObject
  //    font-metric drift that causes badges to wrap.
  if (el.childElementCount === 0 && text.includes(" ")) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) {
      const orig = text;
      // Replace regular spaces with non-breaking spaces ( ).
      //   cannot break in ANY renderer, including SVG foreignObject.
      el.textContent = orig.replace(/ /g, " ");
      const preserveMeasuredWidth =
        el.classList.contains("truncate") ||
        cs.textOverflow === "ellipsis" ||
        cs.overflow === "hidden";
      // Elements that already truncate in the live DOM should keep their exact
      // measured width; simple chip labels can expand to max-content safely.
      setStyle(
        el,
        preserveMeasuredWidth && widthPx
          ? { "white-space": "nowrap", width: widthPx, "max-width": widthPx }
          : { "white-space": "nowrap", width: "max-content" },
      );
      onTextReplace(el, orig);
      return;
    }
  }

  // 6. All other non-wrapping single-line elements: just nowrap
  if (cs.whiteSpace !== "nowrap") {
    const lh = resolveLineHeightPx(cs);
    if (el.clientHeight > 0 && el.clientHeight <= lh * 1.5) {
      setStyle(el, { "white-space": "nowrap" });
    }
  }
}

// ── GrindIT logo top-left for full-slide wrapper ─────────────────────────────

async function addLogoTopLeftEl(container: HTMLElement): Promise<void> {
  const logoDataUrl = await toDataUrl(logoAsset.url);
  if (!logoDataUrl) return;
  const el = document.createElement("div");
  el.style.cssText = [
    "position:absolute", "top:12px", "left:8px", "z-index:20",
    "pointer-events:none",
  ].join(";");
  const img = document.createElement("img");
  img.src = logoDataUrl;
  img.width = 48; img.height = 48;
  img.style.cssText = [
    "width:48px", "height:48px", "border-radius:50%",
    "background:#080612", "display:block",
    "box-shadow:0 0 0 2px oklch(0.72 0.18 295 / 0.7),0 0 14px oklch(0.72 0.18 295 / 0.55),0 0 28px oklch(0.72 0.18 295 / 0.25)",
  ].join(";");
  el.appendChild(img);
  container.appendChild(el);
}

// ── GrindIT watermark for card wrapper ───────────────────────────────────────

async function addCardWatermark(container: HTMLElement): Promise<void> {
  const logoDataUrl = await toDataUrl(logoAsset.url);

  const wm = document.createElement("div");
  wm.style.cssText = [
    "position:absolute", "bottom:18px", "right:18px",
    "display:flex", "align-items:center", "gap:8px",
    "padding:6px 12px 6px 7px", "border-radius:20px",
    "background:rgba(0,0,0,0.38)", "pointer-events:none",
  ].join(";");

  if (logoDataUrl) {
    const img = document.createElement("img");
    img.src = logoDataUrl;
    img.width = 26; img.height = 26;
    img.style.cssText = [
      "width:26px", "height:26px", "border-radius:50%",
      "box-shadow:0 0 0 1.5px oklch(0.72 0.18 295 / 0.72),0 0 9px oklch(0.72 0.18 295 / 0.5)",
    ].join(";");
    wm.appendChild(img);
  }

  // "G" + "rind" + "IT" — matching landing screen violet branding
  const makeSpan = (text: string, color: string) => {
    const s = document.createElement("span");
    s.textContent = text;
    s.style.cssText = `color:${color};font-size:13px;font-weight:700;letter-spacing:0.06em;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;`;
    return s;
  };
  const label = document.createElement("span");
  label.style.cssText = "display:inline-flex;white-space:nowrap;";
  label.appendChild(makeSpan("G",    "oklch(0.72 0.18 295)"));
  label.appendChild(makeSpan("rind", "rgba(255,255,255,0.85)"));
  label.appendChild(makeSpan("IT",   "oklch(0.72 0.18 295)"));
  wm.appendChild(label);

  container.appendChild(wm);
}

// ── star-dot overlay for card wrapper ────────────────────────────────────────

function addStarDots(container: HTMLElement, accent: string) {
  let seed = Math.abs(accent.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0));
  const rand = () => { seed = ((seed * 1664525 + 1013904223) | 0) >>> 0; return seed / 4294967295; };

  for (let i = 0; i < 50; i++) {
    const x  = rand() * 100;
    const y  = rand() * 100;
    const r  = rand() * 1.4 + 0.4;
    const op = rand() * 0.55 + 0.12;
    const col = rand() < 0.30 ? accent : "#ffffff";
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${(r*2).toFixed(1)}px;height:${(r*2).toFixed(1)}px;border-radius:50%;background:${col};opacity:${op.toFixed(2)};transform:translate(-50%,-50%);pointer-events:none;`;
    container.appendChild(el);
  }
  for (let i = 0; i < 5; i++) {
    const x  = rand() * 80 + 10;
    const y  = rand() * 80 + 10;
    const r  = rand() * 2.5 + 2;
    const op = rand() * 0.35 + 0.25;
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${(r*2).toFixed(1)}px;height:${(r*2).toFixed(1)}px;border-radius:50%;background:${accent};opacity:${op.toFixed(2)};transform:translate(-50%,-50%);pointer-events:none;`;
    container.appendChild(el);
  }
}

// ── live-DOM capture ──────────────────────────────────────────────────────────

type Opts = {
  scale?: number;
  background?: string;
  cropTo?: HTMLElement | null;
  /** If set, clone the element into an off-screen wrapper with this CSS background (gradient ok). */
  wrapperBg?: string;
  /** Padding (px) around the element when wrapperBg is used. Default 40. */
  wrapperPad?: number;
  /** When true, skip star-dot overlay and GrindIT watermark badge (used for full-slide clones). */
  noCardDeco?: boolean;
  /** Add GrindIT logo (with purple glow) to the top-left of the wrapper. */
  addLogoTopLeft?: boolean;
  /** Add GrindIT watermark badge to the bottom-right of the wrapper (desktop full-slide). */
  addSlideWatermark?: boolean;
  /**
   * CSS selectors — matching elements are removed from the clone before processing.
   * Useful for stripping display:none subtrees that CSS hides on the live DOM
   * (e.g. wc-pawcup-scene on mobile has ~500 nodes hidden by globals.css).
   */
  removeFromClone?: string[];
  /**
   * CSS selectors — matching elements in the clone get display:block forced.
   * Overrides Tailwind responsive classes (e.g. lg:hidden) so elements visible
   * only on one breakpoint can be shown in the capture regardless of viewport.
   */
  revealInClone?: string[];
  /**
   * data-share-layer value to skip entirely (node-walking + render).
   * Only used in the live-DOM path (no wrapperBg).
   */
  skipLayer?: string;
  /** Extra elements to skip in the live-DOM path. */
  skipElements?: HTMLElement[];
  /** Light fix mode for the live-DOM path (CSS injection + class-heuristic flex only). */
  lightFixes?: boolean;
  /**
   * Minimum capture width in px. When the element is narrower than this (e.g. a card
   * on a very small phone), the clone is forced to this width so the browser reflows
   * the content at the intended design width instead of the squeezed viewport width.
   * max-width is cleared on the clone so vw-based constraints don't fight the override.
   */
  minCaptureWidth?: number;
  /**
   * Faithful live-DOM capture (mobile card): screenshot the element exactly as it is on
   * screen. Skips all applyNodeFixes width/flex/text rewriting (only backdrop-filter is
   * stripped, since foreignObject can't render it) — the on-screen layout already fits,
   * so reproducing it verbatim avoids both the max-content overflow and the foreignObject
   * text re-wrap. Animations are still frozen to a deterministic frame.
   */
  faithful?: boolean;
};

export async function captureElement(root: HTMLElement, opts: Opts = {}): Promise<Blob | null> {
  const { scale = 2.5, background = "#080612", cropTo = null, wrapperBg, wrapperPad = 40,
          noCardDeco, addLogoTopLeft, addSlideWatermark, removeFromClone, revealInClone,
          skipLayer, lightFixes, skipElements, minCaptureWidth, faithful } = opts;

  // Clone-into-wrapper mode: captures the element on a styled background without
  // touching the live DOM (safe with React). Used for both card and full-slide.
  if (wrapperBg && !cropTo) {
    // minCaptureWidth: if the element is narrower than the design width (e.g. a card
    // on a very small phone), force the clone wider so the browser reflows content at
    // the intended width instead of the squeezed viewport width.
    const W = Math.max(root.offsetWidth || 380, minCaptureWidth ?? 0);
    const H = root.offsetHeight || 580;
    const totalW = W + wrapperPad * 2;
    const totalH = H + wrapperPad * 2;
    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "position:fixed", "top:-9999px", "left:0",
      `width:${totalW}px`, `height:${totalH}px`,
      "display:flex", "align-items:center", "justify-content:center",
      `background:${wrapperBg}`,
      "overflow:hidden",
    ].join(";") + ";";

    if (!noCardDeco) {
      const accent = (root.dataset as DOMStringMap).accent ?? "#a78bfa";
      addStarDots(wrap, accent);
    }

    const clone = root.cloneNode(true) as HTMLElement;
    clone.style.width     = `${W}px`;
    clone.style.height    = `${H}px`;
    clone.style.minWidth  = `${W}px`;
    clone.style.minHeight = `${H}px`;
    // When we're overriding to a wider width, remove any vw-based max-width so the
    // clone can actually expand to W (e.g. max-w-[82vw] would fight the override).
    if (minCaptureWidth && root.offsetWidth < minCaptureWidth) {
      clone.style.maxWidth = "none";
    }

    // Remove unwanted subtrees from the clone (e.g. display:none desktop scenes
    // that CSS hides on mobile but that still exist in the DOM).
    if (removeFromClone) {
      for (const sel of removeFromClone) {
        for (const el of Array.from(clone.querySelectorAll(sel))) el.remove();
      }
    }

    // Force-show elements hidden by responsive classes (e.g. lg:hidden) so they
    // appear in the capture regardless of viewport breakpoint.
    if (revealInClone) {
      for (const sel of revealInClone) {
        for (const el of Array.from(clone.querySelectorAll<HTMLElement>(sel))) {
          el.style.display = "block";
        }
      }
    }

    // Freeze all CSS animations at their final state BEFORE the clone enters the DOM.
    // cloneNode(true) resets animation timelines to t=0 — elements with animation-delay
    // (e.g. flag-in on Slide8 flags, delays up to 460 ms) would be at opacity:0 when
    // the snapshot fires. Setting animationDelay=-99s on every clone node places every
    // animation 99 s in the past → past completion → fill-mode:forwards/both holds the
    // final state. Inline styles on the clone (not document.head) keep live-page
    // animations (ScanLoader, etc.) running normally.
    const cloneNodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];
    for (const el of cloneNodes) {
      el.style.animationDelay = "-99s";
      el.style.animationPlayState = "paused";
    }

    wrap.appendChild(clone);
    document.body.appendChild(wrap);
    try {
      for (const el of cloneNodes) {
        const cs = getComputedStyle(el);
        applyNodeFixes(el, cs, (elem, props) => {
          for (const k of Object.keys(props)) elem.style.setProperty(k, props[k]);
        }, () => {});
      }
      await inlineExternalImages(clone);
      await Promise.all([
        addLogoTopLeft  ? addLogoTopLeftEl(wrap)  : Promise.resolve(),
        (!noCardDeco || addSlideWatermark) ? addCardWatermark(wrap) : Promise.resolve(),
      ]);
      const { domToCanvas } = await import("modern-screenshot");
      const canvas = await domToCanvas(wrap, { backgroundColor: background, scale });
      return await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
    } finally {
      wrap.remove();
    }
  }

  const restores: Array<() => void> = [];

  // Build a set of nodes to exclude from both node-walking and SVG render.
  const skipSet = new Set<Node>();
  if (skipLayer) {
    const skipRoot = root.querySelector<HTMLElement>(`[data-share-layer="${skipLayer}"]`);
    if (skipRoot) {
      skipSet.add(skipRoot);
      for (const child of skipRoot.querySelectorAll("*")) skipSet.add(child);
    }
  }
  // Extra elements (e.g. display:none subtrees that CSS hides but DOM still contains).
  if (skipElements) {
    for (const el of skipElements) {
      skipSet.add(el);
      for (const child of el.querySelectorAll("*")) skipSet.add(child);
    }
  }

  // Full-slide light path: one global CSS rule removes backdrop-filter everywhere —
  // faster than checking getComputedStyle on every node.
  // Matches complete class tokens only: `flex` matches but `flex-col` does not.
  const FLEX_TOKEN_RE = /(?:^| )(flex|grid|inline-flex|inline-grid)(?= |$)/;

  let bfStyleEl: HTMLStyleElement | null = null;
  if (lightFixes || faithful) {
    bfStyleEl = document.createElement("style");
    bfStyleEl.textContent =
      "* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }";
    document.head.appendChild(bfStyleEl);
  }

  const setStyle = (el: HTMLElement, props: Record<string, string>) => {
    const prev: Record<string, string> = {};
    for (const k of Object.keys(props)) {
      prev[k] = el.style.getPropertyValue(k);
      el.style.setProperty(k, props[k]);
    }
    restores.push(() => {
      for (const k of Object.keys(prev)) {
        if (prev[k]) el.style.setProperty(k, prev[k]);
        else el.style.removeProperty(k);
      }
    });
  };

  const nodes: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const el of nodes) {
    if (skipSet.has(el)) continue;
    if (el !== root && el.hasAttribute("data-share-ignore")) continue;

    // Freeze CSS animations at a deterministic far-future frame (same trick the clone
    // path uses) so the live-DOM capture never catches a pulsing glow or a floating
    // element mid-animation — the "extra glow" artifact in mobile share renders.
    const prevAnimDelay = el.style.animationDelay;
    const prevAnimPlay  = el.style.animationPlayState;
    el.style.animationDelay = "-99s";
    el.style.animationPlayState = "paused";
    restores.push(() => {
      el.style.animationDelay = prevAnimDelay;
      el.style.animationPlayState = prevAnimPlay;
    });

    // Faithful screenshot: no width/flex/text rewriting — render exactly as on screen.
    // (backdrop-filter already neutralised by the injected CSS rule above.)
    if (faithful) continue;

    if (lightFixes) {
      // Light path: only lock flex/grid widths (prevents foreignObject reflow).
      // backdrop-filter already handled by CSS injection; text fixes skipped for speed.
      // Use class-name heuristic to avoid getComputedStyle on non-flex elements.
      const cls = typeof el.className === "string" ? el.className : "";
      if (!FLEX_TOKEN_RE.test(cls)) continue;
      const d = getComputedStyle(el).display;
      if (d !== "flex" && d !== "grid" && d !== "inline-flex" && d !== "inline-grid") continue;
      const w = el.getBoundingClientRect().width;
      if (w > 0) {
        el.style.setProperty("min-width", `${w}px`);
        restores.push(() => el.style.removeProperty("min-width"));
      }
      if (d === "inline-flex" || d === "inline-grid") {
        el.style.setProperty("white-space", "nowrap");
        el.style.setProperty("width", "max-content");
        restores.push(() => {
          el.style.removeProperty("white-space");
          el.style.removeProperty("width");
        });
      }
      continue;
    }

    const cs = getComputedStyle(el);
    applyNodeFixes(el, cs, setStyle, (elem, orig) => {
      restores.push(() => { elem.textContent = orig; });
    }, (fn) => restores.push(fn));
  }

  const restoreImgs = await inlineExternalImages(root);
  try {
    const { domToCanvas } = await import("modern-screenshot");
    const canvas = await domToCanvas(root, {
      backgroundColor: background,
      scale,
      filter: (node) => {
        if (skipSet.has(node)) return false;
        if (node instanceof Element && node.hasAttribute("data-share-ignore")) return false;
        return true;
      },
    });

    // Full-slide mode — return as-is
    if (!cropTo) {
      return await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
    }

    // Card mode — crop from perfect full-slide render + vignette
    const r0 = root.getBoundingClientRect();
    const rc = cropTo.getBoundingClientRect();
    const cLeft = Math.round((rc.left - r0.left) * scale);
    const cTop  = Math.round((rc.top  - r0.top)  * scale);
    const cW    = Math.round(rc.width  * scale);
    const cH    = Math.round(rc.height * scale);

    const final = cropWithVignette(canvas, cLeft, cTop, cW, cH, scale);
    return await new Promise<Blob | null>((res) => final.toBlob((b) => res(b), "image/png"));
  } finally {
    bfStyleEl?.remove();
    restoreImgs();
    restores.forEach((fn) => fn());
  }
}
