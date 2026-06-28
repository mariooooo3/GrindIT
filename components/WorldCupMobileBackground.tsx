"use client";

import { useState, useMemo } from "react";
import stadium from "@/components/pawcup/assets/stadium.asset.json";
import catMascot from "@/components/pawcup/assets/cat-mascot.asset.json";

type Star = { x: number; y: number; d: number };

export default function WorldCupMobileBackground() {
  const stars = useMemo<Star[]>(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 45,
      d: Math.random() * 3,
    })),
  []);

  const [confetti] = useState(() =>
    Array.from({ length: 55 }).map((_, i) => {
      const duration = 5 + Math.random() * 7;
      return {
        left: Math.random() * 100,
        duration,
        delay: -(Math.random() * duration),
        size: 5 + Math.random() * 7,
        color: ["#a855f7", "#facc15", "#22d3ee", "#f472b6", "#ffffff", "#34d399"][i % 6],
        shape: i % 3,
      };
    }),
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${stadium.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* purple vignette — same as original WC landing */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-transparent to-purple-950/60" />

      {/* twinkling stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2,
            height: 2,
            willChange: "opacity",
            animation: `wcmb-twinkle 2s ease-in-out ${s.d}s infinite`,
          }}
        />
      ))}

      {/* Spotlight under cat */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[5] pointer-events-none"
        style={{
          width: "min(500px, 140vw)",
          height: "300px",
          background: "radial-gradient(ellipse at center bottom, rgba(168,85,247,0.45), transparent 70%)",
        }}
      />

      {/* Cat mascot — centered, bottom, mobile-adapted */}
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-10"
        style={{ width: "min(75vw, 320px)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={catMascot.url}
          alt=""
          width={1024}
          height={1024}
          className="w-full h-auto object-contain drop-shadow-[0_20px_32px_rgba(168,85,247,0.5)]"
          draggable={false}
        />
      </div>

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden z-20" style={{ contain: "layout style paint" }}>
        {confetti.map((c, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${c.left}%`,
              top: "-16px",
              width: c.size,
              height: c.size * 0.4,
              background: c.color,
              borderRadius: c.shape === 0 ? "2px" : c.shape === 1 ? "50%" : "0",
              willChange: "transform, opacity",
              animation: `wcmb-confetti ${c.duration}s ${c.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes wcmb-twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes wcmb-confetti {
          0%   { transform: rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
