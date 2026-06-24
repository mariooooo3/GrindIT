// Screenshot helper built on modern-screenshot (SVG foreignObject — supports oklch/oklab).
//
// CARD mode:  render full slide (perfect quality) → crop around card + padding →
//             apply radial vignette so edges fade to dark. No CSS manipulation.
// SLIDE mode: full screenshot, pixel-accurate.

import logoAsset from "@/components/pawcup/assets/logo3.asset.json";

// Per-session cache: external img src → data URL (avoids re-fetching on every capture)
const imgDataCache = new Map<string, string>();

async function toDataUrl(src: string): Promise<string | null> {
  if (imgDataCache.has(src)) return imgDataCache.get(src)!;
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    imgDataCache.set(src, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

// Replace all external <img> src with cached data URLs so modern-screenshot
// doesn't need to fetch them during render (faster + avoids connect-src issues).
async function inlineExternalImages(root: HTMLElement): Promise<() => void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  const restores: Array<() => void> = [];
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src") ?? "";
      if (!src || src.startsWith("data:") || src.startsWith("/")) return;
      const dataUrl = await toDataUrl(src);
      if (!dataUrl) return;
      img.setAttribute("src", dataUrl);
      restores.push(() => img.setAttribute("src", src));
    }),
  );
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

/**
 * Extract all CSS custom properties from live document stylesheets so they
 * can be re-injected into the off-screen iframe (theme vars, etc.).
 */
function extractCSSVars(): string {
  let out = ":root{";
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (
            rule instanceof CSSStyleRule &&
            /^(:root|html)$/i.test(rule.selectorText.trim())
          ) {
            const s = rule.style;
            for (let i = 0; i < s.length; i++) {
              const p = s[i];
              if (p.startsWith("--")) out += `${p}:${s.getPropertyValue(p)};`;
            }
          }
        }
      } catch {
        /* cross-origin stylesheet — skip */
      }
    }
  } catch {
    /* ignore */
  }
  return out + "}";
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
};

export async function captureElement(root: HTMLElement, opts: Opts = {}): Promise<Blob | null> {
  const { scale = 2.5, background = "#080612", cropTo = null, wrapperBg, wrapperPad = 40 } = opts;

  // Clone-into-wrapper mode: captures the element on a styled gradient background
  // without touching the live DOM (safe with React).
  if (wrapperBg && !cropTo) {
    const W = root.offsetWidth || 380;
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

    const accent = (root.dataset as DOMStringMap).accent ?? "#a78bfa";
    addStarDots(wrap, accent);

    const clone = root.cloneNode(true) as HTMLElement;
    clone.style.width  = `${W}px`;
    clone.style.height = `${H}px`;
    clone.style.minWidth  = `${W}px`;
    clone.style.minHeight = `${H}px`;
    wrap.appendChild(clone);
    document.body.appendChild(wrap);
    try {
      const cloneNodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];
      for (const el of cloneNodes) {
        const cs = getComputedStyle(el);
        applyNodeFixes(el, cs, (elem, props) => {
          for (const k of Object.keys(props)) elem.style.setProperty(k, props[k]);
        }, (_e, _o) => {});
      }
      await inlineExternalImages(clone);
      await addCardWatermark(wrap);
      const { domToCanvas } = await import("modern-screenshot");
      const canvas = await domToCanvas(wrap, { backgroundColor: background, scale });
      return await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
    } finally {
      wrap.remove();
    }
  }

  const restores: Array<() => void> = [];

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
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-share-ignore")),
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
    restoreImgs();
    restores.forEach((fn) => fn());
  }
}

// ── desktop-layout capture (for mobile share) ────────────────────────────────
// On phones the live DOM is in mobile layout; Tailwind `lg:` rules don't fire.
// We clone the slide into an off-screen iframe sized to desktop width so that
// lg: breakpoints re-evaluate and produce the desktop appearance.

type DesktopOpts = {
  scale?: number;
  background?: string;
  cropToSelector?: string | null;
  width?: number;
  height?: number;
};

function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((res) => {
            const done = () => res();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            setTimeout(done, 2500);
          }),
    ),
  ).then(() => undefined);
}

export async function captureDesktopElement(
  root: HTMLElement,
  opts: DesktopOpts = {},
): Promise<Blob | null> {
  const {
    scale = 2.5,
    background = "#080612",
    cropToSelector = null,
    width = 1440,
    height = 900,
  } = opts;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;border:0;opacity:0;pointer-events:none;z-index:-1;`;
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return null;

    doc.open();
    doc.write("<!DOCTYPE html><html><head><meta charset='utf-8'></head><body></body></html>");
    doc.close();

    // Copy app stylesheets (Tailwind + fonts)
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });

    // Inject CSS custom properties so theme vars work in the iframe
    const varsStyle = doc.createElement("style");
    varsStyle.textContent = extractCSSVars();
    doc.head.appendChild(varsStyle);

    doc.documentElement.style.cssText = `width:${width}px;`;
    doc.body.style.cssText = `margin:0;width:${width}px;min-height:${height}px;background:${background};overflow:hidden;`;

    // Clone slide and force desktop layout
    const clone = root.cloneNode(true) as HTMLElement;
    clone.style.cssText += `position:relative;width:${width}px;height:${height}px;min-height:${height}px;`;
    doc.body.appendChild(clone);

    // Wait: styles parse → media queries re-evaluate → fonts & images load
    await new Promise<void>((r) =>
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => r())),
    );
    try {
      await (doc as Document & { fonts?: FontFaceSet }).fonts?.ready;
    } catch {
      /* fonts optional */
    }
    await waitForImages(clone);
    await new Promise((r) => setTimeout(r, 320));

    // Fix clone elements — same logic as captureElement but without restore bookkeeping
    const nodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];
    for (const el of nodes) {
      // Reset Framer Motion inline opacity so we capture the settled (visible) state
      if (el.style.opacity !== "" && parseFloat(el.style.opacity) < 1) {
        el.style.removeProperty("opacity");
      }
      // Reset FM translate frozen at entry state
      if (el.style.transform && el.style.transform !== "none") {
        if (/translateY\((?:1[5-9]|[2-9]\d)px\)/.test(el.style.transform)) {
          el.style.removeProperty("transform");
        }
      }

      const cs = win.getComputedStyle(el);

      // Inline setter (no restore needed — clone is throw-away)
      const setStyleInline = (_el: HTMLElement, props: Record<string, string>) => {
        for (const k of Object.keys(props)) _el.style.setProperty(k, props[k]);
      };

      applyNodeFixes(el, cs, setStyleInline, (elem, _orig) => {
        // No restore needed in iframe clone
        void elem; void _orig;
      });
    }

    const cropEl = cropToSelector
      ? clone.querySelector<HTMLElement>(cropToSelector)
      : null;

    await inlineExternalImages(clone);
    const { domToCanvas } = await import("modern-screenshot");
    const canvas = await domToCanvas(clone, {
      backgroundColor: background,
      scale,
      width,
      height,
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-share-ignore")),
    });

    // Full-slide mode — return as-is
    if (!cropEl) {
      return await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
    }

    // Card mode — composite full slide onto custom background via roundRect clip
    const r0 = clone.getBoundingClientRect();
    const rc = cropEl.getBoundingClientRect();
    const cLeft = Math.round((rc.left - r0.left) * scale);
    const cTop  = Math.round((rc.top  - r0.top)  * scale);
    const cW    = Math.round(rc.width  * scale);
    const cH    = Math.round(rc.height * scale);

    const final = cropWithVignette(canvas, cLeft, cTop, cW, cH, scale);
    return await new Promise<Blob | null>((res) => final.toBlob((b) => res(b), "image/png"));
  } finally {
    iframe.remove();
  }
}
