"use client";

const CHAPTERS = [
  { chapter: 1, subtitle: "Opening Ceremony" },
  { chapter: 2, subtitle: "Meet the Captain" },
  { chapter: 3, subtitle: "Matchday Atmosphere" },
  { chapter: 4, subtitle: "Inside the Playbook" },
  { chapter: 5, subtitle: "Road to the Final" },
  { chapter: 6, subtitle: "VAR Under Review" },
  { chapter: 7, subtitle: "Live From the Pitch" },
  { chapter: 8, subtitle: "Champions at Last" },
  { chapter: 9, subtitle: "The Final Award" },
] as const;

export default function WorldCupChapterHeading({ index }: { index: number }) {
  const entry = CHAPTERS[index] ?? CHAPTERS[0];

  return (
    <div className="pointer-events-none absolute left-[68px] top-[44px] z-40 sm:left-[88px] sm:top-[56px]">
      <div className="relative overflow-hidden rounded-[14px] border border-amber-300/24 bg-[#090412]/74 px-2 py-1.5 shadow-[0_12px_24px_rgba(0,0,0,0.34)] backdrop-blur-md sm:px-2.5 sm:py-2">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(250,204,21,0.14), transparent 45%), repeating-linear-gradient(180deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px)",
          }}
        />
        <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-amber-200 via-amber-400 to-fuchsia-400" />

        <div className="relative flex items-start gap-2">
          <div className="mt-0.5 flex flex-col items-center">
            <div className="animate-wc-chapter-ball-spin h-4.5 w-4.5 rounded-full border border-amber-300/34 bg-white/95 shadow-[0_0_7px_rgba(250,204,21,0.16)] sm:h-5 sm:w-5">
              <svg viewBox="0 0 64 64" className="h-full w-full">
                <defs>
                  <radialGradient id="wcChapterBall" cx="38%" cy="30%" r="72%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="62%" stopColor="#eef1f5" />
                    <stop offset="100%" stopColor="#bcc2cc" />
                  </radialGradient>
                  <clipPath id="wcChapterBallClip">
                    <circle cx="32" cy="32" r="27" />
                  </clipPath>
                </defs>
                <circle cx="32" cy="32" r="27" fill="url(#wcChapterBall)" />
                <g clipPath="url(#wcChapterBallClip)" fill="none" strokeLinecap="round">
                  <path d="M31 33 C 35 25 24 21 25 13 C 25.5 8.5 21 6.5 15 8" stroke="#c8163d" strokeWidth="8.5" />
                  <path d="M31 33 C 35 25 24 21 25 13 C 25.5 8.5 21 6.5 15 8" stroke="#1f9d4d" strokeWidth="8.5" transform="rotate(120 32 32)" />
                  <path d="M31 33 C 35 25 24 21 25 13 C 25.5 8.5 21 6.5 15 8" stroke="#1d7fe0" strokeWidth="8.5" transform="rotate(240 32 32)" />
                </g>
                <circle cx="32" cy="32" r="27" fill="none" stroke="#000000" strokeOpacity="0.18" strokeWidth="1.4" />
              </svg>
            </div>
            <div className="mt-1 h-3.5 w-px bg-gradient-to-b from-amber-300/60 to-transparent sm:h-4" />
          </div>

          <div className="min-w-[122px] sm:min-w-[148px]">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-1.5 py-[3px] text-[6px] font-black uppercase tracking-[0.22em] text-amber-100/86 sm:text-[7px]">
              <span>Chapter {entry.chapter}</span>
              <span className="text-amber-300/60">•</span>
              <span>Match Log</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="h-[2px] w-4 bg-gradient-to-r from-amber-300 to-fuchsia-400 sm:w-5" />
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white sm:text-[11px]">
                {entry.subtitle}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes wc-chapter-ball-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-wc-chapter-ball-spin {
          animation: wc-chapter-ball-spin 5.5s linear infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
