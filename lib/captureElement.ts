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
