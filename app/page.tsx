"use client";

import { useState, useEffect } from "react";
import { HomeProvider } from "@/components/home/HomeContext";
import { DesktopHomePage } from "@/components/home/DesktopHomePage";
import { MobileHomePage } from "@/components/home/MobileHomePage";

function HomeContent() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile === null) {
    return <div style={{ minHeight: "100dvh", background: "oklch(0.10 0.025 280)" }} />;
  }

  return isMobile ? <MobileHomePage /> : <DesktopHomePage />;
}

export default function HomePage() {
  return (
    <HomeProvider>
      <HomeContent />
    </HomeProvider>
  );
}
