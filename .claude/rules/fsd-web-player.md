# FSD architecture — web-player

Feature-Sliced Design is the module-organisation pattern for `apps/web-player/src/`. Read this before adding a new file, moving code between slices, or creating a new slice.

## Layer order

Imports flow **downward only**. Upper layers consume lower layers; lower layers never reach up.

```
app → views → widgets → features → entities → shared
```

| Layer | What lives here |
|-------|-----------------|
| `app/` | Next.js App Router — `layout.tsx`, `page.tsx`, `_provider.tsx`, route groups, global providers |
| `views/` | Full-page view compositions — assemble widgets and features for one route. No business logic. |
| `widgets/` | Self-contained page sections used across multiple views: `Header`, `Player`, `LeftSidebar`, `RightSidebar` |
| `features/` | User interactions and the UI that triggers them: `Album`, `Playlist`, `AuthModal`, `Track`, `User`, `SwitchTheme` |
| `entities/` | Domain objects — data shapes, query hooks, Zustand stores, API calls |
| `shared/` | Tech-agnostic: `api/`, `hooks/`, `store/`, `ui/`, `routes/`, `constants/`, `validation/` |

## Slice anatomy

```
<slice>/
  ui/       React components owned by this slice
  model/    Types, Zod schemas, Zustand stores
  api/      Data-fetching hooks and mutation functions
  lib/      Slice-internal utilities
  index.ts  Public barrel — the ONLY legal cross-slice import target
```

Create only the segments the slice actually needs.

## Public API rule

Cross-slice imports MUST go through the slice's `index.ts` barrel. Importing from an internal segment directly couples consumers to implementation details.

```ts
// Bad — reaches into the internal segment
import { usePlayerStore } from '@/entities/Player/model/playerStore'

// Good — goes through the public barrel
import { usePlayerStore } from '@/entities/Player'
```

## Same-slice imports

Within the same slice, use `@/` paths:

```ts
// In entities/Player/api/playerApi.ts — importing from same slice
import { PlayerTrack } from '@/entities/Player/model/types'
```

## Cross-layer import table

| Source layer | May import from | Forbidden |
|---|---|---|
| `shared` | nothing above `shared` | all other layers |
| `entities` | `shared` | `app`, `views`, `widgets`, `features`; other entity slices |
| `features` | `entities`, `shared` | `app`, `views`, `widgets`; other feature slices |
| `widgets` | `features`, `entities`, `shared` | `app`, `views`; other widget slices |
| `views` | `widgets`, `features`, `entities`, `shared` | `app`; other view slices |
| `app` | everything | — |

Cross-slice imports at the same layer level are always forbidden.

## Path alias

`"@*": ["./src/*"]` in `apps/web-player/tsconfig.json`. Every import uses `@/` prefix. No relative paths (`./`, `../`) across slice boundaries.

```ts
// Bad
import { ROUTES } from '../../../shared/routes'
// Good
import { ROUTES } from '@/shared/routes'
```

## When to lift code down the stack

A primitive used by two or more unrelated slices belongs one layer lower. Ask: "which layer do ALL current consumers live in?" and place the code in the layer below that.

- Type used by two feature slices → move to `shared/` or a relevant `entities/` slice.
- Hook used by a feature and a widget → move to `shared/hooks/`.
- UI primitive used by multiple widgets → move to `shared/ui/`.

## Adding a new slice

When `sp-develop` creates a new `feature`, `entity`, `widget`, or `view`, it applies the
`fsd-scaffold` skill and copies the canonical `.claude/templates/` tree. Do not hand-roll a
new feature/entity/widget/view tree.

After scaffolding, add only real API hooks, UI, store, and helpers. The template intentionally
does not invent an OpenAPI endpoint.

## Enforcing FSD

Biome's `noRestrictedImports` rules enforce layer boundaries. Run `pnpm lint` — any violation appears as an error. Fix before committing.
