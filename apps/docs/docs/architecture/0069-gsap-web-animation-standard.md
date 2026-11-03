# ADR-0069: GSAP is the animation library for every web surface

Status: Accepted

Date: 2026-11-03

## Context

Web animation had three answers at once. The [motion guide](../brand/motion.md) split the work
between CSS transitions, the Web Animations API (WAAPI) in hand-written hooks and GSAP, with
GSAP limited to the landing in `apps/web-player`. The agent references
(`.claude/references/styling-guide.md`, `ui-design-practices.md`) still named `motion`
(Motion for React), although no workspace has depended on it since 2026-09-24. The landing
engine, the logo loader and the HTML motion prototypes are written in GSAP, and the guide's
easing tokens use GSAP names (`expo.out`, `power3.out`).

The web workspaces use several frameworks: React 19 in `apps/web-player`, `apps/web-artists`,
`apps/desktop` and `packages/ui-react`, and Angular 22 in `apps/admin`. One library has to serve
all of them, the Three.js stage and the vanilla prototypes.

## Decision

**GSAP 3 is the standard and the only JavaScript animation library for web surfaces.** Any
animation driven by script uses it. That covers timelines, FLIP and measured height morphs
(`Flip`), staggers, springs and drag (`Draggable`, `InertiaPlugin`), scroll-linked effects
that CSS scroll timelines cannot express (`ScrollTrigger`), text effects (`SplitText`), SVG
and canvas or Three.js properties.

GSAP is chosen because it is:

1. **More advanced.** Timelines nest and position tweens with labels and offsets, so a
   multi-track sequence is one object that can be paused, reversed, scrubbed or killed. All of
   the plugins above, plus `CustomEase` and `MorphSVG`, are free and maintained with the core.
2. **Optimised for script-driven motion.** One `requestAnimationFrame` ticker batches every
   tween. It caches transform components instead of reading layout each frame, smooths
   lag after a blocked main thread, and `gsap.quickTo` / `quickSetter` keep pointer-driven
   values off the React render path.
3. **Able to animate more.** It tweens any numeric property: CSS, CSS variables, SVG attributes,
   canvas and Three.js object fields, or plain objects. The same API runs in React, Angular,
   vanilla prototypes and the landing engine, so a prototype ports 1:1.

**CSS stays for what does not need script.** Hover, press and focus feedback, and enter or exit
of mounted elements through Base UI's `data-[starting-style]` / `data-[ending-style]`, remain
CSS transitions on `transform` and `opacity`. These run on the compositor thread, which no
JavaScript library matches. This is CSS, not a second animation library.

**Usage rules.**

- React components animate through `useGSAP` from `@gsap/react`, which scopes selectors and
  reverts tweens on unmount. Angular components create a `gsap.context()` and revert it in
  `ngOnDestroy`.
- Plugins are registered once per workspace with `gsap.registerPlugin`, next to the first
  use, and imported individually.
- Reduced motion goes through `gsap.matchMedia()` with `(prefers-reduced-motion: reduce)`.
  The rest of the [motion guide](../brand/motion.md) still applies: transform and opacity on
  large surfaces, interruptible tweens, pause off-screen.

**Out of scope.** `apps/mobile` keeps Reanimated. `packages/player` keeps its own CSS
transitions and must not depend on host animation libraries.

## Consequences

- `motion`, `framer-motion`, `react-spring`, `anime.js`, `@formkit/auto-animate` and new
  hand-written WAAPI hooks are not added. Changing that needs a superseding ADR.
- A workspace adds `gsap` (and `@gsap/react` for React) with its first animated surface. The
  addition gets the bundle-impact check from the styling guide. The landing keeps loading
  GSAP and Three.js lazily ([landing spec](../specs/web-player-landing.md), AC-11).
- GSAP runs on the main thread. A tween stutters when the thread is blocked, where a CSS
  transition would not. Long tasks next to animated surfaces count as defects, and simple
  feedback stays in CSS for this reason.
- GSAP is distributed under its own no-charge standard licence, not an OSI licence. It
  allows commercial use. It excludes products that compete with Webflow's visual
  builder, which Bitrate is not.
- The motion guide (§3), `.claude/references/styling-guide.md` and
  `.claude/references/ui-design-practices.md` name GSAP. Advice from agent skills written
  for Motion (`emil-design-eng`) is applied through GSAP or CSS.

## Alternatives considered

- **Motion (Motion for React)** — declarative React API, `AnimatePresence` and `layoutId`.
  Rejected: it is built around React, so `apps/admin` (Angular) and the landing engine
  would need another tool. Its timeline sequencing is weaker. Base UI attributes already
  cover enter and exit, and `Flip` covers shared-element moves. It was installed once
  and removed unused.
- **WAAPI in hand-written hooks** — no dependency, and it can run on the compositor.
  Rejected as the standard: there are no timelines, staggers or plugins, so every pattern
  becomes a bespoke hook.
- **CSS only** — cannot measure for FLIP, sequence several tracks or follow the pointer.
- **Keep the split** — three tools for overlapping jobs, and documents and agents that
  disagree about which one to use.
