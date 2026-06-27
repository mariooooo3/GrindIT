"use client";

import React from "react";

type SlideCardProps = {
  accentColor: string;
  className?: string;
  sizeStyle?: { width?: string; height?: string };
  children: React.ReactNode;
};

/**
 * Shared visual shell for all original-theme slide cards.
 * Adds: dark rich background, colored border + glow, top/bottom accent bars,
 * and an ambient glow blob. The chapter/title heading is rendered separately
 * by ChapterHeadingAnchor / ChapterHeadingMobile, outside the card.
 * Content scrolls inside the card.
 */
export const SlideCard = React.forwardRef<HTMLDivElement, SlideCardProps>(
  function SlideCard({ accentColor, className = "", sizeStyle, children }, ref) {
    return (
      <div
        ref={ref}
        data-share-card
        data-accent={accentColor}
        className={`relative flex flex-col overflow-hidden rounded-3xl [&::-webkit-scrollbar]:hidden mx-auto w-[min(380px,95vw)] h-[calc(100dvh-160px)] lg:w-[min(380px,92vw)] lg:h-[min(580px,84vh)] ${className}`}
        style={{
          ...(sizeStyle?.width  && { width:  sizeStyle.width }),
          ...(sizeStyle?.height && { height: sizeStyle.height }),
          background: "rgba(7, 4, 22, 0.95)",
          backdropFilter: "blur(28px) saturate(1.8)",
          WebkitBackdropFilter: "blur(28px) saturate(1.8)",
          border: `1px solid ${accentColor}2e`,
          boxShadow: `0 28px 70px -16px ${accentColor}4a, 0 0 0 1px ${accentColor}26, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* top accent bar */}
        <div
          className="absolute left-0 right-0 top-0 z-10 h-[3px] flex-shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        />

        {/* ambient glow blob — visible in card screenshots */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full"
          style={{ background: `${accentColor}22`, filter: "blur(52px)" }}
        />

        {/* scrollable content area */}
        <div className="relative flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-5 pb-5 pt-5">
          {children}
        </div>

        {/* bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] flex-shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)`,
          }}
        />
      </div>
    );
  },
);
