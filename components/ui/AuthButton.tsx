"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs text-zinc-600 animate-pulse w-32 h-7" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "avatar"}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span className="text-xs text-zinc-400">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="text-xs text-zinc-600 hover:text-zinc-400 ml-1 cursor-pointer transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] sm:px-5"
      style={{
        background: "linear-gradient(118deg,var(--violet-glow),color-mix(in oklab,var(--violet-glow) 65%,var(--commit-green)))",
        boxShadow: "0 4px 18px -4px color-mix(in oklab,var(--violet-glow) 60%,transparent), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      Connect GitHub
    </button>
  );
}
