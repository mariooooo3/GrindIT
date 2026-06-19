"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "gh-wrapped-theme";
const THEME_EVENT = "gh-wrapped-theme-change";

type ThemeCtx = {
  worldCup: boolean;
  toggleWorldCup: () => void;
  /** True once the real client-side value (from localStorage) is known. */
  ready: boolean;
  /** True one frame after `ready` — gates opacity transitions so the very first
   * correct reveal is instant, never a fade from the wrong (SSR-default) theme. */
  animate: boolean;
};

const ThemeContext = createContext<ThemeCtx>({
  worldCup: false,
  toggleWorldCup: () => {},
  ready: true,
  animate: true,
});

export const useTheme = () => useContext(ThemeContext);

function getStoredWorldCup(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "worldcup";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const notify = () => callback();
  window.addEventListener(THEME_EVENT, notify);
  return () => {
    window.removeEventListener(THEME_EVENT, notify);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const worldCup = useSyncExternalStore(subscribe, getStoredWorldCup, () => false);
  const [ready, setReady] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Flip to the real client value as soon as hydration completes — before this,
  // consumers should render the theme-neutral state, never the SSR-default guess.
  useEffect(() => {
    setReady(true);
  }, []);

  // Enable opacity transitions only one frame after `ready`, so the first correct
  // reveal is an instant swap (no fade-in from the wrong theme). Later, user-initiated
  // toggles happen well after this and animate normally.
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  useEffect(() => {
    if (worldCup) {
      document.documentElement.style.setProperty("--slide-bg", "transparent");
      document.documentElement.classList.add("wc-theme");
    } else {
      document.documentElement.style.removeProperty("--slide-bg");
      document.documentElement.classList.remove("wc-theme");
    }
  }, [worldCup]);

  const toggleWorldCup = () => {
    const next = !worldCup;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next ? "worldcup" : "normal");
      window.dispatchEvent(new Event(THEME_EVENT));
    } catch {
      // Ignore storage failures and keep the current theme.
    }
  };

  return (
    <ThemeContext.Provider value={{ worldCup, toggleWorldCup, ready, animate }}>
      {children}
    </ThemeContext.Provider>
  );
}
