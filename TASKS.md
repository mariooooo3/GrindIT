# GrindIT — Plan de lucru

> Versiune curată · identică cu GitHub · HEAD = `7a350a0`
> Singura modificare necomisă: `.claude/settings.local.json` (pre-existentă, nu se atinge)

---

## Cuprins

- [A. Taskuri decise](#a-taskuri-decise)
  - [🔜 Mai târziu (mobile)](#-mai-târziu-mobile--păstrate-ca-idei)
  - [✅ De făcut acum (quick wins)](#-de-făcut-acum-quick-wins)
  - [🏗️ Features mari](#️-features-mari-separat-după-quick-wins)
- [B. Erori întâlnite](#b-erori-întâlnite-de-rezolvat-separat)
- [C. Cum lucrăm](#c-cum-lucrăm-ca-să-iasă-bine)

---

# A. Taskuri decise

---

## 🔜 Mai târziu (mobile — păstrate ca idei)

Toate cele de mai jos sunt legate de experiența pe telefon. Le ținem ca idei și le
atacăm după ce quick wins-urile sunt verificate. Motivul amânării: majoritatea
lumii folosește telefonul pentru site-uri de genul ăsta, dar partea de mobile
cere un redesign separat, nu doar mici ajustări.

### M1 · Portrait mobile nativ (înlocuire `PortraitOverlay`)

- **Fișier:** `components/ui/MobileGate.tsx`
- **Problema acum:** componenta `PortraitOverlay` blochează complet userii care țin
  telefonul în portret cu un ecran „Rotate your device / GrindIT works in landscape
  mode". Asta forțează o alegere care pierde userul foarte devreme.
- **Ce vrem:** layout portret nativ — card central pe ecran complet, o planetă /
  animație mică, butoanele de share vizibile dedesubt. Fără landscape forțat.
- **De luat în calcul:** logica de viewport (`applyLandscapeViewport`, scaling-ul după
  `DESKTOP_H`) e sensibilă; un fix greșit poate strica și landscape-ul care funcționează.
- **Verificare:** `preview_resize` preset `mobile` (375×812), portret → trebuie să se
  vadă cardul complet, fără overlay de rotire.

### M2 · Carousel vizibil / tap-friendly pe mobil

- **Fișier:** `components/ui/PlanetProgress.tsx`
- **Problema acum:** click-jump între slide-uri **funcționează deja** (planetele sunt
  butoane cu `onNavigate`), dar pe mobil planetele sunt de ~11px — practic invizibile
  și greu de atins.
- **Ce vrem:** tap target mai mare pe mobil + indicator numeric de slide (ex. „3 / 8"),
  ca să poți sări de la primul la ultimul fără să treci prin toate.
- **Verificare:** pe mobil, tap pe o planetă din mijloc → sare direct la slide-ul respectiv.

### M3 · Card 9:16 dedicat pentru mobil (stories)

- **Fișier:** `lib/captureElement.ts` (există deja `captureDesktopElement` folosit la <1024px)
- **Problema acum:** pe mobil se generează exact același card ca pe desktop (16:9 /
  layout desktop scalat). Nu arată bine pe Instagram/TikTok stories.
- **Ce vrem:** un layout de card portrait-first (9:16) pentru share-ul de pe mobil.
  Desktop rămâne neschimbat.
- **De luat în calcul:** posibil de generat cu `satori` / `@vercel/og` ca să fie consistent.

### M4 · World Cup theme simplificat pe portret

- **Fișier:** `components/pawcup/*`
- **Problema acum:** tema World Cup pe portret e problematică (stadion complet, steaguri etc.).
- **Ce vrem:** pe portret — un card central + o animație mică (mingea) + butoane share.
  Fără stadionul complet.
- **Dependență:** depinde de M1 (layout-ul portret de bază).

---

## ✅ De făcut acum (quick wins)

> Fiecare item = un commit separat. Implementăm **unul pe rând**, verificat vizual
> în browser înainte de a trece mai departe.

### 1 · Contrast butoane ShareModal

- **Fișier:** `components/ui/ShareModal.tsx`
- **Unde:** array-ul `ACTIONS` (liniile 28–33) + grid-ul de acțiuni (liniile ~325–343)
- **Teme & pagini acoperite:** `ShareModal` este un singur component folosit de **ambele teme**
  (default space/violet și World Cup amber/green). Caption-ul are deja două variante (`isWorldCup`).
  Un singur fix în `ShareModal.tsx` acoperă automat ambele teme — nu e nevoie de modificări
  separate în `components/pawcup/`.
- **Problema acum:** în grid icoanele au `color:"rgba(255,255,255,.45)"` și labelurile
  `rgba(255,255,255,.38)` — arată **dezactivate**, deși sunt funcționale (Save / Copy /
  Post on X / LinkedIn).
- **Ce facem:**
  - Ridicăm labelul la min `rgba(255,255,255,.75)` (+ `font-weight` mai mare).
  - Adăugăm un câmp `accent` în fiecare obiect din `ACTIONS`:
    - Save = violet `#a78bfa`
    - Copy = alb `#ffffff`
    - Post on X = albastru-deschis `#60a5fa`
    - LinkedIn = `#0a66c2`
  - Folosim `accent` pe cercul icoanei (tint subtil pe fundal + culoare plină pe icon + glow).
  - Pe hover, bordura butonului preia accentul.
- **Atenție:** starea reală `disabled` (când `busy === true`) trebuie să rămână clar
  diferită vizual de starea activă (păstrăm/întărim `disabled:opacity-*`).
- **Verificare:** test cu **ambele teme** → generat profil → buton Share → butoanele arată
  clar interactive, fiecare cu accentul lui.

### 2 · Logo → home în slideshow

- **Fișier:** `app/wrapped/[username]/page.tsx`
- **Unde:** logo-ul **vizibil** din top-bar (liniile ~358–362)
- **Teme & pagini acoperite:** top-bar-ul e în containerul principal `app/wrapped/[username]/page.tsx`,
  care este **comun ambelor teme**. Slide-urile World Cup (`components/pawcup/*`) și cele
  default (`components/slides/*`) sunt ambele randate în interiorul aceluiași container.
  Un singur fix acoperă tot — nu e nevoie de modificări separate per temă.
- **Problema acum:** logo-ul GrindIT din slideshow nu navighează nicăieri, iar `X`-ul de
  close e greu de observat — userii nu-și dau seama cum ies.
- **Ce facem:** logo-ul din top-bar devine clickable:
  - `onClick={() => router.push("/")}`
  - `role="button"`, `aria-label="Back to home"`
  - `cursor-pointer` + un mic feedback la hover/active (scale).
- **NU atingem:** al doilea `<img>` logo (liniile ~368–370) — ăla e doar pentru captura
  de screenshot și trebuie să rămână `pointer-events-none`.
- **Verificare:** test cu **ambele teme activate** → click pe logo → revine pe landing (`/`).

### 3 · Loading cu text funny

- **Fișiere:** `app/page.tsx` + `app/wrapped/[username]/page.tsx`
- **Unde (3 locuri):**
  1. **Landing page** — starea de așteptare după click pe „Generate" (`handleGenerate`), **înainte** de redirect
  2. **Slides page** — `LoadingScreen` (liniile ~105–120), afișat la intrarea pe `/wrapped/<user>`
  3. **Slides page** — indicatorul `narrativeLoading` (liniile ~423–430) cât se generează narativul Groq

- **Teme & pagini acoperite:**
  - **Landing** (`app/page.tsx`) — o singură pagină pentru ambele teme; `ThemeSwitch` e acolo,
    dar loading-ul (textul de sub buton în timp ce `handleGenerate` rulează) e același indiferent
    de temă. Un singur mesaj funny acoperă ambele.
  - **`LoadingScreen`** și **`narrativeLoading`** din `app/wrapped/[username]/page.tsx` —
    containerul e comun ambelor teme. Un singur fix acoperă și World Cup și default.
  - ⚠️ **De verificat:** dacă în tema World Cup există un ecran de loading separat sau o
    `LoadingScreen` proprie în `components/pawcup/` — dacă există, trebuie și aceea actualizată.
    Căutăm cu `grep -r "LoadingScreen\|isLoading\|narrativeLoading" components/pawcup/` înainte de fix.

- **Problema acum (actualizat):**
  - Pe **landing**: nu apare **nimic** vizibil cât durează `fetch /api/github` + `fetch /api/analyze`.
    Userul stă pe landing și privește cum nu se întâmplă nimic, fără niciun feedback că
    cererea merge. Nu e un text generic — e complet absent.
  - Pe **slides** `LoadingScreen`: textul e generic.
  - Pe **slides** `narrativeLoading`: la fel, generic.

- **Ce facem:**
  - **Landing** — când `isLoading === true` (sau echivalentul), afișăm un mesaj funny vizibil
    sub buton / în locul butonului, ales aleator la click-ul pe Generate:
    ex. „Fetching your commit history…", „Judging your 3am pushes…",
    „Converting coffee into TypeScript…", „Running git blame on you…",
    „Consulting the commit oracle…", „Parsing your README lies…".
  - **Slides `LoadingScreen`** — același array, ales aleator la mount.
  - **`narrativeLoading` pill** — al doilea mesaj din array sau un mesaj scurt rotativ.
  - Alegerea random se face **o singură dată** (`useState(() => pick(messages))`), nu la
    fiecare re-render, ca să nu pâlpâie.

- **Atenție:** loading-ul de pe landing trebuie să dispară la redirect; dacă redirecționarea
  eșuează, afișezi eroarea existentă (nu lăsa `isLoading` blocat).
- **Verificare:** click Generate → apare imediat mesaj funny pe landing → redirect →
  mesaj funny și pe `LoadingScreen`.

### 4 · Elemente clickable — audit complet + badge-uri cu descriere

- **Fișiere — tema default:**
  `components/slides/SlideShare.tsx`, `components/slides/SlideAchievements.tsx`,
  `components/slides/SlideArchetype.tsx`, `components/slides/SlideTopRepo.tsx`,
  `components/slides/SlideIntro.tsx`, `components/slides/SlideLanguages.tsx`,
  `components/slides/SlideContributions.tsx`, `components/slides/SlideJourney.tsx`
- **Fișiere — tema World Cup (audit separat, obligatoriu):**
  `components/pawcup/Slide0.tsx`, `components/pawcup/Slide1.tsx`, `components/pawcup/Slide2.tsx`,
  `components/pawcup/Slide3.tsx`, `components/pawcup/Slide4.tsx`, `components/pawcup/Slide5.tsx`
  (și orice alt `Slide*.tsx` din `components/pawcup/`)
- **Unde:** stat-boxes (commits/lines/PRs/repos, ~816–829) + badge-uri (`SlideShare.tsx` ~807–815)
  + trofee + orice element care *pare* interactiv vizual

- **Teme & pagini acoperite:**
  Cele două seturi de slide-uri sunt **complet separate** ca fișiere — schimbările din
  `components/slides/*` nu se propagă în `components/pawcup/*` și invers.
  Auditul și fix-urile pentru badge-uri clickabile trebuie aplicate **în ambele seturi**.
  Dacă un badge component comun există (ex. un `<BadgeChip>` shared), fix-ul acolo acoperă tot;
  altfel se modifică per-slide în ambele directoare.

- **Problema acum — două aspecte:**
  1. **Elemente care par interactive dar nu fac nimic** — posibil cursor-pointer, hover style,
     sau aspect de card care induce în eroare. Auditul anterior a verificat `SlideShare.tsx`
     dar nu toate slide-urile. Trebuie extins **la toate** fișierele de mai sus.
  2. **Badge-urile / trofeele nu sunt apăsabile** — arată ca elemente cu sens (au icon,
     titlu, poate un scor), dar nu comunică nimic suplimentar la interacțiune.

- **Ce facem:**
  - **Pasul 1 — Audit extins:** căutăm în **toate** slide-urile `cursor-pointer`, `onClick`,
    `whileHover`, `hover:` pe elemente care vizual par trofee/stats/cards. Dacă găsim ceva
    fals (look interactiv fără acțiune) → fie scoatem stilul, fie conectăm o acțiune.
  - **Pasul 2 — Badge-uri / trofee clickabile cu descriere:** badge-urile din `SlideShare.tsx`
    (și oriunde altundeva apar) devin apăsabile și afișează un **tooltip / mini-modal**
    cu descrierea badge-ului (`b.explanation` din `lib/badges.ts`):
    - Click / tap pe badge → se deschide un popover/tooltip fix (nu navighează) cu:
      - Iconul mare al badge-ului
      - Titlul (`b.label`)
      - Descrierea (`b.explanation`) — 1-2 rânduri
      - Un buton discret „×" sau dismiss la click în afară
    - Același mecanism e de dorit și pe badge-urile din `SlideAchievements.tsx` dacă există
    - `SlideArchetype.tsx:221` are deja un panou explicativ funcțional — **nu atingem**

- **Atenție:**
  - Nu adăuga `onClick` pe stat-boxes (commits/lines) dacă nu ai ce arăta — rămân decorative.
  - Popover-ul nu trebuie să blocheze navigarea cu tastatura/swipe.
  - Pe cardul de share (`data-share-card`) badge-urile cu popover trebuie să aibă
    `pointer-events-none` în captura screenshot (sau popover-ul închis la capturare).

- **Verificare:** click pe orice badge/trofeu → apare descrierea. Niciun element vizual
  „de tip buton" nu rămâne mut la interacțiune.

### 5 · Link recap în share caption ⭐

> **Idee preferată** — impact maxim cu modificare minimă. Orice share devine și recrutare
> de useri noi fără niciun efort suplimentar din partea userului care distribuie.

- **Fișier:** `components/ui/ShareModal.tsx`
- **Unde:** `caption` (liniile ~90–92)
- **Teme & pagini acoperite:** `ShareModal` e comun ambelor teme. Caption-ul are deja
  ramura `isWorldCup` separată — fix-ul se aplică pe **ambele ramuri** (deja prevăzut mai jos).
  Un singur fișier modificat acoperă tema default + World Cup.
- **Problema acum:** captionul de share (X / LinkedIn / native share) nu conține link spre
  recap. Oricine vede postarea nu are cum să ajungă să-și genereze și el — viral loop rupt.
- **Ce facem:** adăugăm URL-ul recap-ului ca CTA în caption, pe **ambele** variante
  (normal + World Cup):
  - `const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin).replace(/\/+$/, "")`
  - `const recapUrl = \`${appUrl}/wrapped/${username}\``
  - Varianta normală: `„My GitHub Wrapped — @${username} ... — make yours: ${recapUrl} #GrindIT"`
  - Varianta World Cup: `„@${username} at the World Cup... — make yours: ${recapUrl} #GrindIT #WorldCup"`
- **Atenție:** `NEXT_PUBLIC_APP_URL` trebuie setat în `.env.local` și în Vercel env vars
  (ex. `https://grind-it.vercel.app`). Dacă lipsește, fallback-ul `window.location.origin`
  funcționează corect în browser.
- **Verificare:** test cu **ambele teme** → buton X/LinkedIn/native → captionul conține
  link-ul recap corect.

### 6 · CTA pe landing

- **Fișier:** `app/page.tsx`
- **Unde:** content overlay (liniile ~697–699), deasupra paragrafului existent
- **Teme & pagini acoperite:** landing-ul e o singură pagină (`app/page.tsx`) pentru ambele
  teme. `ThemeSwitch` comută vizual între default (violet/space) și World Cup (amber/green).
  `<h1>`-ul adăugat trebuie să arate bine în **ambele stări**:
  - Tema default → gradient `violet → verde` (consistent cu paleta actuală)
  - Tema World Cup → gradient `amber → verde` (sau text alb simplu dacă fundalul e deja colorat)
  - Dacă overlay-ul schimbă culoarea fondului la World Cup, verifică că textul `<h1>`
    rămâne lizibil — ajustează culoarea/gradientul condiționat cu `useTheme()` dacă e necesar.
- **Problema acum:** lipsește un call-to-action clar; intro-ul e text pasiv.
- **Ce facem:** adăugăm un `<h1>` scurt, activ (ex. „Unwrap your **GitHub story**") cu
  gradient violet→verde (default) / amber→verde (World Cup), deasupra paragrafului.
  Păstrăm stilul glass/violet și animația de intrare (moștenită de la `motion.div` părinte).
- **Verificare:** vizibil instant pe landing fără profil generat — **cel mai ușor de
  verificat primul.** Verifică cu `ThemeSwitch` activat (World Cup) că `<h1>`-ul rămâne
  lizibil și arată bine în ambele teme.

---

## 🏗️ Features mari (separat, după quick wins)

Fiecare merită propriul commit/PR. Atac incremental, fără a strica fluxul existent.

### 7 · GitLab + Bitbucket

- **Fișiere:** `lib/` (nou: `lib/gitlab.ts`, `lib/bitbucket.ts`) + `app/api/github/route.ts` + `app/page.tsx`
- **Problema acum:** `lib/github.ts` e cuplat tight la GitHub REST API. Există potențial
  mare în a adăuga și alte platforme (mai mult „de mâncat" pe partea de statistici).
- **Ce facem (incremental):**
  1. Extragem un contract comun de output (shape-ul `GitHubRawData` din `types/wrapped.ts`
     devine contractul VCS, eventual redenumit mental `VCSRawData`).
  2. `lib/gitlab.ts` și `lib/bitbucket.ts` produc **același** shape.
  3. Ruta `app/api/github/route.ts` primește un param `provider` și dispecerizează către
     clientul corect.
  4. Pe landing adăugăm un selector de platformă (GitHub / GitLab / Bitbucket) înainte de input.
- **Atenție:** mai întâi abstracția cu GitHub **neschimbat funcțional**, abia apoi GitLab,
  apoi Bitbucket. Nu spargem fluxul GitHub existent.
- **Efort:** foarte mare.

### 8 · White-label / tier plătit (ascundere logo)

- **Fișiere:** `components/slides/SlideShare.tsx` (logo ~765–769), `components/ui/SlideWatermark.tsx`,
  `app/wrapped/[username]/page.tsx` (logo top-bar + capture)
- **Problema acum:** logourile/watermark-ul GrindIT sunt hardcodate. Pe versiunea plătită
  ai vrea să le poți ascunde.
- **Ce facem:**
  - Introducem un `BrandingContext` cu `showBranding: boolean`, consumat în toate locurile
    cu logo/watermark. Free = afișat, premium = ascuns.
  - **Acum doar mecanismul de gating** (flag + ascundere condiționată), controlabil prin
    prop/env. Sistemul real de plată/auth persistent e separat → marcat clar cu `TODO`.
- **Efort:** mare.

---

# B. Erori întâlnite (de rezolvat separat)

## B1 · Lint — 6 erori PRE-EXISTENTE

Confirmate pe HEAD curat cu `git stash` → **`13 problems (6 errors, 7 warnings)`** identic
cu și fără modificările mele. Sunt reguli noi, stricte, din React 19 / Next 16. Codebase-ul
era **deja roșu** la `npm run lint` înainte de orice modificare.

| Fișier:linie | Regulă | Problemă |
|---|---|---|
| `lib/theme-context.tsx:53` | `react-hooks/set-state-in-effect` | `setReady(true)` direct în `useEffect` |
| `components/ui/MobileGate.tsx:156` | `react-hooks/set-state-in-effect` | `setState("desktop")` direct în effect |
| `components/ui/ShareModal.tsx:73` | `react-hooks/set-state-in-effect` | `setMounted(true)` direct în effect |
| `components/pawcup/Slide0.tsx:40` | `react-hooks/set-state-in-effect` | `setDisplayedText("")` etc. în effect |
| `components/slides/SlideIntro.tsx:292` | `react-hooks/set-state-in-effect` | `setDisplayedText("")` în effect |
| `app/wrapped/[username]/page.tsx:269` | `react-hooks/refs` | `profileRef.current = profile` în timpul render-ului |

> ⚠️ Unele (theme-context hydration, MobileGate orientation) au logică sensibilă — un fix
> greșit poate sparge comportamentul. Necesită testare atentă, ideal cu verificare vizuală.

**Direcții de fix (când le atacăm):**
- `set-state-in-effect`: de mutat sincronizarea inițială în afara effect-ului (ex. valoare
  inițială corectă în `useState`, sau `useSyncExternalStore` pentru `ready`/`mounted`), sau
  de izolat într-un callback (nu sincron în corpul effect-ului).
- `react-hooks/refs`: de scris ref-ul într-un `useEffect`, nu în render.

## B2 · Lint — 7 warnings pre-existente (minore)

| Fișier:linie | Warning |
|---|---|
| `app/opengraph-image.tsx:25` | `<img>` fără `alt` + `no-img-element` |
| `app/page.tsx:560` | `useCallback` cu dep `session` inutil |
| `components/pawcup/Slide1.tsx:6` | `catBack` definit dar nefolosit |
| `components/slides/SlideShare.tsx:718` | `serial` calculat dar nefolosit |
| `lib/captureElement.ts:351` | `_e`, `_o` definite dar nefolosite |

## B3 · Mediu (rezolvat / de știut)

- **`node_modules` era incomplet** — lipsea `vitest` și alte pachete. Am rulat `npm install`
  → completat. `package-lock.json` **neschimbat**. Testele: **21/21 pass** (3 fișiere).
- **Port 3000 ocupat** de un `node.exe` (PID 12712 — probabil dev server-ul tău) → preview-ul
  automat n-a putut porni. Pentru verificare vizuală trebuie oprit acel proces sau folosit alt port.

---

# C. Cum lucrăm (ca să iasă bine)

1. **Un singur item pe rând** — implementat, apoi **verificat vizual în browser** (preview)
   înainte de a trece la următorul. (Lecția din runda trecută: nu declarăm „gata" pe baza
   lint/test, ci pe baza a ceea ce se vede efectiv.)
2. Pentru verificare vizuală am nevoie ca **portul 3000 să fie liber** (sau confirmare pe alt port).
3. Fiecare item = **commit separat** (cum sugera promptul).
4. Ordine recomandată de pornire: **item 6 (CTA landing)** — se vede instant pe pagina
   principală fără profil generat, deci cel mai ușor de verificat primul. Apoi 1 / 5
   (ShareModal), 2 / 3 (wrapped page), 4 (audit).

---

## Referință rapidă fișiere

| Zonă | Fișier |
|---|---|
| Landing | `app/page.tsx` |
| Slideshow (container, top-bar, loading) | `app/wrapped/[username]/page.tsx` |
| Share modal | `components/ui/ShareModal.tsx` |
| Slide „Your Planet" / card share | `components/slides/SlideShare.tsx` |
| Progress / carousel | `components/ui/PlanetProgress.tsx` |
| Mobile gate / portret | `components/ui/MobileGate.tsx` |
| Capturi screenshot | `lib/captureElement.ts` |
| Tipuri | `types/wrapped.ts` |
| Fetch GitHub | `lib/github.ts` · `app/api/github/route.ts` |
