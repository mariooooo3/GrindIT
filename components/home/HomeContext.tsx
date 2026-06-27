"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWrappedHome, type WrappedHomeState } from "@/lib/hooks/useWrappedHome";

const HomeCtx = createContext<WrappedHomeState | null>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const value = useWrappedHome();
  return <HomeCtx.Provider value={value}>{children}</HomeCtx.Provider>;
}

export function useHome() {
  const ctx = useContext(HomeCtx);
  if (!ctx) throw new Error("useHome must be used within HomeProvider");
  return ctx;
}
