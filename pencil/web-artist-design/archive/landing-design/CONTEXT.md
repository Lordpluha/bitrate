# Bitrate for Artists — Landing Page Design Context

> Purpose: Consolidated product, brand, visual, and technical context for designing the **Bitrate for Artists** landing page (`apps/web-artists` at `/`).

---

## 1. Strategic & Product Foundation

- **Decision (`ADR-0032`):** Bitrate is **artist-first**. The independent musician is the primary customer; the listener web player (`apps/web-player`) serves as the public shopfront and discovery channel for the artist's work.
- **Category (`vision.md`):** An **artist operating system** that owns a listening surface — not "another distributor", "a better Spotify", or "a social network for artists".
- **Positioning (`positioning.md`):**
  - External descriptor: **All-in-one for musicians.**
  - Core promise: **You make the music. Bitrate makes the process clear.**
  - Desired reaction: *"Why is this so simple?"*
  - Long-term test (`strategy.md`): *"Before Bitrate, doing this required a collection of separate services and a lot more work."*
- **Primary Audience (ICP):** Beginning and independent musicians who can finish a track (recorded/mixed) and want to release it, promote it, and understand how it performed — without coordinating a maze of disconnected tools, dashboards, and intermediaries.
- **Core Job to Be Done:**
  > *"My track is finished. Help me release it, promote it, and understand what happened."*
- **North Star Metric:** Artists completing a release end-to-end.

### Working Messaging Territory (`positioning.md`)
- *All-in-one for musicians.*
- *You make the music. Bitrate makes the process clear.*
- *Everything music. One place.*
- *One platform. Every step.*
- *Create. Release. Grow.*
- *Music without the maze.*
- *Less tools. More music.*

---

## 2. Voice, Tone & Honesty Rules (`PRODUCT.md`, `voice.md`, `design.md`)

### Tone of Voice: Calm Confidence
- **Personality:** Like an experienced producer/engineer who enters the room, understands the situation, and helps without making a performance out of it. Calm, competent, direct, modern, dependable, quietly energetic.
- **Copy style:** Short, concrete, plain-language, factual, active verbs, sentence-case headings.
- **Forbidden copy (`ui-design-practices.md`, `voice.md`):**
  - No startup/marketing hype: *"Elevate"*, *"Seamless"*, *"Unleash"*, *"Next-gen"*, *"Game-changer"*, *"Drop it!"*, *"Make some magic"*, *"You're crushing it!"*.
  - No promises of fame, virality, wealth, or guaranteed playlist placement.
  - No fear-based conversion copy or shaming free users.

### Strict Honesty Constraints (`PRODUCT.md` Principle 4 & 5)
- **Never fabricate:**
  - User counts, listener numbers, play counts, or an artist roster.
  - Testimonials, reviews, press quotes, case studies, or named customers.
  - Pricing tiers, subscription plans, or royalty payouts (monetization is unstarted).
- **Label previews and concepts honestly:**
  - Any UI preview showing numbers or tracks must carry a clear label such as `PRODUCT PREVIEW · DEMO CONTENT` or `FEATURE CONCEPT · DEMO CONTENT`.
  - Use realistic, uneven mock figures (`47.2%`, `3:47`, `1,240`) and established demo artists (*Mira Sol*, *Kite Harbor*, *Lumen Choir*, *Nova & the Static*, *Luma Vale*) — never `Lorem ipsum` or `John Doe`.
  - External DSP delivery (Spotify, Apple Music, etc.) is **not connected yet** — state this plainly where distribution is shown rather than implying live store delivery.

---

## 3. Product Capabilities: Shipped vs. Concept Explorations

### A. Shipped in `apps/web-artists` (Real Today)
1. **Release Workspace & Guided Lifecycle (`/releases/$releaseId`):**
   - Instant draft creation; format automatically derived from active recordings (`0–4` Single, `5–6` EP, `7+` Album).
   - **Draft stage:** Audio master upload with SHA-256 duplicate detection, cover artwork upload with automatic palette extraction, release details, release timing (`Right away` vs. scheduled `Premiere` in UTC), contributors & roles, rights & splits, ISRC/UPC identifiers.
   - **Review stage:** Pre-submission readiness checks, submission to Bitrate review, reviewer feedback & changes-requested flow.
   - **Deliver stage (Optional):** Store delivery plan matrix (explicitly marked *Not connected* until DSP partner integration).
   - **Launch stage:** Artist-controlled publication (`Publish now` or `Publish on <date, time> UTC`), all-or-nothing audio transcoding pipeline (CMAF 128/192/320 kbps), follower notification on release, reversible Unpublish/Republish.
   - **Interactive header:** Cover-derived color wash, pointer-tilt artwork, sliding vinyl animation during playback, live premiere countdown.
2. **Living Dashboard & Customizable Bento Grid (`/dashboard`):**
   - 12-column customizable bento layout (drag/keyboard reorder, 1–12 column resize, show/hide tiles persisted per artist).
   - Tiles: Current release with stage ring & countdown, Next premiere, Coming up (UTC schedule), Needs attention, Your catalogue (totals, status share bar, cover fan), Your releases, Activity feed, Listening overview with roll-up counters.
   - First-run state: Kinetic poster with a single clear `Create release` action.
3. **Music Catalogue (`/music`):**
   - Unified Tracks and Releases views with search, status/type filters, sorting, inline waveform playback, and pagination.
4. **Persistent Workspace Player (`@bitrate/player`):**
   - Floating bottom Now Playing pill that persists across routes, expands on hover/focus, and renders track waveform progress alongside inline row waveforms.
5. **Analytics (`/analytics`):**
   - Bitrate plays and unique listeners over `7`, `28`, or `90` days, customizable bento tiles, Top tracks with cover art and pagination, daily breakdown table, and honest *Not connected* state for external platforms.
6. **Public Artist Profile (`/profile`) & Shopfront:**
   - Public card preview with avatar/banner upload, bio, and external links — backed by the 25-route `apps/web-player` listening surface where fans actually play the music.
7. **Security, Account & Team (`/settings`):**
   - Dedicated artist auth (email/password, Google & Facebook OAuth), TOTP 2FA with backup codes, active device session management, Dark/Light/Dim theme + reduced-motion controls, and spec'd Team RBAC (`Owner`, `Manager`, `Collaborator`, `Viewer`).

### B. Confirmed Product Explorations (Must Be Labeled as `CONCEPT` / `PREVIEW` if Featured)
- **AI Release Producer & Readiness Analysis:** Reviews release readiness and suggests the next concrete step without making creative decisions.
- **AI Insights:** Plain-language interpretation of analytics (*what happened → why → what to do next*) instead of raw charts alone.
- **AI A&R & Assisted Promotion:** Surfaces fitting contexts/audiences for a track; drafts release campaigns and social materials from release metadata.
- **Opt-in Autopilot:** Prepares routine release plans, tasks, and reminders while the artist confirms every consequential action (*approve, edit, or reject*).
- **Career Timeline & Services Marketplace:** Long-term artist growth timeline and a vetted marketplace for mixing, mastering, and artwork.

---

## 4. Visual System, Tokens & Motion (`design.md`, `tokens.md`, `motion.md`)

### Palette & Three Themes (`packages/tailwind/src/`)
All designs and code must work across **Dark** (default), **Light**, and **Dim** using semantic tokens only:

| Role | Token | Dark (`@theme`) | Dim (`:root.dim`) | Light (`:root.light`) |
|---|---|---|---|---|
| Canvas background | `--color-background` | `#0B0D12` | `#0E1117` | `#FFFFFF` |
| Elevated surface / card | `--color-card` | `#151923` | `#171B24` | `#FFFFFF` / `#F6F5FB` |
| Structure / border | `--color-border` | `#2A303C` | `#2B3242` | `#E5E7EB` |
| Primary text | `--color-foreground` | `#FFFFFF` | `#E5E7EB` | `#0B0D12` |
| Secondary text | `--color-text-secondary` | `#9CA3AF` | `#A1A7B3` | `#4B5563` |
| Brand primary action | `--color-primary` | `#7C3AED` (white fg) | `#7C3AED` | `#7C3AED` |
| Supporting accent | `--color-accent` | `#A78BFA` | `#8B5CF6` | `#7C3AED` |
| Semantic status | `--color-success` / `warning` / `destructive` | `#10B981` / `#F59E0B` / `#EF4444` | inherited | theme-adjusted |

- **Status rule:** Never rely on color alone; every status badge/chip pairs color with a precise text label (`Draft`, `Submitted`, `Ready`, `Scheduled`, `Live`, `Action required`) and icon.
- **Surface depth:** Hierarchy comes from surface tone, `1px` borders, translucent panels over a subtle aurora/backdrop, and fixed `pointer-events-none` film grain — not heavy neon glows or arbitrary gradients.

### Typography (`design.md` §14)
- **Display & Headings (`--font-heading`):** `Unbounded` (weights 500–800, negative tracking on large display headings; Display `54px`, H1 `32px`, H2 `24px`, H3 `19px`, H4 `16px`).
- **Interface & Body (`--font-sans`):** `Inter` (weights 400–700, body copy ≤ 65ch, `text-wrap: pretty` on paragraphs, `text-wrap: balance` on headings).
- **Data, Timestamps & Counters (`--font-mono`):** `JetBrains Mono` with `tabular-nums` for durations, play counts, UTC timestamps, and step numbers.

### Brand Mark (`design.md` §25)
- Two-stroke stylised **B** (`LogoIcon` in `@bitrate/ui-react`, gradient `#490AE5` → `#C060FA`). Self-colored across all three themes.

### Motion Principles (`motion.md`, `ADR-0069`)
- **Engine:** GSAP 3 (`useGSAP`) for timelines, staggered reveals, and scroll/scene transitions; CSS transitions for hover/press (`scale(0.98)`, 200–250 ms).
- **Tokens:** `--motion-instant` (100–160 ms), `--motion-fast` (200–250 ms), `--motion-base` (320–400 ms), `--motion-emphasis` (450–550 ms); primary easings `expo.out` (`cubic-bezier(.16, 1, .3, 1)`) and `power3.out`.
- **Accessibility (`a11y.md`):** WCAG 2.2 AA contrast in Dark, Light, and Dim; full keyboard operability; `prefers-reduced-motion: reduce` collapses animations into a static, scrollable experience with zero content loss.

---

## 5. Existing Landing Implementations & Design Files in Repo

1. **Current `apps/web-artists` Landing (`apps/web-artists/src/views/ArtistView/`):**
   - Minimal placeholder page at `/`: `LandingHeader` + `LandingHero` (*"Plan, prepare and track your releases"* + `/artwork/landing/night-signal.webp`) + `LandingFeatures` (3-column list: *Release workspace*, *Distribution plan*, *Analytics*) + `LandingFooter`.
   - Pencil page: `pencil/web-artist-design/landing/landing.pen` (generated by `scripts/pencil-pages/pages-artist.mjs`).
2. **Reference `apps/web-player` Landing (`apps/web-player/src/views/LandingView/` & `pencil/web-player-design/landing/`):**
   - Spec: `apps/docs/docs/specs/web-player-landing.md`.
   - Prototype: `pencil/web-player-design/landing/motion-prototype.html`.
   - Architecture: Multi-scene interactive storytelling experience with Dark/Light/Dim switcher, scene navigation dots & counter, interactive UI preview windows, live API `/health/ready` status pill, demo assistant, and full static/reduced-motion fallback.
3. **Technical Stack for `apps/web-artists`:**
   - Framework: **TanStack Start** (Vite + Nitro, Feature-Sliced Design; no Next.js APIs).
   - Routing: `@tanstack/react-router` (`ROUTES.auth.registration` → `/registration`, `ROUTES.auth.login` → `/login`, `ROUTES.dashboard` → `/dashboard`).
   - Localization: `en`, `uk`, `pl` catalogs in `apps/web-artists/src/shared/i18n/messages/{en,uk,pl}/landing.ts`.
   - Design system: `@bitrate/ui-react` + `@bitrate/tailwind` tokens; Pencil designs bind to `pencil/web-player-design/design-system/bitrate.lib.pen` (`$ds:--<role>`).
