"use client";

import { useSyncExternalStore } from "react";
import Landing from "@/components/pawcup/Landing";
import Slide0 from "@/components/pawcup/Slide0";
import Slide1 from "@/components/pawcup/Slide1";
import Slide2 from "@/components/pawcup/Slide2";
import Slide3 from "@/components/pawcup/Slide3";
import Slide4 from "@/components/pawcup/Slide4";
import Slide5 from "@/components/pawcup/Slide5";
import Slide6 from "@/components/pawcup/Slide6";
import Slide7 from "@/components/pawcup/Slide7";
import Slide8 from "@/components/pawcup/Slide8";
import WorldCupChapterHeading from "@/components/pawcup/WorldCupChapterHeading";
import type { WrappedProfile } from "@/types/wrapped";

const DECORATIVE_SLIDES = [Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7] as const;

function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return mounted ? children : null;
}

export function WorldCupLanding({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <ClientOnly>
      <Landing isLoggedIn={isLoggedIn} />
    </ClientOnly>
  );
}

export function WorldCupSlide({ index, profile, wcSpeech, wcSpeechLoading }: {
  index: number;
  profile?: WrappedProfile;
  wcSpeech?: string | null;
  wcSpeechLoading?: boolean;
}) {
  // Slide 8 (bonus) is personalized and needs the profile
  if (index === 8) {
    return (
      <ClientOnly>
        <div className="relative h-full w-full">
          <Slide8 profile={profile} speech={wcSpeech ?? null} speechLoading={wcSpeechLoading ?? false} />
          <WorldCupChapterHeading index={index} />
        </div>
      </ClientOnly>
    );
  }
  // Slide 7 (share) personalizes the newspaper with the user's share caption
  if (index === 7) {
    return (
      <ClientOnly>
        <div className="relative h-full w-full">
          <Slide7 profile={profile} />
          <WorldCupChapterHeading index={index} />
        </div>
      </ClientOnly>
    );
  }
  // Slide 0 (opening) personalizes the opening tagline with the user's intro line
  if (index === 0) {
    return (
      <ClientOnly>
        <div className="relative h-full w-full">
          <Slide0 profile={profile} />
          <WorldCupChapterHeading index={index} />
        </div>
      </ClientOnly>
    );
  }
  const Slide = DECORATIVE_SLIDES[index] ?? Slide0;
  return (
    <ClientOnly>
      <div className="relative h-full w-full">
        <Slide />
        <WorldCupChapterHeading index={index} />
      </div>
    </ClientOnly>
  );
}
