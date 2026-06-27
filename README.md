# GrindIT — GitHub Wrapped

> **All Rights Reserved.** This project is proprietary and confidential. Access, use, modification, or distribution — in whole or in part — is strictly prohibited without explicit written permission from the author. Only the project owner and explicitly authorized collaborators may contribute to this codebase.

GrindIT turns a GitHub profile into a shareable developer recap. It pulls GitHub activity, calculates developer metrics, assigns an archetype, optionally generates an AI narrative, and presents the result as a sequence of animated slides — shareable as images or social posts.

---

## Table of Contents

- [Stack](#stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Architecture & Data Flow](#architecture--data-flow)
- [Theme System](#theme-system)
- [Slides](#slides)
- [Share System](#share-system)
- [Key Types](#key-types)
- [Known Issues](#known-issues)
- [Working on Tasks](#working-on-tasks)
- [Deploy](#deploy)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before touching routing or APIs |
| UI | **React 19** + **TypeScript** |
| Styling | **Tailwind CSS v4** (PostCSS-based, no config file — utility classes only) |
| Animation | **Framer Motion 12** |
| Auth | **NextAuth v4** — GitHub OAuth |
| AI narrative | **Groq** (`llama3-70b-8192`) — optional, graceful fallback if key missing |
| Screenshots | **modern-screenshot** (DOM → PNG, client-side) |
| Analytics | **Vercel Analytics** + **Speed Insights** |
| Tests | **Vitest** — 3 test files, 21 tests |

> **Note on Next.js 16:** this version has breaking changes vs. what most training data covers. APIs, file conventions, and middleware may differ. Read the bundled docs before writing any routing or server-side code.

---

## Project Structure

```
app/
  page.tsx                  # Landing page (input form, theme switch, auth)
  layout.tsx                # Root layout (providers, fonts, analytics)
  globals.css               # Global styles + Tailwind imports
  opengraph-image.tsx       # OG image for social previews
  HeroScene.tsx             # Landing 3-D/animated hero background
  wrapped/[username]/
    page.tsx                # Slideshow container (navigation, loading, top-bar)
  api/
    github/route.ts         # Fetches raw GitHub data → GitHubRawData
    analyze/route.ts        # Runs analyzer → WrappedProfile
    narrative/route.ts      # Groq AI narrative generation
    auth/[...nextauth]/     # NextAuth GitHub OAuth handler
    wc-prize/route.ts       # World Cup prize logic

components/
  slides/                   # Default (space/violet) theme slides
    SlideIntro.tsx          # Slide 1 — username + archetype intro
    SlideContributions.tsx  # Slide 2 — commit chart
    SlideLanguages.tsx      # Slide 3 — language breakdown
    SlideTopRepo.tsx        # Slide 4 — top repository
    SlideJourney.tsx        # Slide 5 — timeline / journey
    SlideAchievements.tsx   # Slide 6 — achievements / trophies
    SlideArchetype.tsx      # Slide 7 — developer archetype (clickable badges ✓)
    SlideShare.tsx          # Slide 8 — share card + stat boxes + badges
  pawcup/                   # World Cup theme slides (SEPARATE file tree)
    Landing.tsx             # World Cup landing overlay
    Slide0.tsx … Slide8.tsx # World Cup equivalents of the 8 default slides
    WorldCupTheme.tsx       # Theme wrapper / background
    WorldCupChapterHeading.tsx
  ui/
    ShareModal.tsx          # Share modal (Save / Copy / X / LinkedIn) — BOTH themes
    MobileGate.tsx          # Mobile detection; forces landscape or shows overlay
    PlanetProgress.tsx      # Slide progress bar (planet dots, clickable)
    SlideCard.tsx           # Shared visual card shell (data-share-card attr)
    SlideWatermark.tsx      # GrindIT watermark on exported cards
    AuthButton.tsx          # GitHub sign-in button
    ChapterHeading.tsx      # Slide section headings
    SlideErrorBoundary.tsx  # Error boundary per slide

lib/
  github.ts                 # GitHub REST API client — fetches raw activity
  analyzer.ts               # Core metric calculator (runs server-side in /api/analyze)
  archetypes.ts             # Archetype assignment logic
  badges.ts                 # Badge/trophy definitions (label, icon, explanation)
  insights.ts               # Narrative insight generators
  themes.ts                 # Theme color palettes
  theme-context.tsx         # React context for active theme (default / World Cup)
  groq.ts                   # Groq API client for narrative generation
  fallbackNarrative.ts      # Static fallback if Groq is unavailable
  captureElement.ts         # DOM → PNG screenshot helpers (captureElement, captureDesktopElement)
  datetime.ts               # Date utility helpers
  validation.ts             # Input validation (username, period, tone)
  rate-limit.ts             # Simple in-memory rate limiter for API routes
  wc-award.tsx              # World Cup award logic

types/
  wrapped.ts                # All TypeScript types (WrappedProfile, SlideId, etc.)
  next-auth.d.ts            # NextAuth session augmentation

public/                     # Static assets (logos, flags, images)
supabase/schema.sql         # Historical reference only — Supabase removed from runtime
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.local.example .env.local
# Then fill in the values — see Environment Variables below

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Run tests
npm test

# 5. Lint check
npm run lint
```

> **Port:** the dev server uses port 3000 by default. If `EADDRINUSE` appears, another process is using it — find and stop it with `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux), then kill it.

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `GITHUB_CLIENT_ID` | Yes (for OAuth) | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes (for OAuth) | GitHub OAuth App client secret |
| `NEXTAUTH_SECRET` | Yes | Random string — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full URL of the app, e.g. `http://localhost:3000` |
| `GROQ_API_KEY` | No | Enables AI narrative generation. App works without it. |
| `NEXT_PUBLIC_APP_URL` | No | Public base URL used in share captions. Falls back to `window.location.origin`. |

**GitHub OAuth App setup:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret into `.env.local`

> Public GitHub data (commits, languages, repos) works **without OAuth login**. OAuth is only needed for private repos and contribution history behind authentication.

---

## Architecture & Data Flow

```
User types username on landing page
         │
         ▼
  app/page.tsx — handleGenerate()
         │
         ├─→ GET /api/github?username=X&period=Y
         │         lib/github.ts fetches GitHub REST API
         │         Returns: GitHubRawData
         │
         ├─→ POST /api/analyze  { raw: GitHubRawData, ... }
         │         lib/analyzer.ts runs calculations
         │         lib/archetypes.ts assigns developer archetype
         │         lib/badges.ts assigns badges/trophies
         │         lib/insights.ts generates text insights
         │         Returns: WrappedProfile (the central data object)
         │
         ├─→ sessionStorage.setItem("wrappedProfile", JSON.stringify(profile))
         │
         └─→ router.push("/wrapped/<username>")
                   │
                   ▼
         app/wrapped/[username]/page.tsx
                   │
                   ├─ Reads WrappedProfile from sessionStorage
                   ├─ Renders slide sequence (default or World Cup depending on theme)
                   ├─ Optional: POST /api/narrative → Groq AI narrative (runs in background)
                   └─ Share button → ShareModal.tsx
```

**Key constraint:** `WrappedProfile` is passed entirely through `sessionStorage`. There is no database persistence in the current runtime — each session is ephemeral. If the user refreshes on `/wrapped/X`, the profile reloads from `sessionStorage` (or shows an error if gone).

---

## Theme System

There are **two completely separate slide families**:

| | Default theme | World Cup theme |
|---|---|---|
| Palette | Violet / space / dark | Amber / green / stadium |
| Slides | `components/slides/*.tsx` | `components/pawcup/*.tsx` |
| Toggled by | `ThemeSwitch` on landing | `ThemeSwitch` on landing |
| Context | `lib/theme-context.tsx` | same context, different value |

**Important:** the two slide families share **no files**. A change in `components/slides/SlideShare.tsx` does **not** affect `components/pawcup/Slide8.tsx` or vice versa. When implementing any feature that touches slide content, check both directories.

Components that are **shared across both themes** (single file, covers both):
- `components/ui/ShareModal.tsx` — handles `isWorldCup` flag internally
- `app/wrapped/[username]/page.tsx` — the container (top-bar, loading, navigation)
- `components/ui/PlanetProgress.tsx` — progress bar
- `components/ui/MobileGate.tsx` — mobile detection

**Reading the theme in a component:**
```tsx
import { useTheme } from "@/lib/theme-context";
const { theme } = useTheme();
const isWorldCup = theme === "worldcup";
```

---

## Slides

### Default theme — slide order

| # | `SlideId` | File | Content |
|---|---|---|---|
| 1 | `intro` | `SlideIntro.tsx` | Username, avatar, archetype title |
| 2 | `contributions` | `SlideContributions.tsx` | Commit activity heatmap |
| 3 | `languages` | `SlideLanguages.tsx` | Language breakdown chart |
| 4 | `top_repo` | `SlideTopRepo.tsx` | Top repository stats |
| 5 | `journey` | `SlideJourney.tsx` | Timeline / milestones |
| 6 | `achievements` | `SlideAchievements.tsx` | Trophies and badges |
| 7 | `archetype` | `SlideArchetype.tsx` | Developer archetype + clickable trait badges |
| 8 | `share` | `SlideShare.tsx` | Final card — stat boxes, badges, share CTA |

Navigation: keyboard arrows, swipe (touch), or clicking planets in `PlanetProgress`.

### World Cup theme

`components/pawcup/Slide0.tsx` through `Slide8.tsx` — same logical flow, different visual design. `WorldCupTheme.tsx` wraps the background and stadium assets.

### `SlideCard` and screenshots

Every slide is wrapped in `<SlideCard>` which sets `data-share-card` on the root element. `captureElement` in `lib/captureElement.ts` targets this attribute when generating the PNG for download/share. **Do not add `pointer-events` or interactivity to the element with `data-share-card`** — it is what gets captured.

---

## Share System

`components/ui/ShareModal.tsx` handles four actions:

| Action | Behaviour |
|---|---|
| **Save** | Downloads PNG via `captureElement` / `captureDesktopElement` |
| **Copy** | Copies PNG to clipboard |
| **Post on X** | Opens `twitter.com/intent/tweet` with caption |
| **LinkedIn** | Opens LinkedIn share with caption |

Caption is built from `username`, `isWorldCup`, and optionally `NEXT_PUBLIC_APP_URL` (for the recap link).

`captureElement` is client-side only (uses `modern-screenshot`). It targets `[data-share-card]`. On mobile (<1024px wide) `captureDesktopElement` is used instead (scales the card first).

---

## Key Types

All types live in `types/wrapped.ts`.

```ts
WrappedProfile        // Root object stored in sessionStorage — everything the slides need
  .user               // GitHubUser — login, avatar, name, bio
  .period             // "last_year" | "this_year" | "all_time"
  .raw                // GitHubRawData — commits, repos, languages, PRs, etc.
  .metrics            // CalculatedMetrics — streak, totalCommits, linesAdded, etc.
  .achievements       // Achievement[] — earned trophies
  .archetypeBlend     // ArchetypeBlend — primary + secondary archetypes with scores
  .insights           // string[] — generated text snippets
  .theme              // ThemeId — "default" | "worldcup"
  .tone               // NarrativeTone — "roast" | "hype" | "poetic"
  .narrative          // NarrativeOutput | null — AI-generated copy (async, may be null)

SlideId               // "intro" | "contributions" | "languages" | "top_repo"
                      //   | "journey" | "achievements" | "archetype" | "share"

TraitBadge            // { id, label, icon, explanation } — used in badges.ts
Achievement           // { id, label, icon, description, rarity }
```

---

## Known Issues

These issues exist in the codebase **before any new changes** (confirmed on HEAD). They are documented in `TASKS.md` section B.

### Lint errors (6 — pre-existing)

`npm run lint` reports 13 problems (6 errors, 7 warnings) on a clean checkout. Do **not** introduce new errors when working on tasks.

| File:line | Rule | Issue |
|---|---|---|
| `lib/theme-context.tsx:53` | `react-hooks/set-state-in-effect` | `setReady(true)` directly in `useEffect` |
| `components/ui/MobileGate.tsx:156` | `react-hooks/set-state-in-effect` | `setState("desktop")` in effect |
| `components/ui/ShareModal.tsx:73` | `react-hooks/set-state-in-effect` | `setMounted(true)` in effect |
| `components/pawcup/Slide0.tsx:40` | `react-hooks/set-state-in-effect` | `setDisplayedText("")` in effect |
| `components/slides/SlideIntro.tsx:292` | `react-hooks/set-state-in-effect` | `setDisplayedText("")` in effect |
| `app/wrapped/[username]/page.tsx:269` | `react-hooks/refs` | `profileRef.current = profile` during render |

These come from new strict rules in React 19 / Next 16. Fixing them requires care (some touch hydration or orientation logic). They are tracked separately in `TASKS.md` as items B1.

---

## Working on Tasks

All planned tasks are in **`TASKS.md`** at the repo root. Read it fully before starting — it contains file paths, exact line numbers, what to touch, and what **not** to touch for each item.

### Ground rules

1. **One task at a time.** Implement → verify visually in the browser → commit. Do not batch multiple tasks into one commit.
2. **Visual verification is mandatory.** Lint passing and tests passing are not enough — check what actually renders in the browser before marking something done.
3. **Check both themes.** For any change that touches slide content, verify in both the default (violet) and World Cup (amber) themes. For shared UI components (`ShareModal`, top-bar, loading), one fix covers both — but still test both.
4. **Separate commits per task.** Each item in TASKS.md = one commit with a clear message.
5. **Do not touch the lint errors (B1)** while working on quick wins — they are pre-existing and need separate, careful treatment.

### How to verify each task

- **Landing page tasks (item 3 loading, item 6 CTA):** visible immediately at `http://localhost:3000` — no GitHub profile needed.
- **Slideshow tasks (item 2 logo, item 3 slides loading, item 4 badges):** need a generated profile. Enter any real GitHub username (e.g. `torvalds`) with period `last_year`, click Generate, wait for redirect to `/wrapped/torvalds`.
- **Share tasks (item 1 contrast, item 5 recap link):** need a generated profile → click the Share button (bottom-right of the last slide).

### Quick orientation: where things are

| What you want to change | File |
|---|---|
| Landing page (CTA, loading state, theme switch) | `app/page.tsx` |
| Slideshow container (top-bar logo, loading screen, navigation) | `app/wrapped/[username]/page.tsx` |
| Share modal (buttons, caption, contrast) | `components/ui/ShareModal.tsx` |
| Default theme slides | `components/slides/Slide*.tsx` |
| World Cup theme slides | `components/pawcup/Slide*.tsx` |
| Badge definitions (label, icon, explanation) | `lib/badges.ts` |
| Progress dots / slide nav | `components/ui/PlanetProgress.tsx` |
| PNG screenshot capture | `lib/captureElement.ts` |
| All TypeScript types | `types/wrapped.ts` |
| Theme context (read active theme) | `lib/theme-context.tsx` |

---

## Deploy

See `DEPLOY.md` for the full Vercel + GitHub OAuth production setup.

Short version:
1. Create a GitHub OAuth App with your production domain as callback URL.
2. Push to GitHub → import repo in Vercel → add all env vars → deploy.
3. Set `NEXT_PUBLIC_APP_URL` in Vercel env vars (used in share captions).
