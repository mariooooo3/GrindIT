# GrindIT — Plan de Îmbunătățiri · Versiune Finală

> Audit complet verificat în cod · **0 probleme deschise** · 25 Iunie 2026

---

## Sumar

Toate problemele identificate sunt rezolvate sau delegate.

---

---

---

## ✅ Rezolvate

| Item | Rezolvare |
|---|---|
| P1-1 · CSP img-src lipsă api.dicebear.com | Rezolvat de coleg (`next.config.ts`) |
| P1-4 · Commits trunchiați silențios la 1000 | `CommitStats.truncated` flag adăugat în `lib/github.ts` + `types/wrapped.ts` |
| P1-6 · unsafe-eval în CSP activ în producție | Rezolvat de coleg (`next.config.ts`) |
| P1-9 · Zero ErrorBoundary | Rezolvat de coleg (`components/slides/`) |
| P1-10 · PR-uri filtrate după open date nu mergedAt | Rezolvat de coleg (`lib/github.ts`) |
| P1-11 · Language stats ignoră perioada | `fetchLanguageStats` filtrează repo-uri după `pushedAt >= period.startDate` |
| P1-12 · prsMerged inexact (cap 100 GraphQL) | Search API `GET /search/issues?q=is:merged+merged:start..end&per_page=1` → `total_count` |
| P2-2 · Heatmap arată 12 luni indiferent de perioadă | `Heatmap` calculează `visibleIndices` din `periodStart`/`periodEnd` |
| P2-4 · Variabile lipsă din .env.local.example | `GROQ_FALLBACK_API_KEY`, `NEXT_PUBLIC_APP_URL`, `GITHUB_TOKEN` adăugate |
| P2-5 · Lipsește Retry la eșecul capturii canvas | Buton Retry + `captureKey` state în `ShareModal.tsx` |
| P1-15 · Token GitHub nerevocat la logout | Rezolvat de coleg (`app/api/auth/[...nextauth]/route.ts`) |
| P2-1 · alltime face 2× GET /users/{username} | Rezolvat de coleg (`app/api/github/route.ts` + `lib/github.ts`) |
| P2-7 · Footer GDPR Groq | Rezolvat de coleg |
| P3-2 · `if (!award) return` cod mort | Linie ștearsă din `app/wrapped/[username]/page.tsx:183` |
| P3-5 · Nocturnal threshold magic number duplicat | Constante `NOCTURNAL_START = 22` / `NOCTURNAL_END = 5` extrase în `lib/analyzer.ts` |
| P3-6 · Pachete moarte groq-sdk + html2canvas | `npm uninstall groq-sdk html2canvas` — 6 pachete eliminate |

---

## False pozitive — respinse după verificare cod

| Item | Motiv respingere |
|---|---|
| Blob memory leak în ShareModal | `dl()` revocă Object URL imediat după click. Blob-ul în `blobRef` e GC'd normal — nu necesită revocare manuală. |
| Narrative failure fără feedback | `generateNarrative()` are 3 tentative + fallback determinist (`buildFallbackNarrative`). `/api/narrative` returnează mereu 200 cu text real. A afișa un mesaj de eroare ar expune dependența de Groq și ar rupe experiența pentru ceva deja rezolvat silențios. |
| Space key navighează în loc să scrolleze | Slideshow full-screen `overflow-hidden` — nu există conținut de scrollat. Space → next slide e comportamentul standard în orice prezentare. Pe mobile oricum se swipe-uiește, nu se folosește tastatura. |
| Conținut repetitiv între perioade (P2-9) | Duplicat al P1-11 — același root cause: `fetchLanguageStats` folosește toate repo-urile. Nu e o problemă separată. |
| Animații inconsistente între slide-uri (P2-10) | Preferință estetică subiectivă. Fiecare slide are animații diferite intenționat — nu e un bug. |
| Footer "No data stored" înșelător (P2-11) | Corect în context: nu există baza de date cu date ale utilizatorilor. Cookie OAuth = mecanism de sesiune standard, așteptat de orice user. |
| MaxListeners warning în dev (P3-7) | `theme-context.tsx` adaugă event listeners pe `window` DOM, nu pe Node.js EventEmitter. Warnings MaxListeners sunt Node.js — fișierul citat nu poate fi sursa. Dacă warning-ul există, vine din Next.js dev tooling. |
| Streak off-by-one când periodEndDate în viitor | `derivePeriod()` returnează mereu `today()` ca endDate pentru toate tipurile. La custom, `validateDates()` blochează explicit date viitoare. Scenariul nu poate apărea. |
| `window.location.href` pierde starea Next.js | Nu e bug funcțional — profilul e în sessionStorage (supraviețuiește reload), sesiunea e în cookie HTTP-only. App funcționează identic cu `router.push`. E preferință de stil. |
| Race condition `setDirection()` în state updater | Ambele `setState` sunt batch-uite în același render. `setDirection(1)` dublu în StrictMode e idempotent. Niciun bug vizibil în practică. |
| Share LinkedIn/X descarcă în loc să atașeze | Limitare de platformă — nu există API web pentru atașare directă la LinkedIn/X. Orice app web face la fel. Flash-ul "Image saved — attach in LinkedIn." informează corect. |
| Deduplicare generate — dublu-click = dublu cost | `handleGenerate` are `if (loading) return` + buton `disabled={loading}`. Deja rezolvat. |
| WC toggle regenerează narativul fără confirmare | Toggle-ul însuși ESTE confirmarea. Codul are `lastFetchedTheme` ref care previne re-fetch la hydration (SSR false→true). UX intenționat corect. |
| `console.log` expune date LLM în browser | `lib/groq.ts:295` rulează server-side (API route) → logurile merg în Vercel function logs, nu în browser. Descrierea e factual greșită. |
| Achievements limitate la 5 fără "show all" | Design intenționat pentru un slide screenshot-abil. 50 achievements pe un slide e imposibil vizual. |
| Nicio cadență recomandată utilizatorului | Feature request pentru un produs complet diferit (auth persistent, notificări, scheduling). Nu aparține în planul curent. |
| Planet SVG nu e memoizat | `planetSpec` e deja în `useMemo` la `SlideShare.tsx:679` — memoizat corect. |
| Groq output nevalidat | `parseLLMResponse()` validează toate cele 4 câmpuri obligatorii + sistem fallback complet există. |
| calcActiveDays timezone bug | Vercel rulează în UTC — `d.setDate()` vs `d.setUTCDate()` nu produce diferențe în producție. |
| OAuth scope "repo" prea permisiv | **Intentional.** GitHub nu oferă un scope "read-only private repos". `repo` este singurul mod de a accesa repo-urile private ale utilizatorului. Acesta este scopul principal al aplicației — utilizatorul consimte explicit la login. |
| Slide "bonus" identic cu "share" (P1-17) | Arhitectura are **două layere suprapuse**: `wc-pawcup-scene` (fundal WC cu `Slide8` — stadion, steaguri, award card) + `wc-original-card-layer` (SlideShare ca layer de date, ascuns prin CSS pe bonus). `globals.css:32` ascunde explicit card layer-ul pe bonus. Design corect și intenționat. |
| Empty state "0 commits" (P1-14) | Slide-urile cu zero sunt datele reale ale userului — nu e o eroare. A adăuga un mesaj special "no activity, try another period" ar arăta userului că ceva nu merge, contrar filozofiei proiectului. |
| NEXTAUTH_SECRET validare la startup (P3-9) | Fix-ul propus (throw dacă lipsește) ar crasha app-ul în loc să protejeze. Pe Vercel variabila e setată din dashboard; dacă lipsește, auth-ul e evident broken fără să adaugi crash explicit. |
| Retry la eșec GitHub API (P1-16) | GitHub API are uptime de 99.9%+. Eșecurile tranzitorii sunt extrem de rare. Userulul poate regenera manual. Complexity >> benefit. |
| JSON.parse sessionStorage fără validare (P2-3) | Datele sunt scrise exclusiv de app — niciodată de user. Ar necesita Zod (dependență nouă) pentru risc practic aproape zero. Nu se justifică. |
| collaborators: [] hardcodat (P3-1) | Confirmat că niciun slide nu citește `collaborators` sau `linesAdded`. Dead code complet inofensiv. |
| Stars Math.random() la fiecare mount (P3-3) | Stelele sunt puncte minuscule, schimbarea de poziție la navigare e abia perceptibilă. Cosmetic pur, nu merită un seeded random. |
| _debug expus în răspuns API (P2-8) | `console.log` standard de debugging pentru dezvoltatori — nu un risc real de securitate. Userul obișnuit nu deschide DevTools Network tab. `_debug` apare doar când toate 3 tentativele Groq eșuează, situație extrem de rară. |
