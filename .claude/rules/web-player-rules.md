---
name: web-player-rules
description: Next.js App Router + FSD quick reference for apps/web-player — layer anatomy, the openapi-fetch/React Query API client, Zustand state, Server vs Client components, and the ROUTES routing convention. Use whenever writing or reviewing a component, hook, store, or route file under apps/web-player/src/, or whenever asked to add a page, feature, or piece of client state to the web player.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Web-player rules — Next.js App Router + FSD

Quick reference for `apps/web-player/`. Read `project-conventions` first for the
cross-cutting picture; this file goes one level deeper on the web player specifically.
For the FSD layer table, the cross-layer import permission matrix, the public-API barrel
rule, and when to lift code down the stack, see `.claude/rules/fsd-web-player.md` — this
file doesn't restate that, only what's specific to web-player beyond FSD itself: the API
client, state management, component conventions, and routing below.

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

Use `useQuery`/`useMutation` from `reactQueryClient`. Types come from `@bitrate/contracts`.

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
- Tailwind v4 + design tokens from `@bitrate/ui-react`.
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

- `fsd-web-player` — the FSD layer table, import permission matrix, and public-API barrel
  rule this file assumes.
- `fsd` — scaffolds new `features/`/`entities/` slices that follow that layer anatomy.
- `vitest`, `playwright` skills — test layers for this app; `testing.md` routes
  between them.
- `project-conventions` — the cross-cutting rules this file specializes.
