---
name: code-principles
description: "SOLID, DRY and KISS as they apply to this codebase, plus the hard limits that follow from them: 100 logic lines per .tsx, 5 own declared props, and where each extracted concern belongs when a component outgrows them. Use whenever writing or reviewing a React component, deciding how to split one, or judging whether an abstraction earns its place."
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Code principles

Cross-cutting implementation discipline for all first-party code under `apps/web-player/src/`. Complements `react.md`, `typescript.md`, and `fsd-web-player.md`. Where they overlap, the more specific file wins; this file owns SOLID/DRY/KISS and the component size / props limits.

## SOLID

- **Single Responsibility** — one reason to change per component / hook / module. A component that renders UI *and* fetches data *and* transforms it is three responsibilities; split them (`ui/` for JSX, `api/` for fetching, `lib/` or `model/` for transforms).
- **Open/Closed** — extend via props and composition, not by editing a shared component to satisfy one caller.
- **Liskov Substitution** — a wrapper honours the wrapped element's contract (forwards `ref`, accepts `className`, keeps the event surface).
- **Interface Segregation** — small prop contracts; never force a consumer to pass props it doesn't use (see the ≤5-props rule).
- **Dependency Inversion** — depend on abstractions injected as props/params, not on concretes reached up-layer. A `shared/` utility takes what it needs as a parameter rather than importing from `entities/`.

## DRY

Three near-identical blocks → extract. **Search before writing**: reuse `@bitrate/ui-react` components, `@/shared/ui`, `@/shared/hooks`, and existing `use*` hooks before creating new ones. Never duplicate a Zod schema — import the one in `entities/<entity>/model/<entity>.schema.ts`.

## KISS

The simplest solution that satisfies the requirement. No speculative abstraction, no configuration layer for a single consumer. If 200 lines do what 50 can, write the 50.

## Component size — ≤100 logic lines per `.tsx`

- A `.tsx` file's **logic lines** (non-comment, non-blank) must be **≤ 100**. A file over ~130 total lines is a review trigger.
- Applies to every layer — `shared/ui/`, `features/`, `entities/`, `widgets/`.
- Over the limit → split into co-located subcomponents (below) or extract non-JSX logic to a hook/lib.
- **Exception:** a genuinely irreducible compound component whose parts share one public API and cannot split without breaking it may exceed the limit **only** with a one-line TSDoc justification (e.g. `/** Over 100 lines: compound Select API must stay co-located. */`). An over-limit file with no note is a review FAIL.

## Component decomposition — co-located subcomponents

When a component passes the limit or mixes concerns, extract subcomponents. Each subcomponent **owns its related actions / handlers and business logic** (a vertical slice), not a flat dump of JSX with all handlers hoisted to one parent.

Subcomponents live in the **same FSD slice's `ui/` segment** (e.g. `features/Album/ui/AlbumTrackRow.tsx`, `features/Album/ui/AlbumTrackActions.tsx`). They are **not** promoted to `shared/` unless reused by 2+ unrelated slices (see `fsd-web-player.md` § "When to lift code down the stack").

The slice's public barrel (`index.ts`) re-exports only the top-level component; subcomponents stay slice-internal.

Non-JSX logic (data shaping, derivations, event orchestration) moves to the slice's `lib/` or `model/`, or a `use*` hook — never inline in the component body.

### Decompose as you build — not later

When a file reaches the limit, decompose it **in the same change, without being asked**. Do not ship an over-limit file and leave splitting for review. Route each concern to its conventional home:

| Concern | Extract to | Suffix |
|---|---|---|
| Shape transform (response → view-model) | slice `lib/` | `*.adapter.ts` |
| Formatted/derived strings (labels, status text) | slice `lib/` | `*.formatter.ts` |
| Stateful orchestration (open/close/refs/handlers) | slice `model/` | `use<Name>.ts` |
| Pure stateless helper (predicate, sort, group) | slice `lib/` | bare camelCase `.ts` |
| Cohesive vertical JSX + its own handlers | slice `ui/` | `<Sub>.tsx` |

Each extracted file is itself ≤ 100 logic lines.

## Props — ≤5 own declared props

- A component's **own declared props** (fields of its `<Component>Props` type) must be **≤ 5**.
- Inherited `React.*HTMLAttributes` and `VariantProps<typeof …>` **do not count** — they are pass-through surface.
- Over 5 → split the component, or group cohesive props into a sub-object type (e.g. `pagination: { pageIndex; pageSize }`).
- **Exception:** same one-line TSDoc mechanism as the size rule.

## Enforcement

These are **hard rules** that bind every agent writing or reviewing code. Any code-writing agent decomposes as it builds; any reviewing agent FAILs an undocumented violation.

Mechanical checks live in `architecture-checklist.md`: **Principles-1** (SOLID/decomposition), **Principles-2** (≤100 logic lines), **Principles-3** (≤5 props), **Principles-4** (≤2 `useEffect`).
