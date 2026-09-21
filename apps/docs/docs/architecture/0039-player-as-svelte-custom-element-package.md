# ADR-0039: The player becomes a Svelte custom-element package

Status: Accepted

Date: 2026-09-17

## Context

The audio player has lived inside `apps/web-player` since the project's earliest commits, as
FSD slices under `entities/Player` and `features/Player`. That placement stops working once
more than one first-party surface needs to play audio: the operator panel
(`apps/admin`, Angular) needs a preview player for moderation and catalog review, the artists
portal (`apps/web-artists`, TanStack Start on Vite + Nitro) needs one for release previews, and
a public embed needs to let third parties drop a Bitrate player into their own page — a page
this repository does not control and cannot assume runs React, Next.js, or any particular
framework at all.

Three different frontend stacks (Next.js App Router, Angular 22, TanStack Start) and one
framework-agnostic embed target rule out "keep it inside web-player and let the others
reimplement it" — that duplicates playback state, buffering logic (see
[ADR-0020](./0020-cmaf-range-mse-playback.md)), and every future bugfix across three codebases.
It also rules out a React-only shared package: `apps/admin` cannot mount a React tree without
adopting React as a second UI framework inside an Angular app, and the third-party embed target
cannot assume the host page runs React either.

## Decision

The player becomes its own package, `packages/player` (`@bitrate/player`), that compiles to a
single custom element (Web Component): `<bitrate-player>`. A custom element is the one
component shape every target here can mount identically — a `<script>` tag and an HTML tag
work the same whether the host is a Next.js Server Component tree, an Angular template, a
TanStack Start route, or a third party's own static page.

**Framework: Svelte 5.** Svelte compiles to vanilla JS/DOM operations with a much smaller
runtime footprint shipped to the consumer than a component framework that ships its own
reconciler — the compiled output still imports a small `svelte/internal/client` runtime (the
E0 skeleton's compiled `BitratePlayer.js` is well under 1 KB gzipped including that import),
but that is materially smaller than a React (plus `react-dom`) equivalent for the same
component. Svelte 5's `<svelte:options customElement={{ ... }}>` compiles a component directly
to a standards-based custom element with first-class shadow DOM support, which is exactly the
mount shape this package needs.

**One package, three subpath exports:**

- `@bitrate/player` — imports and registers `<bitrate-player>` against
  `customElements`, guarded for SSR (`typeof customElements === 'undefined'`) and for repeat
  registration (`customElements.get(...)`). Also exports `defineBitratePlayer()` for a host
  that wants to control registration timing explicitly.
- `@bitrate/player/contract` — types, event names, and a thin client, with **zero Svelte
  runtime dependency**, so it stays importable from a server module (a Next.js Server
  Component, a Nitro server route) that never touches the DOM. Enforced by both an ESLint
  `no-restricted-imports` rule and a Vitest spec that walks the directory on disk — see
  `.claude/rules/player-rules.md`.
- `@bitrate/player/engine` — the framework-free playback engine, exposed directly without the
  element. Temporary: it exists only to let `apps/web-player` migrate off its in-app player
  incrementally, consuming the engine before it adopts the element. Not a path new consumers
  should build against once that migration finishes.

**The engine stays plain TypeScript, inside this package, not extracted to its own.** Playback
orchestration (buffering, the manifest/Range-index machinery from ADR-0020, transport state)
has no dependency on Svelte and every future consumer benefits from it staying framework-free
— a future non-Svelte rewrite of the *chrome* around the player would not need to touch the
engine at all. It stays inside `packages/player` rather than becoming `packages/player-engine`
because there is no real consumer of the engine yet at all — `src/engine/index.ts` is an empty
placeholder in this E0 stage, filled in E1, and the migration path that will become its first
consumer (`apps/web-player` moving off its in-app player) has not started. Splitting a package
before a first real consumer exists, let alone a second one, adds an indirection this
repository's own conventions (`.claude/rules/code-principles.md` § KISS) argue against.

**The player owns playback state; hosts only subscribe.** Each host (web-player, admin,
web-artists, the embed) mounts the element and listens to it — it does not reach into the
element's internals to drive playback itself, and does not duplicate `isPlaying`/`currentTime`
state in its own store. This mirrors how the element is a black box to any consumer regardless
of framework: a custom element's public surface is its attributes, properties, and events, not
its internal implementation.

**First-party apps will consume the package at build time; only the iframe embed will deploy
independently.** The plan is for `apps/web-player`, `apps/admin`, and `apps/web-artists` to each
declare `@bitrate/player` as a workspace dependency and bundle it through their own build — the
same way they already consume `@bitrate/ui-react` or `@bitrate/contracts`. None of the three
does yet: this E0 stage delivers the package skeleton only, with no app wired up to it (see
"Consequences"). The iframe embed target (also out of scope for this stage) will be the one
deployment of this package that ships and versions independently of any first-party app,
because it is the only target whose host page this repository does not control.

## Consequences

- `apps/web-player`'s existing `entities/Player` and `features/Player` slices are retired in
  favor of consuming `<bitrate-player>` once the engine migration (tracked separately) lands;
  this ADR does not itself move that code.
- Every consuming app gains a second UI framework in its dependency graph (Svelte, alongside
  React or Angular) scoped entirely to one custom element's shadow DOM — this is deliberate
  and bounded, not a precedent for introducing Svelte elsewhere in the monorepo.
- `packages/player` is the third ESLint-linted workspace in a Biome-default monorepo (after
  `apps/admin` and `apps/mobile`), because Biome cannot parse `.svelte` template syntax. See
  `.claude/rules/code-style.md` § "Two lint gates, not one".
- Styling this package uses CSS custom properties (`var(--color-*)`) rather than Tailwind
  utilities, because Tailwind's generated stylesheet cannot cross a shadow DOM boundary while
  custom-property inheritance can. See `.claude/rules/player-rules.md` § "Styling".
- The iframe embed build target, and the actual migration of `apps/web-player`'s playback UI
  onto the element, are explicitly **out of scope** for the stage this ADR covers (E0): this
  stage delivers the package skeleton, its build/lint/test tooling, and the enforced
  package-internal boundaries, with no engine code and no real UI yet.

**Status update (E1, scoped to `apps/admin`).** The engine (`src/engine/index.ts`) and the
real `<bitrate-player>` UI (`src/element/BitratePlayer.svelte`) are implemented, and
`apps/admin`'s `TrackAudioPlayer` consumes the package as a build-time workspace dependency,
replacing its native `<audio>` element. `apps/web-player` and `apps/web-artists` have not
adopted the package yet; the engine migration off `apps/web-player`'s in-app player (the
`/engine` subpath's stated purpose) remains a separate, not-yet-started effort.

## Alternatives considered

- **A React package, mounted into each host via `react-dom/client`.** Works cleanly for
  `apps/web-player` and `apps/web-artists` (both already run React), but forces `apps/admin`
  to embed a second, unrelated UI framework directly inside Angular's change-detection and
  DI model rather than at the shadow-DOM boundary a custom element provides — and does nothing
  for the third-party embed target, which cannot assume the host page runs React at all.
- **Lit.** A real alternative for the same custom-element target — first-class custom-element
  support by design, and its own runtime is smaller than Svelte's. Not chosen because Svelte
  compiles templates and reactivity away at build time rather than shipping a runtime template
  library the way Lit does (Lit ships `lit-html`/`lit-element` to the browser; Svelte's compiler
  emits direct DOM operations plus a thin `svelte/internal/client` helper module), and because
  Svelte 5's runes are a closer match for this team's existing reactivity intuitions than Lit's
  property-decorator-plus-`render()` model — `packages/ui-react` is a React component library
  with React's own runtime reconciler, not evidence either way, since it is a different UI
  framework built with Vite as a build tool rather than a compile-to-vanilla-output framework
  like Svelte or Lit. Revisit if Svelte's custom-element output proves materially larger or
  slower than a Lit equivalent once the real UI exists.
- **Module Federation.** Rejected outright, not merely deprioritized: Webpack Module
  Federation's Next.js integration (`@module-federation/nextjs-mf`) is being deprecated by its
  own maintainers, and even at its most current it only supports Next.js 12 through 15 on the
  **Pages Router** — it has no App Router support. `apps/web-player` is Next.js 16 on the App
  Router (see [ADR-0003](./0003-nextjs-app-router.md)), so Module Federation could not target
  this repository's actual web-player runtime even ignoring the deprecation. A custom element
  needs no bundler-level federation machinery at all — it is a standard the browser itself
  implements.
