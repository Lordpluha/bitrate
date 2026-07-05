---
name: web-player-rules
description: Next.js App Router + FSD quick reference for apps/web-player — layer anatomy, the openapi-fetch/React Query API client, Zustand state, Server vs Client components, and the ROUTES routing convention. Use whenever writing or reviewing a component, hook, store, or route file under apps/web-player/src/, or whenever asked to add a page, feature, or piece of client state to the web player.
metadata:
  type: reference
  author: lordpluha
---

# Web-player rules — Next.js App Router + FSD

Quick reference for `apps/web-player/`. Read `project-conventions` first for the cross-cutting picture; this file goes one level deeper on the web player specifically.

## FSD layer anatomy

```
src/
  app/         Next.js App Router — layout.tsx, page.tsx, _provider.tsx, route groups
  views/       Full-page compositions — assemble widgets/features for one route
  widgets/     Self-contained sections: Header, Player, LeftSidebar, RightSidebar
  features/    User interactions: Album, AuthModal, Playlist, Track, SwitchTheme, User
  entities/    Domain: Track, User, Player — data shapes, stores, query hooks
  shared/
    api/        openapi-fetch client + React Query wrapper
    hooks/      Cross-cutting hooks
    store/      Generic Zustand factory and reset registry
    ui/         Shared components
    routes/     ROUTES constant
    constants/  App-wide constants
    validation/ Shared Zod schemas
```

Layer order (imports flow downward only):
`app → views → widgets → features → entities → shared`

## Path alias

`"@*": ["./src/*"]` in tsconfig. All intra-src imports use `@/`:

```ts
import { usePlayerStore } from '@/entities/Player'
import { ROUTES } from '@/shared/routes'
```

No relative imports (`./`, `../`) across slice boundaries.

## API client

```ts
// shared/api/client/fetchClient.ts — openapi-fetch + JWT refresh middleware
export const apiClient = createClient<ApiPaths>({ baseUrl: ... })

// shared/api/client/reactQueryClient.ts — openapi-react-query
export const { useQuery, useMutation, useSuspenseQuery } = createReactQueryClient(apiClient)
```

Use `useQuery`/`useMutation` from `reactQueryClient`. Types come from `@spotify/contracts`.

## State

**Zustand** for cross-component state. Stores live in `entities/<name>/model/<name>Store.ts`. Use `devtools` middleware.

```ts
// entities/Player/model/playerStore.ts
import { createPersistedStore } from '@/shared/store'

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

`shared/store/createPersistedStore.ts` provides the canonical middleware/persistence
factory; `resetStores.ts` clears auth-bound stores. The web player uses Zustand only for
cross-component client state.

**React Query** for server state — never `useEffect` for fetching.

## Components

- Function components, named exports only.
- `import { useState } from 'react'` — never `React.useState`.
- Tailwind v4 + design tokens from `@spotify/ui-react`.
- `cn()` for conditional classes.

## Server vs Client components

Default: Server Component. Add `'use client'` only for hooks / browser APIs / event handlers. Fetch data in Server Components; interactive parts in Client Components.

## Routing

```ts
// shared/routes/index.ts
export const ROUTES = {
  HOME: '/',
  ALBUM: (id: string) => `/album/${id}`,
} as const
```

Use `ROUTES` at every `<Link href={...}>` and `router.push(...)` — never inline strings.

## Related rules and skills

- `fsd-scaffold` — scaffolds new `features/`/`entities/` slices that follow this layer anatomy.
- `vitest-rules`, `playwright-rules` — test layers for this app.
- `project-conventions` — the cross-cutting rules this file specializes.
