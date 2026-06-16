"use client";

// 5×5 pixel glyphs — only the characters needed for "CHAPTER 1..8".
const G: Record<string, number[][]> = {
  C: [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
  H: [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  A: [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  P: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0]],
  "1": [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  "2": [[1,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
  "3": [[1,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  "4": [[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
  "5": [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  "6": [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  "7": [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
  "8": [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
};

const COLS = 5;
const ROWS = 5;
const CHAR_GAP = 1; // cells between characters
const SPACE = 3;    // cells for a space

export function StarText({ text, cell = 5, color = "rgb(237,233,254)" }: { text: string; cell?: number; color?: string }) {
  const stars: { x: number; y: number; delay: number; dur: number }[] = [];
  let s = 7;
  const rnd = () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
  let cx = 0;
  for (const ch of text.toUpperCase()) {
    if (ch === " ") { cx += SPACE; continue; }
    const g = G[ch];
    if (!g) { cx += COLS + CHAR_GAP; continue; }
    for (let r = 0; r < g.length; r++)
      for (let c = 0; c < g[r].length; c++)
        if (g[r][c]) stars.push({ x: (cx + c) * cell, y: r * cell, delay: rnd() * 2.6, dur: 1.1 + rnd() * 1.8 });
    cx += COLS + CHAR_GAP;
  }
  const width = cx * cell;
  const height = ROWS * cell;

  return (
    <div className="relative" style={{ width, height }}>
      <style>{`@keyframes chtw{0%,100%{opacity:.7}50%{opacity:1}}`}</style>
      {stars.map((st, i) => (
        <span key={i} className="pointer-events-none absolute"
          style={{
            left: st.x, top: st.y,
            width: cell, height: cell, fontSize: cell + 1, lineHeight: 1, color,
            textShadow: "0 0 7px rgba(255,255,255,0.95), 0 0 14px rgba(196,181,253,0.95), 0 0 24px rgba(139,92,246,0.75)",
            filter: "brightness(1.35)",
            animation: `chtw ${st.dur}s ease-in-out ${st.delay}s infinite`,
          }}>✦</span>
      ))}
    </div>
  );
}

// "CHAPTER N" in twinkling stars + a small normal-text chapter title.
export default function ChapterHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="pointer-events-none flex flex-col items-center gap-2.5 text-center">
      <StarText text={`CHAPTER ${n}`} />
      <span className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/55">{title}</span>
    </div>
  );
}

export function ChapterHeadingAnchor({ n, title }: { n: number; title: string }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[88px] z-30 hidden -translate-x-1/2 lg:block lg:left-[calc(50%+min(31vw,520px))]">
      <ChapterHeading n={n} title={title} />
    </div>
  );
}

// Compact in-flow chapter heading for mobile (small star title), shown above the
// card. Desktop uses ChapterHeadingAnchor instead.
export function ChapterHeadingMobile({ n, title }: { n: number; title: string }) {
  return (
    <div className="pointer-events-none mb-3 flex flex-col items-center gap-1.5 lg:hidden">
      <StarText text={`CHAPTER ${n}`} cell={4} />
      <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/55">{title}</span>
    </div>
  );
}
