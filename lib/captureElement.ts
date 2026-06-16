// Shared screenshot helper built on modern-screenshot (renders via SVG
// <foreignObject>, so oklch/oklab/color-mix work — html2canvas can't parse them).
//
// Rendering a small element in isolation makes modern-screenshot re-measure its
// width at sub-pixel precision, which reflows single-line text (badges, titles).
// The full-slide render is pixel-accurate, so to capture a card we render the
// whole slide and CROP to the card's rectangle — the result is identical to what
// the user sees, including the space background behind the glass card.
//
// Before rendering we temporarily neutralize `backdrop-filter` (foreignObject
// can't render it, which otherwise leaves grey/blurred patches). The mutation is
// reverted in a finally block, behind the share modal's overlay, so it's never
// visible on the page.

type Opts = { scale?: number; background?: string; cropTo?: HTMLElement | null };

export async function captureElement(root: HTMLElement, opts: Opts = {}): Promise<Blob | null> {
  const { scale = 2, background = "#080612", cropTo = null } = opts;
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
    if (cs.backdropFilter !== "none" || cs.getPropertyValue("-webkit-backdrop-filter") !== "none") {
      setStyle(el, { "backdrop-filter": "none", "-webkit-backdrop-filter": "none" });
    }
    // foreignObject rounds widths at sub-pixel, which reflows single-line text
    // (badges like "METEORS NEUTRALIZED", stat titles). Lock anything that is
    // CURRENTLY on one line to nowrap so it renders exactly as on the page.
    // Multi-line paragraphs (taller than ~1.4 line-heights) are left untouched.
    const text = el.textContent;
    if (text && text.trim() && cs.whiteSpace !== "nowrap") {
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3 || 16;
      if (el.clientHeight > 0 && el.clientHeight <= lh * 1.4) {
        setStyle(el, { "white-space": "nowrap" });
      }
    }
  }

  try {
    const { domToCanvas } = await import("modern-screenshot");
    const canvas = await domToCanvas(root, {
      backgroundColor: background,
      scale,
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-share-ignore")),
    });

    let out: HTMLCanvasElement = canvas;
    if (cropTo) {
      const r0 = root.getBoundingClientRect();
      const rc = cropTo.getBoundingClientRect();
      const sx = Math.round(Math.max(0, rc.left - r0.left) * scale);
      const sy = Math.round(Math.max(0, rc.top - r0.top) * scale);
      const sw = Math.round(rc.width * scale);
      const sh = Math.round(rc.height * scale);
      const c2 = document.createElement("canvas");
      c2.width = sw;
      c2.height = sh;
      const ctx = c2.getContext("2d");
      if (ctx) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, sw, sh);
        ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
      }
      out = c2;
    }

    return await new Promise<Blob | null>((res) => out.toBlob((b) => res(b), "image/png"));
  } finally {
    restores.forEach((fn) => fn());
  }
}

// ── desktop-layout capture (for mobile share) ──────────────────────────────
// Tailwind `lg:` breakpoints are viewport-media-query based, so on a phone the
// live DOM is in mobile layout. To produce a share image that looks like the
// desktop version we clone the slide into an OFF-SCREEN iframe sized to a desktop
// width — the iframe has its own viewport, so the `lg:` rules re-evaluate and the
// clone lays out exactly like desktop. We then screenshot the clone.

type DesktopOpts = { scale?: number; background?: string; cropToSelector?: string | null; width?: number; height?: number };

function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll("img"));
  return Promise.all(
    imgs.map(
      (img) =>
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

export async function captureDesktopElement(root: HTMLElement, opts: DesktopOpts = {}): Promise<Blob | null> {
  const { scale = 2, background = "#080612", cropToSelector = null, width = 1280, height = 860 } = opts;

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

    // copy the app's stylesheets (Tailwind + fonts) into the iframe
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });
    doc.documentElement.style.cssText = `width:${width}px;`;
    doc.body.style.cssText = `margin:0;width:${width}px;min-height:${height}px;background:${background};overflow:hidden;`;

    // clone the slide and force it to lay out in flow at desktop width
    const clone = root.cloneNode(true) as HTMLElement;
    clone.style.position = "relative";
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.minHeight = `${height}px`;
    doc.body.appendChild(clone);

    // let the iframe apply the copied stylesheets, re-evaluate media queries and
    // run a first layout pass before we measure/capture (two rAFs), then wait for
    // fonts & images so the very first capture is reliable (no empty render).
    await new Promise<void>((r) => win.requestAnimationFrame(() => win.requestAnimationFrame(() => r())));
    try { await (doc as Document & { fonts?: FontFaceSet }).fonts?.ready; } catch { /* fonts optional */ }
    await waitForImages(clone);
    await new Promise((r) => setTimeout(r, 280));

    // neutralize backdrop-filter (foreignObject can't render it) on the clone
    const nodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];
    for (const el of nodes) {
      // The clone is a static snapshot; if it was taken mid entry-animation,
      // framer-motion left inline opacity<1. Reset those so the share always
      // shows the settled (visible) state.
      if (el.style.opacity && parseFloat(el.style.opacity) < 1) el.style.removeProperty("opacity");

      const cs = win.getComputedStyle(el);
      if (cs.backdropFilter !== "none" || cs.getPropertyValue("-webkit-backdrop-filter") !== "none") {
        el.style.setProperty("backdrop-filter", "none");
        el.style.setProperty("-webkit-backdrop-filter", "none");
      }
      const text = el.textContent;
      if (text && text.trim() && cs.whiteSpace !== "nowrap") {
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3 || 16;
        if (el.clientHeight > 0 && el.clientHeight <= lh * 1.4) el.style.setProperty("white-space", "nowrap");
      }
    }

    const cropEl = cropToSelector ? clone.querySelector<HTMLElement>(cropToSelector) : null;

    const { domToCanvas } = await import("modern-screenshot");
    const canvas = await domToCanvas(clone, {
      backgroundColor: background,
      scale,
      width,
      height,
      filter: (node) => !(node instanceof Element && node.hasAttribute("data-share-ignore")),
    });

    let out: HTMLCanvasElement = canvas;
    if (cropEl) {
      const r0 = clone.getBoundingClientRect();
      const rc = cropEl.getBoundingClientRect();
      const sx = Math.round(Math.max(0, rc.left - r0.left) * scale);
      const sy = Math.round(Math.max(0, rc.top - r0.top) * scale);
      const sw = Math.round(rc.width * scale);
      const sh = Math.round(rc.height * scale);
      const c2 = document.createElement("canvas");
      c2.width = sw;
      c2.height = sh;
      const ctx = c2.getContext("2d");
      if (ctx) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, sw, sh);
        ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
      }
      out = c2;
    }

    return await new Promise<Blob | null>((res) => out.toBlob((b) => res(b), "image/png"));
  } finally {
    iframe.remove();
  }
}
