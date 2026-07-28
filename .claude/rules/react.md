# React conventions — web-player

Applies to all `.tsx` files under `apps/web-player/src/`. Read alongside `typescript.md` — the TypeScript rules (named types, imports) apply to component files too.

## Function components only

No class components. Named exports only — no default exports for components. PascalCase component name matches the file name.

```tsx
// Bad — default export
export default function TrackCard({ track }: TrackCardProps) { ... }

// Good
export type TrackCardProps = { track: Track }
export function TrackCard({ track }: TrackCardProps) { ... }
```

## React imports

Named imports only, never namespace access:

```tsx
// Bad
import React from 'react'
const [playing, setPlaying] = React.useState(false)

// Good
import { useState } from 'react'
const [playing, setPlaying] = useState(false)
```

## Server vs Client components

Next.js App Router defaults to Server Components. Rules:
- **Server Component**: data fetching, static rendering, no hooks, no browser APIs.
- **Client Component**: add `'use client'` directive when using hooks, event handlers, `useState`/`useEffect`, browser APIs, Zustand stores.

Keep `'use client'` boundary as deep in the tree as possible. Fetch data in Server Components; pass results down as props to Client Components.

```tsx
// app/album/[id]/page.tsx — Server Component
import { AlbumView } from '@/views/AlbumView'

export default async function AlbumPage({ params }: { params: { id: string } }) {
  return <AlbumView albumId={params.id} />
}

// views/AlbumView.tsx — also Server Component, composes features
// features/Album/ui/AlbumPlayer.tsx — 'use client' because it uses usePlayerStore
```

## Hooks rules

- Call hooks at the top level of a component or hook only. Never inside conditionals or loops.
- Hook files: `use<Name>.ts` (or `.tsx` if JSX is involved).
- Custom hooks that wrap API calls live in the slice's `api/` segment; state hooks in `model/`.

## Hooks-wrapping convention

Third-party and generated hooks are wrapped in project hooks before use. The wrapper lives in the owning slice under `api/` or `model/`. Call sites import the project hook, not the library hook directly.

```ts
// Bad — calling the library hook directly in a component
const { data } = $api.useQuery('get', '/tracks')

// Good — wrapped in a project hook
// entities/Track/api/useTrackList.ts
type UseTrackListInput = { page?: number; limit?: number }
export function useTrackList({ page = 1, limit = 20 }: UseTrackListInput) {
  return $api.useQuery('get', '/tracks', { params: { query: { page, limit } } })
}
```

## useEffect budget

A component declares **≤ 2 `useEffect` calls**. More than two signals logic that belongs outside the render path.

Over the cap, in order of preference:
- **Derive, don't sync.** Compute the value during render instead of syncing to state in an effect.
- **Extract a custom hook.** Move a cohesive effect (subscription, audio events, timers) to a `use*` hook in the slice's `model/`. The hook's own effects don't count against the host component's budget.
- **Move it out of React.** Bootstrap / wiring effects belong in `app/` setup.

Over-cap with no documented exception is a review FAIL.

## State management

**Zustand** for cross-component state. Stores live in the owning entity's `model/` segment. Use `devtools` middleware for Redux DevTools support:

```ts
// entities/Player/model/playerStore.ts
import { createPersistedStore } from '@/shared/store'

type PlayerState = {
  currentTrackId: string | null
  isPlaying: boolean
  play: (id: string) => void
  pause: () => void
}

export const usePlayerStore = createPersistedStore<PlayerState>({
  name: 'player',
  initializer: (set) => ({
    currentTrackId: null,
    isPlaying: false,
    play: (id) => set({ currentTrackId: id, isPlaying: true }),
    pause: () => set({ isPlaying: false }),
  }),
})
```

Use selectors to prevent unnecessary re-renders:
```ts
const isPlaying = usePlayerStore((s) => s.isPlaying)
```

The web player uses Zustand only for cross-component client state. Do not add Redux state.

### Zustand store contract

- One concrete store per owning feature/entity.
- File: `<slice>/model/<name>Store.ts`; hook: `use<Name>Store`.
- Select narrow state with selector functions; do not subscribe to the whole store.
- Persistence is opt-in and defines `partialize`.
- Server state remains in React Query.
- Auth-bound state exposes `reset()` and registers it through
  `registerStoreReset`.
- `shared/store/` contains generic factories/registries only.

**React Query** via `useQuery`/`useMutation` from `@/shared/api/client/reactQueryClient` for server state. Never fetch inside `useEffect` when React Query can handle it.

## Component props

Always a named `type` alias — `<ComponentName>Props` — never inline shapes in the signature:

```tsx
// Bad
export function Badge({ label, variant }: { label: string; variant: 'primary' | 'secondary' }) { ... }

// Good
export type BadgeProps = {
  label: string
  variant: 'primary' | 'secondary'
}
export function Badge({ label, variant }: BadgeProps) { ... }
```

## Component size and decomposition

See `code-principles.md` for the full rules. In short:
- **≤ 100 logic lines per `.tsx`** — over the limit, decompose into co-located subcomponents.
- **≤ 5 own declared props** — over the limit, split the component or group cohesive props.
- Decompose **as you build**, not later.

## Styling

- Tailwind v4 utility classes.
- Design tokens from `@spotify/ui-react` CSS variables. No hardcoded hex.
- `cn()` from `@spotify/ui-react` for conditional class merging.
- CVA (`class-variance-authority`) for variant components.

```tsx
import { cn } from '@spotify/ui-react'

<div className={cn('rounded-lg p-4', isActive && 'ring-2 ring-primary')} />
```

See `styling.md` for the full CVA pattern and forbidden patterns.

## Accessibility baseline

- Interactive elements are semantic: `<button>` for actions, `<a>` for navigation. Never `<div onClick>`.
- Inputs have an associated `<label>` (via `htmlFor` or wrapping).
- Icon-only buttons carry `aria-label`.
- Color alone never conveys meaning — pair with text, icon, or pattern.
- Keyboard behaviour matches the native control or WAI-ARIA pattern.
- Overlays restore focus to their trigger.
- Respect `prefers-reduced-motion`.
- Interactive targets are at least 24 × 24 CSS px or equivalently spaced.
- Layout remains usable at 320 CSS px and 400% zoom.

Full contract: `apps/docs/docs/brand/a11y.md`.

## Routing

```tsx
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'

<Link href={ROUTES.ALBUM(album.id)}>{album.title}</Link>
```

Never inline path strings at `<Link>` or `router.push()` call sites.

Route `page.tsx` files are framework adapters: read params/search/server data and render a
view from `@/views`. Full-screen composition does not live directly in route files.
Framework-required default exports are allowed at this boundary.

## Error and loading boundaries

- Use Next.js `error.tsx`, `loading.tsx`, Suspense, or a query boundary at the nearest useful
  ownership level.
- Extract repeated loading/error branches instead of duplicating them across siblings.
- User-facing errors are actionable and do not expose raw transport details.

## Performance and memoisation

- Measure before adding `memo`, `useMemo`, or `useCallback`.
- Do not memoise trivial expressions.
- Stable callbacks are justified by memoised children or external subscriptions.
- Prefer store selectors and component boundaries over broad memoisation.
