"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

function authCallbackUrl() {
  if (typeof window === "undefined") return "/";
  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  return `${window.location.origin}${window.location.pathname}`;
}

// GitHub keeps only one logged-in account per browser (no Google-style account
// picker), so the only way to let someone connect a different account is to sign
// them out here, then send them to GitHub's own logout page to switch identities.
function switchAccount() {
  signOut({ redirect: false });
  window.open("https://github.com/logout", "_blank", "noopener,noreferrer");
}

const fade = {
  initial: { opacity: 0, y: 3 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -3 },
  transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
};

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 12V10a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 12v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function AccountMenu({ name, image }: { name: string; image?: string | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group flex cursor-pointer items-center gap-2 rounded-full border py-1 pl-1.5 pr-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.97] ${
          open
            ? "border-violet-300/55 bg-violet-500/[0.14]"
            : "border-white/[0.14] bg-black/40 hover:border-violet-300/40 hover:bg-violet-500/[0.08]"
        }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        {image && (
          <Image src={image} alt={name} width={22} height={22}
            className="rounded-full ring-1 ring-white/15" />
        )}
        <span className="text-[12px] font-medium text-zinc-200 group-hover:text-white">{name}</span>
        <span className={`text-violet-300/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#13091fcc] p-1.5 shadow-[0_24px_60px_-12px_rgba(168,85,247,0.45),0_0_0_1px_rgba(255,255,255,0.04)]"
            style={{ backdropFilter: "blur(24px) saturate(1.6)" }}
          >
            <button
              role="menuitem"
              onClick={() => { setOpen(false); switchAccount(); }}
              className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-medium text-zinc-300 transition-colors hover:bg-violet-500/[0.16] hover:text-white"
            >
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25 group-hover:text-violet-200">
                <SwitchIcon />
              </span>
              Switch account
            </button>
            <div className="mx-2 my-1 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <button
              role="menuitem"
              onClick={() => { setOpen(false); signOut({ redirect: false }); }}
              className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-medium text-zinc-300 transition-colors hover:bg-red-500/[0.14] hover:text-white"
            >
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-white/[0.06] text-zinc-400 transition-colors group-hover:bg-red-500/20 group-hover:text-red-300">
                <LogoutIcon />
              </span>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuthButton() {
  const { data: session, status } = useSession();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "loading" && (
        <motion.div key="loading" {...fade}
          className="border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs text-zinc-600 animate-pulse w-32 h-7" />
      )}

      {status === "authenticated" && session?.user && (
        <motion.div key="authenticated" {...fade}>
          <AccountMenu name={session.user.name ?? "Account"} image={session.user.image} />
        </motion.div>
      )}

      {status === "unauthenticated" && (
        <motion.div key="unauthenticated" {...fade} className="group relative">
          <motion.button
            onClick={() => signIn("github", { callbackUrl: authCallbackUrl() })}
            className="cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] sm:px-5"
            style={{
              background: "linear-gradient(118deg,var(--violet-glow),color-mix(in oklab,var(--violet-glow) 65%,var(--commit-green)))",
              boxShadow: "0 4px 18px -4px color-mix(in oklab,var(--violet-glow) 60%,transparent), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            Connect GitHub
          </motion.button>
          <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[9px] font-medium text-white/55 opacity-0 whitespace-nowrap transition-opacity duration-150 group-hover:opacity-100" style={{ backdropFilter: "blur(8px)" }}>
            Unlock All time stats
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
