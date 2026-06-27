import type { ComponentType } from "react";
import type { AiTone } from "@/types/wrapped";

export function GithubMark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
      <path d="M12 .5C5.73.5.99 5.24.99 11.51c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53 0-.26-.01-.95-.02-1.86-3.06.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.71-1.49-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.15-5.03 5.42.4.34.76 1.02.76 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.76.53 4.37-1.45 7.51-5.57 7.51-10.43C23.01 5.24 18.27.5 12 .5Z"/>
    </svg>
  );
}

export function LockIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function SmileIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c1 1.3 2.4 2 4 2s3-.7 4-2" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </svg>
  );
}

export function SkullIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11.5C5 7.4 8.1 4 12 4s7 3.4 7 7.5c0 2-1 3.7-2.4 4.8V18a1 1 0 0 1-1 1h-1.2v1.5a.8.8 0 0 1-.8.8h-3.2a.8.8 0 0 1-.8-.8V19H8.4a1 1 0 0 1-1-1v-1.7C6 15.2 5 13.5 5 11.5Z" />
      <circle cx="9.3" cy="11.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="11.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FlameIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-2-.9-3.5-2-4.8.2 1.4-.4 2.4-1.2 2.9.3-2.6-.7-5.3-3-6.9.6 2-.1 3.6-1.4 4.9C9.5 12.2 8.7 13.4 8.7 15c0 .7.1 1.3.4 1.9C7.7 16.1 7 14.9 7 13.5 5.7 15 5.5 17 6.4 18.6 5.7 19.7 5.5 20.4 5.5 21" />
    </svg>
  );
}

export function SoccerBallTiny({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.4}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l3.2 2.3-1.2 3.8h-4l-1.2-3.8z" fill="currentColor" stroke="none" />
      <path d="M12 7.5V4.3M15.2 9.8l3-1.8M13.8 13.6l1.9 2.8M10.2 13.6l-1.9 2.8M8.8 9.8l-3-1.8" />
    </svg>
  );
}

export const TONES: { label: string; value: AiTone; icon: ComponentType<{ size?: number }> }[] = [
  { label: "Funny",        value: "funny",        icon: SmileIcon },
  { label: "Brutal",       value: "brutal",       icon: SkullIcon },
  { label: "Motivational", value: "motivational", icon: FlameIcon },
];
