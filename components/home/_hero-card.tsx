"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GithubMark, LockIcon, TONES } from "./_icons";
import { useHome } from "./HomeContext";
import { PERIODS } from "@/lib/hooks/useWrappedHome";
import type { PeriodType } from "@/lib/hooks/useWrappedHome";

const EASE = [0.32, 0.72, 0, 1] as const;
const pillBase = "rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium cursor-pointer transition-all duration-300 border";
const pillOff  = "bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300";
const pillOn   = "bg-violet-500/[0.15] border-violet-500/40 text-violet-300 shadow-[0_0_14px_-4px_rgba(139,92,246,0.5)]";

export function HeroCard() {
  const {
    session,
    sessionStatus,
    worldCup,
    isLoggedIn,
    sessionUsername,
    manualUsername,
    setManualUsername,
    periodType,
    setPeriodType,
    tone,
    setTone,
    loading,
    loadingMsg,
    error,
    usernameTouched,
    usernameValid,
    handleGenerate,
  } = useHome();

  return (
    <div className="relative z-10 mx-auto w-full max-w-xl px-5">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        className="relative flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-black/50 px-3 py-2 sm:px-5 sm:py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)]"
        style={{ backdropFilter: "blur(20px) saturate(1.6)" }}
      >
        <h1
          className="text-center text-[22px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[28px] bg-clip-text text-transparent"
          style={{
            backgroundImage: worldCup
              ? "linear-gradient(108deg, #f59e0b, #22c55e)"
              : "linear-gradient(108deg, var(--violet-glow), var(--commit-green))",
          }}
        >
          Unwrap your GitHub story
        </h1>
        <p className="text-center text-[12px] font-bold leading-snug text-zinc-200">
          Pick any period — week, month, year or all time. Get a cinematic recap of your commits, repos, languages and streaks.
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {sessionStatus === "loading" && (
            <motion.div key="auth-loading" layout
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="h-[42px] rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          )}

          {sessionStatus !== "loading" && !isLoggedIn && (
            <motion.div key="auth-out" layout
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col gap-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${usernameTouched && !usernameValid ? "text-red-400/70" : "text-zinc-600"}`}>
                    <GithubMark size={13} />
                  </span>
                  <input
                    type="text" value={manualUsername}
                    onChange={e => setManualUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleGenerate()}
                    placeholder="github username"
                    aria-invalid={usernameTouched && !usernameValid}
                    className={`w-full rounded-2xl border bg-black/50 py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-zinc-600 focus:bg-black/70 focus:outline-none transition-all duration-300 ${
                      usernameTouched && !usernameValid
                        ? "border-red-500/40 focus:border-red-500/60"
                        : "border-white/[0.1] focus:border-violet-500/40"
                    }`}
                    style={{ backdropFilter: "blur(16px)" }}
                  />
                </div>
                <button onClick={handleGenerate} disabled={loading || !manualUsername.trim() || !usernameValid}
                  className="group flex items-center gap-2 rounded-2xl px-5 py-2 text-[13px] font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(118deg,var(--violet-glow),color-mix(in oklab,var(--violet-glow) 65%,var(--commit-green)))",
                    boxShadow: "0 6px 24px -6px color-mix(in oklab,var(--violet-glow) 55%,transparent),inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  {loading ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : <>Generate →</>}
                </button>
              </div>
              {usernameTouched && !usernameValid && (
                <span className="pl-1 text-[10px] text-red-400/80">Only letters, numbers and hyphens — no spaces</span>
              )}
            </motion.div>
          )}

          {sessionStatus !== "loading" && isLoggedIn && (
            <motion.div key="auth-in" layout
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/[0.1] bg-black/30 px-3 py-2">
                {session?.user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt={sessionUsername} className="h-5 w-5 rounded-full" />
                )}
                <span className="text-[13px] text-white/70">@{sessionUsername}</span>
              </div>
              <button onClick={handleGenerate} disabled={loading || !sessionUsername}
                className="flex items-center gap-2 rounded-2xl px-5 py-2 text-[13px] font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
                style={{
                  background: "linear-gradient(118deg,var(--violet-glow),color-mix(in oklab,var(--violet-glow) 65%,var(--commit-green)))",
                  boxShadow: "0 6px 24px -6px color-mix(in oklab,var(--violet-glow) 55%,transparent),inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                {loading ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : <>Generate →</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && (
            <motion.p key="loading-msg"
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-violet-300/80">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--violet-glow)" }} />
              {loadingMsg}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-1">
          {PERIODS.map(({ label, value, requiresAuth }) => {
            const locked = requiresAuth && !isLoggedIn;
            return (
              <button key={value}
                onClick={() => !locked && setPeriodType(value as PeriodType)}
                title={locked ? "Connect GitHub to unlock All time" : undefined}
                className={`${pillBase} inline-flex items-center justify-center gap-1 ${!locked && periodType === value ? pillOn : ""} ${locked ? "opacity-35 cursor-not-allowed" : !locked && periodType !== value ? pillOff : ""}`}>
                {label}{locked && <LockIcon size={10} />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">AI tone</span>
          {TONES.map(({ label, value, icon: Icon }) => (
            <button key={value} onClick={() => setTone(value)}
              className={`${pillBase} inline-flex items-center gap-1.5 ${tone === value ? pillOn : pillOff}`}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center text-[11px] text-red-400/90">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
