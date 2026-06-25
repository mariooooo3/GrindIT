"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Isolates a single slide's render. Without this, an exception thrown by any
// slide unmounts the entire wrapped experience — React tears the tree down to a
// blank white screen and the user loses their session (P1-9). Here the failure
// is contained: the broken slide shows a small fallback while the nav chrome
// stays mounted, so the user can swipe/arrow past it. The boundary is remounted
// per slide (the parent motion.div is keyed by slide id), so it resets on
// navigation and never poisons the following slides.
export class SlideErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[slide] render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-[13px] font-medium text-white/70">This slide couldn&rsquo;t load</p>
          <p className="text-[11px] text-zinc-500">Swipe or use the arrows to keep going.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SlideErrorBoundary;
