# Web-player landing: behavior and implementation

> Status: approved — the user confirmed the plan on 2026-10-13; implementation in progress.
> Reference prototype: `pencil/web-player-design/landing/motion-prototype.html`.
> Static design: `pencil/web-player-design/landing/landing.pen`.
> Motion rules: [Motion](../brand/motion.md).

## Goal and boundaries

Logged-out and logged-in visitors who open `/` see the new Bitrate landing. It has eleven
full-screen scenes and works on desktop, on phones and with touch. It replaces the old landing
(Welcome, QR code, Premium features, Plans, For students), including the plan copy taken from
Spotify.

- **Workspace:** `apps/web-player` only. `apps/api` is consumed as is: `GET /health/ready`.
- **Not included:**
  - plans and pricing (a separate task with Bitrate's own plans);
  - switching the whole app to Unbounded and Inter (separate);
  - per-service health and uptime history (needs an API status endpoint first);
  - a real AI assistant backend.

## Observable behavior and contracts

- **Route.** `/` is served by its own route group with the landing header (scene nav, Dark/Light/Dim
  theme switch, the play-signal sound toggle) and the landing footer. `/auth/*`, `/login*`,
  `/verify-email` and `/legal/*` keep the current header and footer. The `proxy.ts` public-route
  rules stay as they are. Static assets the landing needs must not be redirected to login.
- **Scenes**, in the prototype's order and copy:
  1. Signal
  2. Play. Save. Return.
  3. Playlist Workshop
  4. Your player. Your rules.
  5. A library with a memory
  6. Follow the sound
  7. Same queue. New scene.
  8. Beyond the play button
  9. Partners
  10. Team
  11. Start
- **Navigation.**
  - Desktop moves between scenes with the wheel, ↑/↓, PageUp/PageDown, Space, Home/End, the side
    dots and the header links. The URL hash follows the scene, and a deep link (`/#library`)
    opens that scene.
  - Phones and touch screens swipe vertically between scenes. The assistant chat, the status
    panel, the physics fields (partner spheres, team pit) and inputs keep their own native
    scrolling and dragging.
- **Motion.**
  - GSAP drives scene enter and leave.
  - Three.js renders the particle surface. It loads lazily, only on the client and after first
    paint.
  - Without WebGL the 2D canvas particles and DOM spheres take over.
  - With `prefers-reduced-motion: reduce` every scene is shown statically in a scrollable page.
    There is no 3D, no loops and no autoplay.
  - The intro logo loader plays once per session.
- **Rendering.**
  - The page renders on the server: headings, copy and links are in the HTML.
  - `ThemeProvider` renders its children before hydration. The inline theme script already sets
    the theme class, so there is no flash.
- **Fonts.** Unbounded, Inter and JetBrains Mono load through `next/font`, scoped to the landing
  route.
- **Language.**
  - Landing copy exists in en, uk and pl, in a landing-local catalog keyed by the app locale.
  - de and ru fall back to English. The shared app catalogs are unchanged.
- **Calls to action.**
  - "Open web player" goes to `ROUTES.main`. Guests reach login through the existing proxy.
  - "Create account" goes to `ROUTES.auth.registration`; "Log in" goes to `ROUTES.auth.login`.
  - A signed-in visitor sees "Open web player" instead of "Create account".
- **Service status** (footer pill and panel). It polls `GET {NEXT_PUBLIC_API_URL}/health/ready`
  every 60 s while the tab is visible:
  - 200 → "All systems operational".
  - 503 → "Degraded".
  - Network error or timeout → "Unreachable".
  - Before the first answer → "Checking…".
  - The panel shows one row ("Bitrate") with the state and the time of the last check. There is
    no service list and no uptime bars.
- **Demo features** stay and are labelled as demo where they show data:
  - the assistant with canned answers;
  - the sound toggle, which is a WebAudio synth;
  - team bubbles with GitHub links;
  - partner placeholder marks.
- **Accessibility.** Each scene is a labelled region and the counter and dots are buttons with
  labels. Focus is visible, Esc closes panels, and contrast follows the tokens.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | `/` renders the eleven scenes with the prototype's copy; the old landing and Spotify plan copy are gone | e2e: headings of every scene; grep for removed widgets | Pending |
| AC-2 | Server HTML contains the hero heading and CTA links before hydration | e2e: request `/` with JavaScript disabled | Pending |
| AC-3 | Wheel, keys, dots and hash navigation move between scenes on desktop | e2e (desktop) | Pending |
| AC-4 | A vertical swipe changes scenes on touch; swipes inside the status panel, assistant and physics fields do not | e2e (mobile, touch events) | Pending |
| AC-5 | Without WebGL the 2D fallbacks render and nothing throws | e2e with WebGL disabled, console clean | Pending |
| AC-6 | Reduced motion shows a static, scrollable page without 3D or loops | e2e with `reducedMotion: 'reduce'`; screenshot baseline | Pending |
| AC-7 | en, uk and pl copy switch with the app locale; de and ru show English | unit test of the landing catalog and fallback | Pending |
| AC-8 | Status pill reflects `/health/ready`: 200, 503, network error, initial checking | unit test of the status hook with a mocked fetch | Pending |
| AC-9 | CTAs point at `ROUTES`; a signed-in visitor sees "Open web player" | unit + e2e | Pending |
| AC-10 | Other routes still render after the `ThemeProvider` change | existing e2e and screenshot suites, type check, lint | Pending |
| AC-11 | Landing JavaScript for Three.js and GSAP is not in the first-load chunk | `next build` output: Three.js arrives as a dynamic chunk | Pending |

## Decisions and approval

The user agreed in this session's interview (2026-10-13):

1. Replace the old landing entirely.
2. Port the prototype 1:1 with GSAP and Three.js, loaded lazily on the client, with the 2D and
   static fallbacks.
3. Give `/` its own route group with the landing header and footer.
4. Load the landing fonts on the landing only.
5. Fix server rendering in `ThemeProvider`.
6. Languages: **en, uk and pl only**. de and ru show English.
7. Keep the demo features and label them.
8. Work on the current design branch (`design/web-player-restructure`). This replaces the
   recommended separate branch.
9. Route the calls to action through `ROUTES`.
10. Tests: a static snapshot, e2e for navigation and touch, and unit tests for the logic.
11. Service status: the real `/health/ready` with a single row, option (a).

Plan confirmation: the user confirmed the plan in the same session on 2026-10-13 ("Подтверждаю, начинай реализацию").

## Implementation plan

1. **Dependencies and shell.**
   - Add `gsap`, `@gsap/react` and `three` (+ `@types/three`) to `apps/web-player`.
   - Create the route group `app/(home)/` for `/`, with its layout, landing fonts and metadata.
     Move `page.tsx` out of `(landing)`.
   - Fix `ThemeProvider` so it renders before hydration.
   - Check that the landing assets pass the proxy matcher.
2. **Slice structure** (FSD).
   - `views/LandingView` holds the scene composition, the scene engine (navigation, hash, keys,
     wheel and touch with ignore zones) and the landing catalog `model/messages.ts` (en, uk, pl).
   - Scenes are `views/LandingView/ui/scenes/*`.
   - Shared, landing-only widgets live in `widgets/Landing*` where reuse is plausible: header,
     footer status, assistant.
   - The WebGL stage is `views/LandingView/lib/stage` and is loaded with dynamic `import()`.
   - The old LandingView pieces and the unused Plans, PremiumFeatures and QR widgets are removed.
3. **Scenes.** Port them in order 1 → 11, each with copy from the catalog and its GSAP enter
   timeline. Physics (partners, team, cradle) and the logo loader are ported as client modules.
4. **Status.** A `useServiceStatus` hook (React Query, 60 s polling, paused while hidden) feeds
   the pill and panel.
5. **Tests.**
   - Unit: catalog fallback, status mapping, scene index and hash logic.
   - e2e: the landing spec rewritten for AC-1 to AC-6 and AC-9.
   - Screenshot: the reduced-motion baseline replaces `landing-default.png`.
6. **Checks.** These run through `run-heavy.py` where heavy:
   - `pnpm --filter @bitrate/web-player check-types`;
   - `lint` and `test:unit`;
   - e2e and screenshot for landing and smoke routes;
   - `next build` for chunking.
7. **Docs.** Update `apps/docs` (web-player landing notes, specs status). The prototype stays the
   design reference.

**Risks.**
- The `ThemeProvider` change affects every route; it is covered by the existing suites, AC-10.
- WebGL in CI can be flaky. e2e runs with WebGL disabled plus one SwiftShader smoke check.
- Bundle size: Three.js is lazily loaded, AC-11.
- Rollback is reverting the landing commits; the old view stays in git history.
