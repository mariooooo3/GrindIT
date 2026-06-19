"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { WrappedProfile } from "@/types/wrapped";
import { mapToFlat } from "@/components/wrapped/flatProfile";
import { PlanetStage, Stars, MobilePlanet } from "@/components/wrapped/shared";
import { ChapterHeadingAnchor, ChapterHeadingMobile } from "@/components/ui/ChapterHeading";
import { SlideCard } from "@/components/wrapped/SlideCard";

const ACCENT = "#fb923c";

function CatFace({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#f3a83a" />
      <polygon points="8,12 12,4 16,12" fill="#f3a83a" />
      <polygon points="32,12 28,4 24,12" fill="#f3a83a" />
      <ellipse cx="15" cy="20" rx="2" ry="2.6" fill="#0b0b0b" />
      <ellipse cx="25" cy="20" rx="2" ry="2.6" fill="#0b0b0b" />
      <circle cx="15.5" cy="19" r="0.6" fill="#fff" />
      <circle cx="25.5" cy="19" r="0.6" fill="#fff" />
      <path d="M19 25 L21 25 L20 26.4 Z" fill="#d24a6b" />
      <path d="M20 26.5 Q18 28.5 16.5 27.5 M20 26.5 Q22 28.5 23.5 27.5" stroke="#3a1a08" strokeWidth="0.7" fill="none" />
    </svg>
  );
}

function AstronautMouseRocket({ size }: { size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/wrapped/soricel-spatial-transparent.png"
      alt=""
      width={size}
      height={size}
      draggable={false}
      className="pointer-events-none select-none"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        transformOrigin: "center",
      }}
    />
  );
}

function CardboardRocket({ scale = 1, label, isCat = false, merged = false }: { scale?: number; label?: string; isCat?: boolean; merged?: boolean }) {
  const w = 96 * scale;
  const h = 110 * scale;
  return (
    <div className="relative" style={{ width: w, height: h }}>
      {isCat ? (
        <>
          <motion.div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -14 * scale }}
            animate={{ scaleY: [1, 1.3, 0.9, 1.2, 1], opacity: [0.8, 1, 0.7, 1, 0.8] }}
            transition={{ duration: 0.3, repeat: Infinity }}>
            <div style={{ width: 16 * scale, height: 28 * scale, background: "radial-gradient(circle at 50% 20%, #fff2a8 0%, #ffb347 40%, #ff5722 80%, transparent 100%)", borderRadius: "50% 50% 40% 40% / 30% 30% 70% 70%", filter: "blur(1px)" }} />
          </motion.div>
          <div className="absolute inset-0 rounded-md"
            style={{ background: "linear-gradient(180deg, #c98a4b 0%, #a96a2e 60%, #7a4a1c 100%)", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.15)", border: "1.5px solid #5a3410" }}>
            <div className="absolute left-0 right-0" style={{ top: "38%", height: 6 * scale, background: "rgba(255,255,255,0.25)" }} />
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#0b1a2b] border-2 border-[#3a2410] overflow-hidden flex items-end justify-center"
              style={{ top: 12 * scale, width: 44 * scale, height: 44 * scale }}>
              <CatFace size={36 * scale} />
            </div>
            <div className="absolute" style={{ left: -8 * scale, bottom: 0, width: 12 * scale, height: 22 * scale, background: "#7a4a1c", clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />
            <div className="absolute" style={{ right: -8 * scale, bottom: 0, width: 12 * scale, height: 22 * scale, background: "#7a4a1c", clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
          </div>
        </>
      ) : (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [0, -5, 4, -3, 0], rotate: [-3, 2, -2, 3, -3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <AstronautMouseRocket size={112 * scale} />
        </motion.div>
      )}
      {label && (
        <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm border border-white/10" style={{ top: -16 }}>
          {label}{merged && <span className="ml-1 text-emerald-400">✓</span>}
        </div>
      )}
    </div>
  );
}

function ChaseScene({ merged }: { merged: boolean[] }) {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className="absolute rounded-full bg-white/70" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, width: 1.5, height: 1.5 }} />
        ))}
      </div>
      {merged.map((isMerged, i) => {
        const baseY = 15 + i * 78;
        return (
          <AnimatePresence key={i}>
            {!isMerged ? (
              <motion.div className="absolute" style={{ top: baseY, right: 0 }}
                initial={{ x: "0%", opacity: 0 }}
                animate={{ x: ["10%", "-180%"], y: [0, -16, 14, -8, 0], rotate: [-6, 6, -4, 5, -6], opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ x: { duration: 11 + i * 1.6, repeat: Infinity, ease: "linear", delay: i * 1.1 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.6 } }}>
                <CardboardRocket scale={0.62} label={`PR #${100 + i}`} />
              </motion.div>
            ) : (
              <motion.div className="absolute" style={{ top: baseY, right: "30%" }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: [1, 1.8, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 1.1 }}>
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-bold text-white">✓ Merged</div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
      <motion.div className="absolute" style={{ bottom: 30, left: 20 }}
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: [0, 30, 0], y: [0, -8, 0], opacity: 1 }}
        transition={{ x: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }, y: { duration: 1.1, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.8, delay: 0.4 } }}>
        <motion.div animate={{ rotate: [12, 18, 12] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cat-rocket.png" alt="" width={105} height={105} className="select-none object-contain" draggable={false}
            style={{ filter: "drop-shadow(0 0 14px rgba(74,222,128,0.5))" }} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Planet() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute h-[38rem] w-[38rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,140,60,0.45) 0%, rgba(232,107,42,0.18) 40%, transparent 70%)" }} />
      <div className="absolute h-[24rem] w-[24rem] rounded-full"
        style={{ background: "radial-gradient(circle, transparent 62%, rgba(255,170,90,0.35) 70%, rgba(255,120,50,0.15) 80%, transparent 90%)", filter: "blur(6px)" }} />

      {/* distant tiny moon, slowly orbiting */}
      <motion.div className="absolute h-[360px] w-[360px]"
        animate={{ rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }}>
        <div className="absolute rounded-full" style={{ top: "-6%", left: "78%", width: 14, height: 14,
          background: "radial-gradient(circle at 35% 35%, #fff0d6, #d99a52 60%, #6b3f16 100%)",
          boxShadow: "0 0 10px rgba(255,200,140,0.6)" }} />
      </motion.div>

      <div className="relative h-[360px] w-[360px]">
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 50% 50%, #E86B2A 0%, #c4521a 60%, #6b2509 100%)" }} />
        <motion.div className="absolute inset-0 overflow-hidden rounded-full"
          animate={{ backgroundPositionX: ["0%", "200%"] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg, rgba(255,180,110,0.10) 0px, rgba(255,180,110,0.10) 6px, transparent 6px, transparent 14px)",
              "radial-gradient(ellipse 60px 30px at 20% 30%, rgba(120,40,10,0.55), transparent 70%)",
              "radial-gradient(ellipse 90px 40px at 70% 25%, rgba(255,200,130,0.35), transparent 70%)",
              "radial-gradient(ellipse 70px 35px at 40% 60%, rgba(90,30,5,0.5), transparent 70%)",
              "radial-gradient(ellipse 100px 45px at 80% 70%, rgba(255,170,90,0.30), transparent 70%)",
              "radial-gradient(ellipse 50px 25px at 25% 80%, rgba(140,55,15,0.55), transparent 70%)",
            ].join(", "),
            backgroundSize: "200% 100%, 200% 100%, 200% 100%, 200% 100%, 200% 100%, 200% 100%",
          }} />
        <motion.div className="absolute inset-0 overflow-hidden rounded-full"
          animate={{ rotate: 360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }}>
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <defs>
              <filter id="lg2" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="cs2" cx="35%" cy="35%">
                <stop offset="0%" stopColor="rgba(255,200,140,0.35)" />
                <stop offset="50%" stopColor="rgba(60,20,5,0.6)" />
                <stop offset="100%" stopColor="rgba(20,8,2,0.85)" />
              </radialGradient>
            </defs>
            <g stroke="#ffd07a" strokeWidth="0.7" fill="none" filter="url(#lg2)" opacity="0.95">
              <path d="M30 95 Q55 88 78 96 T130 88 T182 100" />
              <path d="M45 130 Q72 122 96 138 T158 128" />
              <path d="M62 55 Q82 72 74 100 T88 142" />
            </g>
            <g stroke="#ff8a3d" strokeWidth="0.5" fill="none" filter="url(#lg2)" opacity="0.6">
              <path d="M20 70 Q60 64 100 72 T180 66" />
              <path d="M25 110 Q66 104 112 114 T175 108" />
            </g>
            <g>
              <circle cx="72" cy="62" r="5.5" fill="url(#cs2)" />
              <circle cx="142" cy="118" r="8" fill="url(#cs2)" />
              <circle cx="108" cy="160" r="4.5" fill="url(#cs2)" />
            </g>
          </svg>
        </motion.div>
        <div className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 25%, rgba(255,225,180,0.55) 0%, rgba(255,180,110,0.15) 22%, transparent 45%)", mixBlendMode: "screen" }} />
        <div className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 75% 80%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 25%, transparent 55%)" }} />
        <div className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.55), inset -20px -10px 80px rgba(0,0,0,0.4)" }} />
        <div className="pointer-events-none absolute -inset-1 rounded-full"
          style={{ boxShadow: "0 0 40px 4px rgba(255,150,70,0.55), 0 0 90px 10px rgba(232,107,42,0.35)" }} />
      </div>
    </div>
  );
}

export default function SlideContributions({ profile }: { profile: WrappedProfile }) {
  const flat = mapToFlat(profile);
  const prsMerged = flat.pullRequests.merged;
  const hasPRs = prsMerged > 0;
  const issuesOpened = flat.issuesOpened;
  const prsOpened = flat.prsOpened;
  const topRepo = flat.topRepoCard?.name ?? flat.topRepos[0]?.name ?? "—";
  const impactZero = flat.totalStars + flat.totalForks + flat.followers === 0;
  const impactItems = impactZero
    ? [{ label: "Commits", value: flat.totalCommits }, { label: "Repos", value: flat.ownedRepoCount }, { label: "Active days", value: flat.activeDayCount }]
    : [{ label: "Stars", value: flat.totalStars }, { label: "Forks", value: flat.totalForks }, { label: "Followers", value: flat.followers }];

  // animate each merged PR dot sequentially (all slots filled — data is merged-only)
  const [showMerged, setShowMerged] = useState<boolean[]>([false, false, false]);
  useEffect(() => {
    if (!hasPRs) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    [0, 1, 2].forEach((i) => {
      timers.push(setTimeout(() => {
        setShowMerged((prev) => { const next = [...prev]; next[i] = true; return next; });
      }, 3500 + i * 2000));
    });
    return () => timers.forEach(clearTimeout);
  }, [hasPRs]);

  return (
    <main className="relative min-h-full w-full overflow-hidden text-white" style={{ backgroundColor: "#080612" }}>
      <Stars />
      <ChapterHeadingAnchor n={2} title="The Chase" />
      <div className="relative z-10 grid min-h-screen grid-cols-1 gap-6 px-4 pb-10 pt-16 lg:grid-cols-3 lg:gap-4 lg:px-12 lg:py-10">
        {/* LEFT — chase scene */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="hidden flex-col items-start justify-center lg:flex">
          <ChaseScene merged={showMerged} />
          <p className="mt-4 max-w-xs text-sm text-white/50">A cat in a cardboard rocket, chasing pull requests through the void.</p>
        </motion.div>

        {/* CENTER */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[min(400px,92vw)] lg:hidden">
            <ChapterHeadingMobile n={2} title="The Chase" />
            <MobilePlanet color="#ff8c3c" />
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-[380px]">
            <SlideCard accentColor={ACCENT} chapter={2} title="The Chase" className="text-white">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flat.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${flat.username}`} alt={flat.username} className="h-10 w-10 rounded-full border"
                  style={{ borderColor: `${ACCENT}55` }} />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${ACCENT}70` }}>The Mouse Chase</div>
                  <div className="text-base font-bold text-white">@{flat.username}</div>
                </div>
              </motion.div>

              <div className="mt-3 space-y-3">
                {hasPRs ? (
                  <>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-white/60">Pull requests merged</span>
                        <div className="text-right">
                          <span className="text-xl font-bold text-white">{prsMerged}</span>
                          {prsOpened > 100 && (
                            <span className="ml-1.5 text-[11px] text-white/35">of {prsOpened} opened</span>
                          )}
                        </div>
                      </div>
                      {issuesOpened > 0 && (
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-sm text-white/60">Issues opened</span>
                          <span className="text-base font-semibold text-white/85">{issuesOpened}</span>
                        </div>
                      )}
                    </motion.div>

                    {flat.prRepos.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <div className="mb-1.5 text-xs uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>
                          Landed in {flat.prRepos.length} repo{flat.prRepos.length > 1 ? "s" : ""}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {flat.prRepos.slice(0, 4).map(r => (
                            <span key={r} className="rounded-full border px-2 py-0.5 text-[11px] font-mono text-orange-200"
                              style={{ borderColor: `${ACCENT}35`, background: `${ACCENT}10` }}>{r}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {flat.prTitles.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
                        className="rounded-xl px-3 py-2" style={{ border: `1px solid ${ACCENT}20`, background: `${ACCENT}08` }}>
                        <div className="text-[10px] uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>Notable PR</div>
                        <div className="mt-0.5 line-clamp-2 text-sm text-white/85">&ldquo;{flat.prTitles[0]}&rdquo;</div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    className="rounded-xl px-4 py-3" style={{ border: `1px solid ${ACCENT}22`, background: `${ACCENT}08` }}>
                    <div className="text-xs uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>Most active repository</div>
                    <div className="mt-1 font-mono text-base" style={{ color: ACCENT }}>{topRepo}</div>
                    {issuesOpened > 0 ? (
                      <div className="mt-2 text-[11px] leading-relaxed text-white/60">
                        {issuesOpened} issue{issuesOpened !== 1 ? "s" : ""} opened — the thinking happens before the PR.
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] leading-relaxed text-white/45">No pull requests this period — but the work still shipped. Here&apos;s the footprint.</div>
                    )}
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.92 }}>
                  <div className="mb-1.5 text-[10px] uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>Activity reach</div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl py-3"
                    style={{ border: `1px solid ${ACCENT}18`, background: `${ACCENT}06` }}>
                    {[
                      { label: "Commits", value: flat.totalCommits },
                      { label: "Repos touched", value: flat.reposTouched },
                      { label: "Active days", value: flat.activeDayCount },
                    ].map((s, i) => (
                      <div key={s.label} className="text-center" style={{ borderLeft: i > 0 ? `1px solid ${ACCENT}18` : undefined }}>
                        <div className="text-base font-bold tabular-nums text-white">{s.value.toLocaleString()}</div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-wider" style={{ color: `${ACCENT}60` }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
                  <div className="mb-1.5 text-[10px] uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>Open-source impact</div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl py-3"
                    style={{ border: `1px solid ${ACCENT}18`, background: `${ACCENT}06` }}>
                    {impactItems.map((s, i) => (
                      <div key={s.label} className="text-center" style={{ borderLeft: i > 0 ? `1px solid ${ACCENT}18` : undefined }}>
                        <div className="text-base font-bold tabular-nums text-white">{s.value.toLocaleString()}</div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-wider" style={{ color: `${ACCENT}60` }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {hasPRs && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
                    className="rounded-xl px-4 py-3" style={{ border: `1px solid ${ACCENT}22`, background: `${ACCENT}08` }}>
                    <div className="text-xs uppercase tracking-wider" style={{ color: `${ACCENT}65` }}>Most active repository</div>
                    <div className="mt-1 font-mono text-base" style={{ color: ACCENT }}>{topRepo}</div>
                  </motion.div>
                )}
              </div>
            </SlideCard>
          </motion.div>

          {/* mobile: animated scene below the card */}
          <div className="mt-6 w-[min(400px,92vw)] lg:hidden">
            <ChaseScene merged={showMerged} />
            <p className="mt-3 text-center text-xs text-white/45">A cat in a cardboard rocket, chasing pull requests through the void.</p>
          </div>
        </div>

        {/* RIGHT */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          className="relative hidden lg:block">
          <PlanetStage>
            <Planet />
          </PlanetStage>
        </motion.div>
      </div>
    </main>
  );
}
